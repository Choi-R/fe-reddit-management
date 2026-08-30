import { useState, useEffect, useCallback } from 'react';
import type { TaskHistoryEntry } from '../../types';
import { adminService } from '../../services/adminService';
import StatusTag from '../common/StatusTag';

interface TaskingHistoryTabProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setErrorMsg: (msg: string | null) => void;
  setSuccessMsg: (msg: string | null) => void;
  onRefreshData?: () => void;
}

const ALL_STATUSES = [
  { id: 'pending', label: 'Pending', color: 'var(--color-warning, #f59e0b)' },
  { id: 'success', label: 'Success', color: 'var(--color-success, #10b981)' },
  { id: 'failed', label: 'Failed', color: 'var(--color-danger, #ef4444)' },
  { id: 'paid', label: 'Paid', color: '#3b82f6' },
  { id: 'incomplete', label: 'Incomplete', color: '#6b7280' },
];

export default function TaskingHistoryTab({
  isLoading,
  setIsLoading,
  setErrorMsg,
  setSuccessMsg,
  onRefreshData,
}: TaskingHistoryTabProps) {
  // Selected statuses filter state (empty = all)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [statusCounts, setStatusCounts] = useState<{
    incomplete: number;
    pending: number;
    success: number;
    paid: number;
    failed: number;
    total: number;
  }>({
    incomplete: 0,
    pending: 0,
    success: 0,
    paid: 0,
    failed: 0,
    total: 0,
  });

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Review state for pending submissions
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getTaskHistory({
        statuses: selectedStatuses,
        search: searchTerm,
      });
      setHistory(res.history || []);
      if (res.statusCounts) {
        setStatusCounts(res.statusCounts);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to fetch task history.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatuses, searchTerm, setIsLoading, setErrorMsg]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedStatuses, searchTerm]);

  const toggleStatus = (statusId: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(statusId) ? prev.filter((s) => s !== statusId) : [...prev, statusId]
    );
  };

  const handleSelectAll = () => setSelectedStatuses([]);
  const handlePendingAndSuccess = () => setSelectedStatuses(['pending', 'success']);
  const handleExcludeFailed = () => setSelectedStatuses(['incomplete', 'pending', 'success', 'paid']);
  const handleFailuresOnly = () => setSelectedStatuses(['failed']);

  const handleReview = async (bookingId: string, statusId: 'success' | 'failed') => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    const adminNote = reviewNotes[bookingId] || null;
    try {
      const data = await adminService.reviewSubmission(bookingId, statusId, adminNote);
      if (statusId === 'failed' && data.quotaReturned) {
        setSuccessMsg('Submission rejected as Failed. Task quota was returned by 1.');
      } else {
        setSuccessMsg(`Submission marked as ${statusId === 'success' ? 'Approved' : 'Failed'}.`);
      }
      setReviewingId(null);
      setReviewNotes((prev) => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });
      fetchHistory();
      if (onRefreshData) onRefreshData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit review.');
    } finally {
      setIsLoading(false);
    }
  };

  // ponytail: client-side slicing ceiling is ~1,000 records. Upgrade path: add page/limit params to adminService.getTaskHistory backend query when table size exceeds ceiling.
  const totalPages = Math.ceil(history.length / pageSize) || 1;
  const paginatedHistory = history.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      {/* Header & Description */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Tasking Execution History</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Real-time log of all user bookings, submissions, reviews, and failures across the platform. Sorted by latest entry.
        </p>
      </div>

      {/* Summary Counts Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        <div
          className="glass-card"
          style={{ padding: '0.75rem 1.25rem', flex: '1', minWidth: '120px', borderLeft: '4px solid var(--primary-color, #6366f1)' }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Executions</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{statusCounts.total}</div>
        </div>

        {ALL_STATUSES.map((st) => {
          const count = (statusCounts as any)[st.id] || 0;
          return (
            <div
              key={st.id}
              className="glass-card"
              style={{
                padding: '0.75rem 1.25rem',
                flex: '1',
                minWidth: '110px',
                borderLeft: `4px solid ${st.color}`,
                cursor: 'pointer',
                opacity: selectedStatuses.length === 0 || selectedStatuses.includes(st.id) ? 1 : 0.5,
              }}
              onClick={() => toggleStatus(st.id)}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{st.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: st.color }}>{count}</div>
            </div>
          );
        })}
      </div>

      {/* Filters Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1.5rem',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
        }}
      >
        {/* Status Multi-Select Pills */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Filter Statuses (Multiple Selection):
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {ALL_STATUSES.map((st) => {
              const isSelected = selectedStatuses.includes(st.id);
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => toggleStatus(st.id)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '20px',
                    border: `1px solid ${isSelected ? st.color : 'var(--border-color, rgba(255,255,255,0.2))'}`,
                    background: isSelected ? st.color : 'transparent',
                    color: isSelected ? '#fff' : 'var(--text-primary)',
                    fontWeight: isSelected ? '600' : 'normal',
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isSelected ? '#fff' : st.color,
                    }}
                  />
                  {st.label} {isSelected && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Filter Presets & Search */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Quick Presets */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Presets:</span>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              onClick={handleSelectAll}
            >
              All Statuses
            </button>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              onClick={handlePendingAndSuccess}
            >
              Pending & Success
            </button>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              onClick={handleExcludeFailed}
            >
              Exclude Failed
            </button>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              onClick={handleFailuresOnly}
            >
              Failures Only
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '1', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Search user, subreddit, URL, note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 2rem 0.45rem 0.75rem',
                fontSize: '0.85rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input, rgba(0,0,0,0.2))',
                color: 'var(--text-primary)',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* History Table */}
      {isLoading && history.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
          Loading tasking history...
        </p>
      ) : paginatedHistory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.1rem', margin: 0 }}>No task execution records found matching your filters.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Try resetting filters or searching with a different keyword.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem' }}>Date & Time (Latest)</th>
                <th style={{ padding: '0.75rem' }}>User</th>
                <th style={{ padding: '0.75rem' }}>Platform & Target</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Proof / Notes</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHistory.map((item) => {
                const isPending = item.status_id === 'pending';
                const isReviewing = reviewingId === item.booking_id;

                return (
                  <tr
                    key={item.booking_id}
                    style={{
                      borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.05))',
                      verticalAlign: 'top',
                    }}
                  >
                    {/* Timestamp */}
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: '600' }}>
                        {new Date(item.updated_at).toLocaleDateString()}{' '}
                        {new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Booked: {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    {/* User */}
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.user_email || 'Unknown'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Reddit: <span style={{ color: 'var(--primary-color, #6366f1)' }}>u/{item.user_reddit || '-'}</span>
                      </div>
                      {item.user_nickname && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Nick: {item.user_nickname}
                        </div>
                      )}
                    </td>

                    {/* Task details */}
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem', maxWidth: '240px' }}>
                      <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.6rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            background: item.platform === 'PRODUCTHUNT' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 107, 53, 0.15)',
                            color: item.platform === 'PRODUCTHUNT' ? '#fbbf24' : '#ff6b35',
                            padding: '0.1rem 0.3rem',
                            borderRadius: '3px',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {item.platform || 'REDDIT'}
                        </span>
                        {(item.target_subreddit || item.subreddit) ? `${item.platform === 'PRODUCTHUNT' ? '' : 'r/'}${item.target_subreddit || item.subreddit}` : 'Direct Link'}
                        <span style={{ marginLeft: '0.5rem', color: 'var(--color-success)', fontWeight: '600' }}>
                          ${parseFloat(item.price).toFixed(2)}
                        </span>
                      </div>
                      {item.task_url && (
                        <a
                          href={item.task_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            textDecoration: 'underline',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '220px',
                          }}
                        >
                          {item.task_url}
                        </a>
                      )}
                      {item.client_request && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            marginTop: '0.25rem',
                            fontStyle: 'italic',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                          title={item.client_request}
                        >
                          "{item.client_request}"
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '0.75rem' }}>
                      <StatusTag status={item.status_id} />
                    </td>

                    {/* Proof & Notes */}
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem', maxWidth: '280px' }}>
                      {item.reply_url ? (
                        <a
                          href={item.reply_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: '#3b82f6',
                            fontWeight: '500',
                            textDecoration: 'underline',
                            wordBreak: 'break-all',
                            display: 'block',
                            marginBottom: '0.25rem',
                          }}
                        >
                          🔗 View Proof URL
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No reply URL submitted</span>
                      )}

                      {item.note && (
                        <div style={{ fontSize: '0.78rem', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                          <strong>User Note:</strong> {item.note}
                        </div>
                      )}

                      {item.admin_note && (
                        <div
                          style={{
                            fontSize: '0.78rem',
                            marginTop: '0.25rem',
                            color: item.status_id === 'failed' ? 'var(--color-danger)' : 'var(--color-success)',
                            background: 'rgba(0,0,0,0.2)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                          }}
                        >
                          <strong>Admin Feedback:</strong> {item.admin_note}
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td style={{ padding: '0.75rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {isPending ? (
                        <div>
                          {!isReviewing ? (
                            <button
                              className="btn btn-primary"
                              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                              onClick={() => setReviewingId(item.booking_id)}
                            >
                              Review Submission
                            </button>
                          ) : (
                            <div
                              style={{
                                background: 'var(--bg-card, rgba(0,0,0,0.3))',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                minWidth: '200px',
                              }}
                            >
                              <input
                                type="text"
                                placeholder="Admin feedback note (optional)..."
                                value={reviewNotes[item.booking_id] || ''}
                                onChange={(e) =>
                                  setReviewNotes((prev) => ({ ...prev, [item.booking_id]: e.target.value }))
                                }
                                style={{
                                  width: '100%',
                                  fontSize: '0.75rem',
                                  padding: '0.3rem',
                                  marginBottom: '0.5rem',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border-color)',
                                }}
                              />
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                <button
                                  className="btn btn-success"
                                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                  onClick={() => handleReview(item.booking_id, 'success')}
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn btn-danger"
                                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                  onClick={() => handleReview(item.booking_id, 'failed')}
                                >
                                  Reject
                                </button>
                                <button
                                  className="btn btn-secondary"
                                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                  onClick={() => setReviewingId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, history.length)} of {history.length} entries
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.85rem', alignSelf: 'center', padding: '0 0.5rem' }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
