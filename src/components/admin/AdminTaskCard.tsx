import type { Task } from '../../types';
import StatusTag from '../common/StatusTag';

interface AdminTaskCardProps {
  task: Task;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isLoading: boolean;
}

export default function AdminTaskCard({
  task,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  isLoading,
}: AdminTaskCardProps) {
  return (
    <div className="glass-card compact-card">
      <div className="task-card-header" onClick={onToggleExpand}>
        <span
          style={{
            fontWeight: 'bold',
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {task.subreddit ? `r/${task.subreddit}` : 'Direct Link'}
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: '500',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)',
              padding: '0.1rem 0.35rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              textTransform: 'uppercase',
            }}
          >
            {task.type_name}
          </span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--color-success)', fontWeight: 'bold', fontSize: '0.95rem' }}>
            ${parseFloat(task.price).toFixed(2)}
          </span>
          <span
            title={`Quota: ${task.quota}`}
            style={{
              fontSize: '0.7rem',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--color-primary)',
              padding: '0.1rem 0.35rem',
              borderRadius: '9999px',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              fontWeight: '600',
            }}
          >
            {task.quota}
          </span>
          <svg
            className={`chevron-icon ${isExpanded ? 'rotated' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '14px', height: '14px', color: 'var(--text-secondary)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.5rem',
        }}
      >
        <p
          className="line-clamp-2"
          title={task.client_request}
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            margin: 0,
            flex: 1,
          }}
        >
          {task.client_request}
        </p>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            alignSelf: 'center',
          }}
        >
          Assigned:{' '}
          <strong style={{ color: task.assigned_to_email ? 'var(--color-primary)' : 'inherit' }}>
            {task.assigned_to_email || 'None'}
          </strong>
        </span>
      </div>

      {isExpanded && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            <StatusTag status="incomplete">Inc: {task.count_incomplete}</StatusTag>
            <StatusTag status="pending">Pend: {task.count_pending}</StatusTag>
            <StatusTag status="success">Succ: {task.count_success}</StatusTag>
            <StatusTag status="paid">Paid: {task.count_paid}</StatusTag>
            <StatusTag status="failed">Fail: {task.count_failed}</StatusTag>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => onEdit(task)}
              className="btn btn-secondary"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px' }}
              disabled={isLoading}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="btn btn-danger"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px' }}
              disabled={isLoading}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
