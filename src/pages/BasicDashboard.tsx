import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../lib/api';
import { useCountdown } from '../hooks/useCountdown';
import AlertBanner from '../components/AlertBanner';
import StatusTag from '../components/StatusTag';
import type { Task, Booking, ActiveBooking } from '../lib/types';

export default function BasicDashboard() {
  const [basicTab, setBasicTab] = useState<'tasks' | 'earnings'>('tasks');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Task states
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);

  // Earnings states
  const [earningsHistory, setEarningsHistory] = useState<Booking[]>([]);
  const [paidBalance, setPaidBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);

  // Submit form states
  const [submitReplyUrl, setSubmitReplyUrl] = useState('');
  const [submitNote, setSubmitNote] = useState('');

  // Countdown timer
  const timeRemaining = useCountdown(
    activeBooking?.status_id === 'incomplete' ? activeBooking.booked_at : null
  );

  // Load all dashboard data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      const [tasksData, earningsData] = await Promise.all([
        taskService.getAvailable(),
        taskService.getEarnings(),
      ]);

      setAvailableTasks(tasksData.available);
      setActiveBooking(tasksData.active);
      setEarningsHistory(earningsData.history);
      setPaidBalance(earningsData.paidBalance);
      setPendingBalance(earningsData.pendingBalance);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to sync dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload when countdown expires
  useEffect(() => {
    if (timeRemaining === 'Expired') loadData();
  }, [timeRemaining, loadData]);

  // Book task
  const handleBookTask = async (taskId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await taskService.book(taskId);
      setSuccessMsg('Task booked successfully! Go to My Task to perform it.');
      loadData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to book task.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit task
  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitReplyUrl) {
      setErrorMsg('Please enter your Reddit reply URL.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await taskService.submit(activeBooking!.id, submitReplyUrl, submitNote || undefined);
      setSuccessMsg('Submission sent successfully! Awaiting Admin approval.');
      setSubmitReplyUrl('');
      setSubmitNote('');
      loadData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit task.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {errorMsg && <AlertBanner type="error" message={errorMsg} />}
      {successMsg && <AlertBanner type="success" message={successMsg} />}

      <div className="tab-container">
        <button
          onClick={() => setBasicTab('tasks')}
          className={`tab-btn ${basicTab === 'tasks' ? 'active' : ''}`}
        >
          Tasks Dashboard
        </button>
        <button
          onClick={() => setBasicTab('earnings')}
          className={`tab-btn ${basicTab === 'earnings' ? 'active' : ''}`}
        >
          My Earnings
        </button>
      </div>

      {basicTab === 'tasks' ? (
        <div className="grid-2">
          {/* Left Column: Available Tasks */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Available Tasks</h2>

            <AlertBanner
              type="warning"
              message="Safety Warning: Do not perform these tasks too frequently, as it may put your account at risk of being banned. Increase your organic activity on Reddit (commenting, voting) to mitigate this risk."
            />

            {availableTasks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                No tasks currently available. Check back later!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {availableTasks.map((task) => (
                  <div key={task.id} className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                        {task.subreddit ? `r/${task.subreddit}` : 'Direct Link'}
                      </span>
                      <span style={{ fontWeight: '600', color: 'var(--color-success)' }}>
                        ${parseFloat(task.price).toFixed(2)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      {task.client_request}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Quota: <strong>{task.quota}</strong> | Type: <strong>{task.type_name}</strong>
                      </span>
                      <button
                        onClick={() => handleBookTask(task.id)}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        disabled={isLoading || activeBooking !== null}
                      >
                        Book Task
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: My Task (Active Booked Task) */}
          <div className="glass-panel" style={{ padding: '1.75rem', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>My Task</h2>

            {!activeBooking ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                You have no active task. Book one from the available list!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StatusTag status={activeBooking.status_id} />
                  {activeBooking.status_id === 'incomplete' && (
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>
                      Time Left: {timeRemaining}
                    </span>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    {activeBooking.subreddit ? `r/${activeBooking.subreddit}` : 'Direct Link'}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {activeBooking.client_request}
                  </p>

                  {activeBooking.url && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Reddit URL:
                      </span>
                      <br />
                      <a
                        href={activeBooking.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: 'var(--color-primary)',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          wordBreak: 'break-all',
                        }}
                      >
                        {activeBooking.url}
                      </a>
                    </div>
                  )}
                </div>

                {activeBooking.status_id === 'incomplete' ? (
                  <form
                    onSubmit={handleSubmitTask}
                    style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}
                  >
                    <div className="form-group">
                      <label htmlFor="replyUrl">Reddit Reply URL</label>
                      <input
                        id="replyUrl"
                        type="url"
                        className="form-input"
                        placeholder="https://reddit.com/r/subreddit/comments/..."
                        value={submitReplyUrl}
                        onChange={(e) => setSubmitReplyUrl(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="submitNote">Note (Optional)</label>
                      <textarea
                        id="submitNote"
                        className="form-input"
                        style={{ resize: 'vertical', minHeight: '60px' }}
                        placeholder="Add any notes about your post here..."
                        value={submitNote}
                        onChange={(e) => setSubmitNote(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      disabled={isLoading}
                    >
                      Submit Completed Task
                    </button>
                  </form>
                ) : (
                  <div
                    style={{
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '1rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      textAlign: 'center',
                    }}
                  >
                    <p>
                      Awaiting Admin validation. You cannot take other tasks until this is approved
                      or rejected.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Earnings Tab */
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div
              className="glass-card"
              style={{
                padding: '1.5rem',
                flex: '1',
                minWidth: '180px',
                borderLeft: '4px solid var(--color-success)',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Paid Earned Balance
              </span>
              <h2 style={{ fontSize: '2rem', color: 'var(--color-success)', marginTop: '0.5rem' }}>
                ${paidBalance.toFixed(2)}
              </h2>
            </div>
            <div
              className="glass-card"
              style={{
                padding: '1.5rem',
                flex: '1',
                minWidth: '180px',
                borderLeft: '4px solid var(--color-warning)',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Pending Earned Balance
              </span>
              <h2 style={{ fontSize: '2rem', color: 'var(--color-warning)', marginTop: '0.5rem' }}>
                ${pendingBalance.toFixed(2)}
              </h2>
            </div>
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Task Completion History</h3>
          <div className="table-container">
            {earningsHistory.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
                No completed tasks yet.
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Subreddit</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Date Completed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earningsHistory.map((row) => (
                    <tr key={row.booking_id}>
                      <td style={{ fontWeight: 'bold' }}>{row.subreddit ? `r/${row.subreddit}` : 'Direct Link'}</td>
                      <td>{row.type_name}</td>
                      <td style={{ color: 'var(--color-success)', fontWeight: '600' }}>
                        ${parseFloat(row.price).toFixed(2)}
                      </td>
                      <td>{new Date(row.updated_at).toLocaleDateString()}</td>
                      <td>
                        <StatusTag status={row.status_id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
