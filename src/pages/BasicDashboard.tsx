import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { useCountdown } from '../hooks/useCountdown';
import AlertBanner from '../components/AlertBanner';
import StatusTag from '../components/StatusTag';
import type { Task, Booking, ActiveBooking } from '../types';

interface ActiveBookingCardProps {
  booking: ActiveBooking;
  onSubmit: (bookingId: string, replyUrl: string, note?: string) => Promise<void>;
  onCancel: (taskId: string) => Promise<void>;
  isLoading: boolean;
  onExpire: () => void;
}

function ActiveBookingCard({ booking, onSubmit, onCancel, isLoading, onExpire }: ActiveBookingCardProps) {
  const [replyUrl, setReplyUrl] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const timeRemaining = useCountdown(
    booking.status_id === 'incomplete' && !booking.assigned_to
      ? booking.booked_at
      : null
  );

  useEffect(() => {
    if (timeRemaining === 'Expired') {
      onExpire();
    }
  }, [timeRemaining, onExpire]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyUrl) {
      setFormError('Please enter your Reddit reply URL.');
      return;
    }
    setFormError(null);
    try {
      await onSubmit(booking.id, replyUrl, note || undefined);
      setReplyUrl('');
      setNote('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit task.');
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this booking? This will return the task to the available list and restore the quota.')) {
      try {
        setFormError(null);
        await onCancel(booking.id);
      } catch (err: any) {
        setFormError(err.message || 'Failed to cancel booking.');
      }
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <StatusTag status={booking.status_id} />
        {booking.status_id === 'incomplete' && !booking.assigned_to && (
          <span style={{ fontSize: '0.9rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>
            Time Left: {timeRemaining}
          </span>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          {booking.subreddit ? `r/${booking.subreddit}` : 'Direct Link'}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {booking.client_request}
        </p>

        {booking.url && (
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Reddit URL:
            </span>
            <br />
            <a
              href={booking.url}
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                wordBreak: 'break-all',
              }}
            >
              {booking.url}
            </a>
          </div>
        )}
      </div>

      {formError && (
        <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          {formError}
        </div>
      )}

      {booking.status_id === 'incomplete' ? (
        <form onSubmit={handleSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div className="form-group">
            <label htmlFor={`replyUrl-${booking.id}`}>Reddit Reply URL</label>
            <input
              id={`replyUrl-${booking.id}`}
              type="url"
              className="form-input"
              placeholder="https://reddit.com/r/subreddit/comments/..."
              value={replyUrl}
              onChange={(e) => setReplyUrl(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor={`submitNote-${booking.id}`}>Note (Optional)</label>
            <textarea
              id={`submitNote-${booking.id}`}
              className="form-input"
              style={{ resize: 'vertical', minHeight: '60px' }}
              placeholder="Add any notes about your post here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={isLoading}
            >
              Submit Completed Task
            </button>
            <button
              type="button"
              className="btn btn-danger"
              style={{ width: '100%' }}
              disabled={isLoading}
              onClick={handleCancel}
            >
              Cancel Booking (Second-Thought)
            </button>
          </div>
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
            Awaiting Admin validation. You can book other available tasks.
          </p>
        </div>
      )}
    </div>
  );
}

export default function BasicDashboard() {
  const [basicTab, setBasicTab] = useState<'tasks' | 'earnings'>('tasks');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Task states
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([]);

  // Pagination states
  const [tasksPage, setTasksPage] = useState(1);

  // Reset page when tab changes
  useEffect(() => {
    setTasksPage(1);
  }, [basicTab]);

  // Earnings states
  const [earningsHistory, setEarningsHistory] = useState<Booking[]>([]);
  const [paidBalance, setPaidBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);

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
      setActiveBookings(tasksData.active || []);
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
  const handleFormSubmit = async (taskId: string, replyUrl: string, note?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await taskService.submit(taskId, replyUrl, note);
      setSuccessMsg('Submission sent successfully! Awaiting Admin approval.');
      loadData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit task.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel booking
  const handleCancelBooking = async (taskId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await taskService.cancel(taskId);
      setSuccessMsg('Booking cancelled successfully! The task is back in the available list.');
      loadData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to cancel booking.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const incompleteCount = activeBookings.filter(b => b.status_id === 'incomplete').length;

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
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Available Tasks ({availableTasks.length})</h2>

            <AlertBanner
              type="warning"
              message="Safety Warning: Do not perform these tasks too frequently, as it may put your account at risk of being banned. Increase your organic activity on Reddit (commenting, voting) to mitigate this risk."
            />

            {availableTasks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                No tasks currently available. Check back later!
              </p>
            ) : (() => {
              const totalPages = Math.ceil(availableTasks.length / 5);
              const currentPage = Math.max(1, Math.min(tasksPage, totalPages || 1));
              const displayedTasks = availableTasks.slice((currentPage - 1) * 5, currentPage * 5);
              return (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {displayedTasks.map((task) => (
                      <div key={task.id} className="glass-card compact-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                            {task.subreddit ? `r/${task.subreddit}` : 'Direct Link'}
                          </span>
                          <span style={{ fontWeight: '600', color: 'var(--color-success)', fontSize: '0.95rem' }}>
                            ${parseFloat(task.price).toFixed(2)}
                          </span>
                        </div>
                        <p
                          className="line-clamp-2"
                          title={task.client_request}
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.5rem',
                          }}
                        >
                          {task.client_request}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Quota: <strong>{task.quota}</strong> | Type: <strong>{task.type_name}</strong>
                          </span>
                          <button
                            onClick={() => handleBookTask(task.id)}
                            className="btn btn-primary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px' }}
                            disabled={isLoading || incompleteCount >= 2}
                          >
                            Book Task
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="pagination-container">
                      <button
                        type="button"
                        className="pagination-btn"
                        disabled={currentPage === 1}
                        onClick={() => setTasksPage(currentPage - 1)}
                      >
                        Prev
                      </button>
                      <span className="pagination-info">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        type="button"
                        className="pagination-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setTasksPage(currentPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Right Column: My Task (Active Booked Task) */}
          <div className="glass-panel" style={{ padding: '1.75rem', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>My Tasks</h2>

            {activeBookings.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                You have no active tasks. Book up to 2 from the available list!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activeBookings.map((booking) => (
                  <ActiveBookingCard
                    key={booking.booking_id}
                    booking={booking}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancelBooking}
                    isLoading={isLoading}
                    onExpire={loadData}
                  />
                ))}
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
