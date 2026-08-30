import { useState, useEffect, useCallback } from 'react';
import type { TaskHistoryEntry } from '../../types';
import { taskService } from '../../services/taskService';
import StatusTag from '../common/StatusTag';

const ALL_STATUSES = [
  { id: 'pending', label: 'Pending Review', color: 'var(--color-warning, #f59e0b)' },
  { id: 'success', label: 'Approved (Pending Payout)', color: 'var(--color-success, #10b981)' },
  { id: 'paid', label: 'Paid Out', color: '#3b82f6' },
  { id: 'failed', label: 'Failed', color: 'var(--color-danger, #ef4444)' },
  { id: 'incomplete', label: 'Incomplete / Booked', color: '#6b7280' },
];

type PlatformFilter = 'ALL' | 'REDDIT' | 'PRODUCTHUNT';

export default function UserTaskHistoryTab() {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('ALL');
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await taskService.getTaskHistory({
        statuses: selectedStatuses,
        search: searchTerm,
      });
      setHistory(res.history || []);
      if (res.statusCounts) {
        setStatusCounts(res.statusCounts);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to fetch your task history.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatuses, searchTerm]);

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
  const handleCompletedAndPaid = () => setSelectedStatuses(['success', 'paid']);
  const handleFailedOnly = () => setSelectedStatuses(['failed']);

  // ponytail: client-side slicing ceiling is ~1,000 records. Upgrade path: add page/limit params to taskService.getTaskHistory backend query when table size exceeds ceiling.
  const filteredByPlatform = platformFilter === 'ALL'
    ? history
    : history.filter((h) => h.platform === platformFilter);
  const totalPages = Math.ceil(filteredByPlatform.length / pageSize) || 1;
  const paginatedHistory = filteredByPlatform.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>My Tasking History</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Track your task bookings, pending reviews, earnings, and admin feedback. Sorted by latest entry.
        </p>
      </div>

      {/* Summary Counts */}
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
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Tasks</div>
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
            Filter by Status (Select multiple):
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

        {/* Presets & Search */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Platform:</span>
            {(['ALL', 'REDDIT', 'PRODUCTHUNT'] as PlatformFilter[]).map((pf) => (
              <button
                key={pf}
                type="button"
                onClick={() => setPlatformFilter(pf)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: `1px solid ${platformFilter === pf ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  background: platformFilter === pf ? 'var(--color-primary)' : 'transparent',
                  color: platformFilter === pf ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                }}
              >
                {pf === 'ALL' ? 'All' : pf === 'REDDIT' ? 'Reddit' : 'ProductHunt'}
              </button>
            ))}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>| Presets:</span>
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
              Pending & Approved
            </button>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              onClick={handleCompletedAndPaid}
            >
              Earned / Paid
            </button>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              onClick={handleFailedOnly}
            >
              Failed Only
            </button>
          </div>

          <div style={{ position: 'relative', minWidth: '240px', flex: '1', maxWidth: '380px' }}>
            <input
              type="text"
              placeholder="Search target, reply URL, or note..."
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

      {errorMsg && (
        <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {errorMsg}
        </div>
      )}

      {/* History Table */}
      {isLoading && history.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
          Loading your task history...
        </p>
      ) : paginatedHistory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.1rem', margin: 0 }}>No task records found matching your active filters.</p>
        </div>
      ) : (
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem' }}>Platform & Target</th>
                <th style={{ padding: '0.75rem' }}>Payout Price</th>
                <th style={{ padding: '0.75rem' }}>Last Updated (Latest)</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Submitted Proof & Feedback</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHistory.map((item) => (
                <tr
                  key={item.booking_id}
                  style={{
                    borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.05))',
                    verticalAlign: 'top',
                  }}
                >
                  {/* Subreddit */}
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem', maxWidth: '240px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
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
                          marginTop: '0.2rem',
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

                  {/* Price */}
                  <td style={{ padding: '0.75rem', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
                    ${parseFloat(item.price).toFixed(2)}
                  </td>

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

                  {/* Status */}
                  <td style={{ padding: '0.75rem' }}>
                    <StatusTag status={item.status_id} />
                  </td>

                  {/* Proof & Admin Feedback */}
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem', maxWidth: '300px' }}>
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
                        🔗 View Your Submitted Link
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        {item.status_id === 'incomplete' ? 'Task booked. Pending proof submission.' : 'No link submitted'}
                      </span>
                    )}

                    {item.note && (
                      <div style={{ fontSize: '0.78rem', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                        <strong>Your Note:</strong> {item.note}
                      </div>
                    )}

                    {item.admin_note && (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          marginTop: '0.35rem',
                          color: item.status_id === 'failed' ? 'var(--color-danger)' : 'var(--color-success)',
                          background: 'rgba(0,0,0,0.2)',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '4px',
                          borderLeft: `3px solid ${item.status_id === 'failed' ? 'var(--color-danger)' : 'var(--color-success)'}`,
                        }}
                      >
                        <strong>Admin Feedback:</strong> {item.admin_note}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
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
