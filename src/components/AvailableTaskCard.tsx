import type { Task } from '../types';

interface AvailableTaskCardProps {
  task: Task;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onBookTask: (taskId: string) => void;
  isLoading: boolean;
  isBookingDisabled: boolean;
}

export default function AvailableTaskCard({
  task,
  isExpanded,
  onToggleExpand,
  onBookTask,
  isLoading,
  isBookingDisabled,
}: AvailableTaskCardProps) {
  return (
    <div className="glass-card compact-card">
      <div className="task-card-header" onClick={onToggleExpand}>
        <span
          style={{
            fontWeight: 'bold',
            color: 'var(--color-primary)',
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
          <span style={{ fontWeight: '600', color: 'var(--color-success)', fontSize: '0.95rem' }}>
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
      {isExpanded && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '0.5rem',
          }}
        >
          <button
            onClick={() => onBookTask(task.id)}
            className="btn btn-primary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px' }}
            disabled={isLoading || isBookingDisabled}
          >
            Book Task
          </button>
        </div>
      )}
    </div>
  );
}
