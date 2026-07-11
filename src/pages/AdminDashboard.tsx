import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../lib/api';
import AlertBanner from '../components/AlertBanner';
import StatusTag from '../components/StatusTag';
import type { Task, BasicUserSummary, PendingSubmission } from '../lib/types';

export default function AdminDashboard() {
  const [adminTab, setAdminTab] = useState<'tasks' | 'reviews' | 'payouts' | 'users'>('tasks');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data states
  const [adminTasks, setAdminTasks] = useState<Task[]>([]);
  const [adminUsers, setAdminUsers] = useState<BasicUserSummary[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);

  // Task form states
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskSubreddit, setNewTaskSubreddit] = useState('');
  const [newTaskUrl, setNewTaskUrl] = useState('');
  const [newTaskClientRequest, setNewTaskClientRequest] = useState('');
  const [newTaskQuota, setNewTaskQuota] = useState(1);
  const [newTaskPrice, setNewTaskPrice] = useState('');
  const [newTaskTypeId, setNewTaskTypeId] = useState('normal');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // User form states
  const [newBasicEmail, setNewBasicEmail] = useState('');
  const [newBasicPassword, setNewBasicPassword] = useState('');
  const [newBasicPaypal, setNewBasicPaypal] = useState('');
  const [newBasicReddit, setNewBasicReddit] = useState('');

  // Review note state
  const [reviewNote, setReviewNote] = useState('');

  // ─── Data Loaders ─────────────────────────────────────────────────

  const loadTabData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      if (adminTab === 'tasks') {
        const data = await adminService.getTasks();
        setAdminTasks(data.tasks);
        try {
          const usersData = await adminService.getUsers();
          setAdminUsers(usersData.users);
        } catch (usersErr) {
          console.warn('Failed to load users for assignment autocomplete:', usersErr);
        }
      } else if (adminTab === 'users' || adminTab === 'payouts') {
        const data = await adminService.getUsers();
        setAdminUsers(data.users);
      } else if (adminTab === 'reviews') {
        const data = await adminService.getPendingReviews();
        setPendingSubmissions(data.bookings || []);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to sync admin console.');
    } finally {
      setIsLoading(false);
    }
  }, [adminTab]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  // ─── Action Handlers ──────────────────────────────────────────────

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskUrl || !newTaskClientRequest || !newTaskPrice) {
      setErrorMsg('Reddit URL, request, and price are required.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const taskData = {
        subreddit: newTaskSubreddit || null,
        url: newTaskUrl,
        clientRequest: newTaskClientRequest,
        quota: parseInt(newTaskQuota.toString()),
        price: parseFloat(newTaskPrice),
        typeId: newTaskTypeId,
        assignedTo: newTaskAssignedTo || null,
        deadline: newTaskDeadline ? new Date(newTaskDeadline).toISOString() : null,
      };

      if (editingTask) {
        await adminService.updateTask(editingTask.id, taskData);
        setSuccessMsg('Task updated successfully!');
      } else {
        await adminService.createTask(taskData);
        setSuccessMsg('New task added successfully!');
      }

      setEditingTask(null);
      setNewTaskSubreddit('');
      setNewTaskUrl('');
      setNewTaskClientRequest('');
      setNewTaskQuota(1);
      setNewTaskPrice('');
      setNewTaskAssignedTo('');
      setNewTaskDeadline('');
      loadTabData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save task.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setNewTaskSubreddit('');
    setNewTaskUrl('');
    setNewTaskClientRequest('');
    setNewTaskQuota(1);
    setNewTaskPrice('');
    setNewTaskAssignedTo('');
    setNewTaskDeadline('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setNewTaskSubreddit(task.subreddit || '');
    setNewTaskUrl(task.url);
    setNewTaskClientRequest(task.client_request);
    setNewTaskQuota(task.quota);
    setNewTaskPrice(task.price);
    setNewTaskTypeId(task.type_id);
    setNewTaskAssignedTo(task.assigned_to_email || '');
    if (task.deadline) {
      setNewTaskDeadline(task.deadline.substring(0, 10));
    } else {
      setNewTaskDeadline('');
    }
    // Scroll form into view
    const formElement = document.getElementById('taskFormTitle');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task? This will also remove any bookings associated with it.')) {
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await adminService.deleteTask(taskId);
      setSuccessMsg('Task deleted successfully.');
      if (editingTask?.id === taskId) {
        handleCancelEdit();
      }
      loadTabData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete task.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBasicEmail || !newBasicPassword || !newBasicReddit) {
      setErrorMsg('Email, password, and reddit username are required.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await adminService.createUser({
        email: newBasicEmail,
        password: newBasicPassword,
        paypal: newBasicPaypal || null,
        reddit: newBasicReddit,
      });
      setSuccessMsg(`User ${newBasicEmail} registered successfully!`);
      setNewBasicEmail('');
      setNewBasicPassword('');
      setNewBasicPaypal('');
      setNewBasicReddit('');
      loadTabData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create user.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmission = async (bookingId: string, statusId: 'success' | 'failed') => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await adminService.reviewSubmission(bookingId, statusId, reviewNote || null);
      setSuccessMsg(`Task marked as ${statusId === 'success' ? 'Approved' : 'Failed'}.`);
      setReviewNote('');
      loadTabData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to review submission.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayout = async (userId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const data = await adminService.recordPayout(userId);
      setSuccessMsg(data.message || 'Payout recorded successfully.');
      loadTabData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to record payout.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get autocomplete user suggestions
  const getSuggestions = () => {
    const query = newTaskAssignedTo.trim().toLowerCase();
    if (query.length < 3) return [];

    const cleanQuery = query.replace(/^\/?u\//i, '');

    return adminUsers
      .filter((u) => {
        const emailMatch = u.email.toLowerCase().includes(cleanQuery);
        const redditMatch = u.reddit.toLowerCase().includes(cleanQuery);
        return emailMatch || redditMatch;
      })
      .slice(0, 3);
  };

  const suggestions = getSuggestions();

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div>
      {errorMsg && <AlertBanner type="error" message={errorMsg} />}
      {successMsg && <AlertBanner type="success" message={successMsg} />}

      <div className="tab-container">
        <button
          onClick={() => setAdminTab('tasks')}
          className={`tab-btn ${adminTab === 'tasks' ? 'active' : ''}`}
        >
          Tasks Listing
        </button>
        <button
          onClick={() => setAdminTab('reviews')}
          className={`tab-btn ${adminTab === 'reviews' ? 'active' : ''}`}
        >
          Pending Reviews
        </button>
        <button
          onClick={() => setAdminTab('payouts')}
          className={`tab-btn ${adminTab === 'payouts' ? 'active' : ''}`}
        >
          PayPal Payouts
        </button>
        <button
          onClick={() => setAdminTab('users')}
          className={`tab-btn ${adminTab === 'users' ? 'active' : ''}`}
        >
          User Management
        </button>
      </div>

      {/* ── Tasks Tab ──────────────────────────────────────────────── */}
      {adminTab === 'tasks' && (
        <div className="grid-2">
          {/* Add/Edit Task Form */}
          <div className="glass-panel" style={{ padding: '1.75rem', height: 'fit-content' }}>
            <h2 id="taskFormTitle" style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <form onSubmit={handleSaveTask}>
              <div className="form-group">
                <label htmlFor="taskSubreddit">Subreddit Name (Optional)</label>
                <input
                  id="taskSubreddit"
                  type="text"
                  className="form-input"
                  placeholder="reactjs (without r/)"
                  value={newTaskSubreddit}
                  onChange={(e) => setNewTaskSubreddit(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="taskUrl">Reddit URL (Post or Comment)*</label>
                <input
                  id="taskUrl"
                  type="url"
                  className="form-input"
                  placeholder="https://reddit.com/r/..."
                  value={newTaskUrl}
                  onChange={(e) => setNewTaskUrl(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="taskClientRequest">Client Request Instructions*</label>
                <textarea
                  id="taskClientRequest"
                  className="form-input"
                  style={{ resize: 'vertical', minHeight: '80px' }}
                  placeholder="Detailed tasks client instructions..."
                  value={newTaskClientRequest}
                  onChange={(e) => setNewTaskClientRequest(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1' }}>
                  <label htmlFor="taskQuota">Quota Slots*</label>
                  <input
                    id="taskQuota"
                    type="number"
                    min="1"
                    className="form-input"
                    value={newTaskQuota}
                    onChange={(e) => setNewTaskQuota(parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: '1' }}>
                  <label htmlFor="taskPrice">Price ($)*</label>
                  <input
                    id="taskPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-input"
                    placeholder="5.00"
                    value={newTaskPrice}
                    onChange={(e) => setNewTaskPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1' }}>
                  <label htmlFor="taskTypeId">Task Category*</label>
                  <select
                    id="taskTypeId"
                    className="form-input"
                    value={newTaskTypeId}
                    onChange={(e) => setNewTaskTypeId(e.target.value)}
                  >
                    <option value="normal">Normal</option>
                    <option value="edu_app">Edu App</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1', position: 'relative' }}>
                  <label htmlFor="taskAssignedTo">Assign User (Email or Reddit Username)</label>
                  <input
                    id="taskAssignedTo"
                    type="text"
                    className="form-input"
                    placeholder="user@example.com or reddit_user"
                    value={newTaskAssignedTo}
                    onChange={(e) => {
                      setNewTaskAssignedTo(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    autoComplete="off"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: '#111827',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        marginTop: '4px',
                        zIndex: 10,
                        boxShadow: 'var(--shadow-lg)',
                        overflow: 'hidden',
                      }}
                    >
                      {suggestions.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => {
                            setNewTaskAssignedTo(u.email);
                            setShowSuggestions(false);
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          style={{
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--border-color)',
                            fontSize: '0.85rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{u.email}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>u/{u.reddit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="taskDeadline">Hard Deadline Date (Optional)</label>
                <input
                  id="taskDeadline"
                  type="date"
                  className="form-input"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                />
              </div>

              {editingTask ? (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={isLoading}
                  >
                    Update Task
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={isLoading}
                >
                  Publish Task
                </button>
              )}
            </form>
          </div>

          {/* Tasks List */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Active Tasks</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
              {adminTasks.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                  No tasks found. Create one to begin!
                </p>
              ) : (
                adminTasks.map((task) => (
                  <div key={task.id} className="glass-card" style={{ padding: '1.25rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span style={{ fontWeight: 'bold' }}>
                        {task.subreddit ? `r/${task.subreddit}` : 'Direct Link'}
                      </span>
                      <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                        ${parseFloat(task.price).toFixed(2)}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {task.client_request}
                    </p>
                    <div
                      style={{
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '0.5rem',
                        marginTop: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span>
                        Quota: <strong>{task.quota}</strong> | Type:{' '}
                        <strong>{task.type_name}</strong>
                      </span>
                      <span>
                        Assigned: <strong>{task.assigned_to_email || 'None'}</strong>
                      </span>
                    </div>
                    <div
                      style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}
                    >
                      <StatusTag status="incomplete">Inc: {task.count_incomplete}</StatusTag>
                      <StatusTag status="pending">Pend: {task.count_pending}</StatusTag>
                      <StatusTag status="success">Succ: {task.count_success}</StatusTag>
                      <StatusTag status="paid">Paid: {task.count_paid}</StatusTag>
                      <StatusTag status="failed">Fail: {task.count_failed}</StatusTag>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        marginTop: '0.75rem',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '0.75rem',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <button
                        onClick={() => handleEditClick(task)}
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Reviews Tab ────────────────────────────────────────────── */}
      {adminTab === 'reviews' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Pending Task Validations</h2>

          <div className="form-group" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
            <label htmlFor="reviewNote">Review Feedback Note (Optional)</label>
            <input
              id="reviewNote"
              type="text"
              className="form-input"
              placeholder="Feedback message or reason for failure..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
          </div>

          {pendingSubmissions.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
              No pending submissions found. All caught up!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingSubmissions.map((sub) => (
                <div key={sub.booking_id} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '1rem' }}>User: {sub.user_email}</strong>
                      <br />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Reddit profile: <strong>u/{sub.user_reddit}</strong>
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                        r/{sub.subreddit}
                      </span>
                      <br />
                      <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>
                        ${parseFloat(sub.price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(0,0,0,0.15)',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      marginBottom: '1rem',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Submitted Link:
                    </span>
                    <br />
                    <a
                      href={sub.reply_url ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: 'var(--color-primary)',
                        wordBreak: 'break-all',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                      }}
                    >
                      {sub.reply_url}
                    </a>
                    {sub.note && (
                      <p
                        style={{
                          marginTop: '0.75rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          borderTop: '1px dashed var(--border-color)',
                          paddingTop: '0.5rem',
                        }}
                      >
                        User note: "{sub.note}"
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleReviewSubmission(sub.booking_id, 'failed')}
                      className="btn btn-danger"
                      disabled={isLoading}
                    >
                      Reject (Fail)
                    </button>
                    <button
                      onClick={() => handleReviewSubmission(sub.booking_id, 'success')}
                      className="btn btn-primary"
                      style={{ background: 'var(--color-success)', color: '#fff' }}
                      disabled={isLoading}
                    >
                      Approve (Success)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Payouts Tab ────────────────────────────────────────────── */}
      {adminTab === 'payouts' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>PayPal Payout Ledger</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Process user payments manually in PayPal, then click <strong>Mark as Paid</strong> to
            clear their balance and move tasks to Paid.
          </p>

          <div className="table-container">
            {adminUsers.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
                No users registered.
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>User Email</th>
                    <th>Reddit User</th>
                    <th>PayPal Account</th>
                    <th>Accumulated Pending Earnings</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.email}</td>
                      <td>u/{u.reddit}</td>
                      <td style={{ fontWeight: 'bold' }}>{u.paypal || 'Not set'}</td>
                      <td
                        style={{
                          color:
                            u.pendingBalance > 0
                              ? 'var(--color-warning)'
                              : 'var(--text-secondary)',
                          fontWeight: 'bold',
                        }}
                      >
                        ${u.pendingBalance.toFixed(2)}
                      </td>
                      <td>
                        <button
                          onClick={() => handleConfirmPayout(u.id)}
                          className="btn btn-primary"
                          style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.75rem',
                            background: 'var(--color-success)',
                          }}
                          disabled={isLoading || u.pendingBalance <= 0}
                        >
                          Mark as Paid
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Users Tab ──────────────────────────────────────────────── */}
      {adminTab === 'users' && (
        <div className="grid-2">
          {/* Register Form */}
          <div className="glass-panel" style={{ padding: '1.75rem', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Register Basic User</h2>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label htmlFor="regEmail">Email Address*</label>
                <input
                  id="regEmail"
                  type="email"
                  className="form-input"
                  placeholder="user@redditcrm.com"
                  value={newBasicEmail}
                  onChange={(e) => setNewBasicEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="regPass">Initial Password*</label>
                <input
                  id="regPass"
                  type="password"
                  className="form-input"
                  placeholder="Initial secure password (min 8 characters)"
                  value={newBasicPassword}
                  onChange={(e) => setNewBasicPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label htmlFor="regPaypal">PayPal Email address (Optional)</label>
                <input
                  id="regPaypal"
                  type="email"
                  className="form-input"
                  placeholder="paypal@example.com"
                  value={newBasicPaypal}
                  onChange={(e) => setNewBasicPaypal(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label htmlFor="regReddit">Reddit Username*</label>
                <input
                  id="regReddit"
                  type="text"
                  className="form-input"
                  placeholder="reddit_username"
                  value={newBasicReddit}
                  onChange={(e) => setNewBasicReddit(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={isLoading}
              >
                Register User
              </button>
            </form>
          </div>

          {/* Users List */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>User Profiles</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
              {adminUsers.map((u) => (
                <div key={u.id} className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{u.email}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Reddit: <strong>u/{u.reddit}</strong> | PayPal: <strong>{u.paypal || 'Not set'}</strong>
                  </div>
                  <div
                    style={{
                      borderTop: '1px solid var(--border-color)',
                      marginTop: '0.75rem',
                      paddingTop: '0.5rem',
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.75rem',
                    }}
                  >
                    <span style={{ color: 'var(--color-warning)' }}>
                      Pending: <strong>${u.pendingBalance.toFixed(2)}</strong>
                    </span>
                    <span style={{ color: 'var(--color-success)' }}>
                      Total Paid: <strong>${u.paidBalance.toFixed(2)}</strong>
                    </span>
                  </div>
                  <div
                    style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}
                  >
                    UUID: <code>{u.id}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
