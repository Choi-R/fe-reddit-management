import type { Task } from '../../types';

interface ArchivedTaskCardProps {
  task: Task;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRestore: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onPermanentDelete: (taskId: string) => void;
  isLoading: boolean;
}

export default function ArchivedTaskCard({
  task,
  isExpanded,
  onToggleExpand,
  onRestore,
  onEdit,
  onPermanentDelete,
  isLoading,
}: ArchivedTaskCardProps) {
  const getReasonBadgeStyle = (reason?: string) => {
    if (reason?.includes('Deleted by Admin')) {
      return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', icon: '🗑️' };
    }
    if (reason?.includes('Quota Depleted')) {
      return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b', icon: '📉' };
    }
    if (reason?.includes('Deadline')) {
      return { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', color: '#a855f7', icon: '⏰' };
    }
    if (reason?.includes('Failures')) {
      return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', icon: '⚠️' };
    }
    return { bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.3)', color: 'var(--text-secondary)', icon: '📦' };
  };

  const badgeStyle = getReasonBadgeStyle(task.archive_reason);
  const origQuota = task.original_quota ?? task.quota ?? 1;

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        borderLeft: `4px solid ${badgeStyle.color}`,
        opacity: 0.95,
      }}
    >
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
              }}
            >
              r/{task.subreddit || 'general'}
            </span>

            {/* Reason Badge */}
            <span
              style={{
                backgroundColor: badgeStyle.bg,
                border: `1px solid ${badgeStyle.border}`,
                color: badgeStyle.color,
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              {badgeStyle.icon} {task.archive_reason || 'Archived Task'}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Quota: <strong>{task.quota} / {origQuota} remaining</strong> &bull; Price: <strong>${task.price}</strong>
            {task.deadline && (
              <span>
                {' '}&bull; Deadline: <strong>{new Date(task.deadline).toLocaleDateString()}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onRestore(task.id)}
            disabled={isLoading}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}
            title="Restore task to Active status"
          >
            🔄 Restore
          </button>
          
          {onEdit && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onEdit(task)}
              disabled={isLoading}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              ✏️ Edit
            </button>
          )}

          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onPermanentDelete(task.id)}
            disabled={isLoading}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            title="Permanently remove task from database"
          >
            🗑️ Delete Permanently
          </button>
        </div>
      </div>

      {/* Target URL */}
      <div style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
        <strong>Target:</strong>{' '}
        <a href={task.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
          {task.url}
        </a>
      </div>

      {/* Client Request snippet / expandable */}
      <div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><strong>Client Request:</strong></span>
          {task.client_request.length > 150 && (
            <button
              type="button"
              onClick={onToggleExpand}
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
            >
              {isExpanded ? 'Show Less' : 'Show Full Request'}
            </button>
          )}
        </div>
        <div
          style={{
            fontSize: '0.85rem',
            backgroundColor: 'rgba(0,0,0,0.2)',
            padding: '0.6rem 0.75rem',
            borderRadius: '6px',
            marginTop: '0.35rem',
            whiteSpace: isExpanded ? 'pre-wrap' : 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'var(--text-primary)',
          }}
        >
          {task.client_request}
        </div>
      </div>

      {/* Statistics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div>
          Incomplete: <strong style={{ color: 'var(--text-primary)' }}>{task.count_incomplete || 0}</strong>
        </div>
        <div>
          Pending Review: <strong style={{ color: 'var(--color-warning)' }}>{task.count_pending || 0}</strong>
        </div>
        <div>
          Completed: <strong style={{ color: 'var(--color-success)' }}>{(task.count_success || 0) + (task.count_paid || 0)}</strong>
        </div>
        <div>
          Failed: <strong style={{ color: 'var(--color-danger)' }}>{task.count_failed || 0}</strong>
        </div>
      </div>
    </div>
  );
}
