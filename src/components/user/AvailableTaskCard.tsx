import type { Task, CooldownInfo } from '../../types';

interface AvailableTaskCardProps {
  task: Task;
  userRankLevel?: number;
  userRankName?: string;
  isAdmin?: boolean;
  cooldown?: CooldownInfo;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onBookTask: (taskId: string) => void;
  isLoading: boolean;
  isBookingDisabled: boolean;
}

export default function AvailableTaskCard({
  task,
  userRankLevel = 1,
  userRankName = 'Rank D',
  isAdmin = false,
  cooldown,
  isExpanded,
  onToggleExpand,
  onBookTask,
  isLoading,
  isBookingDisabled,
}: AvailableTaskCardProps) {
  const taskMinLevel = task.min_rank_level || 0;
  const isRankE = userRankLevel === 0 || userRankName === 'Rank E';
  const isRankInsufficient = Boolean(!isAdmin && (isRankE || (task.min_rank_id && taskMinLevel > userRankLevel)));
  const isCooldownActive = Boolean(cooldown?.isActive);

  return (
    <div
      className="glass-card compact-card"
      style={{
        borderLeft: isRankE
          ? '4px solid #ef4444'
          : isRankInsufficient
          ? '4px solid #f59e0b'
          : isCooldownActive
          ? '4px solid #ef4444'
          : 'none',
        opacity: isRankInsufficient || isCooldownActive ? 0.88 : 1,
      }}
    >
      <div className="task-card-header" onClick={onToggleExpand}>
        <span
          style={{
            fontWeight: 'bold',
            color: 'var(--color-primary)',
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              background: task.platform === 'PRODUCTHUNT' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 107, 53, 0.15)',
              color: task.platform === 'PRODUCTHUNT' ? '#fbbf24' : '#ff6b35',
              padding: '0.1rem 0.35rem',
              borderRadius: '4px',
              letterSpacing: '0.05em',
            }}
          >
            {task.platform || 'REDDIT'}
          </span>
          {(task.target_subreddit || task.subreddit) ? `${task.platform === 'PRODUCTHUNT' ? '' : 'r/'}${task.target_subreddit || task.subreddit}` : ''}

          {/* Rank Requirement Badge */}
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: '600',
              background: isRankE
                ? 'rgba(239, 68, 68, 0.15)'
                : task.min_rank_id
                ? (isRankInsufficient ? 'rgba(245, 158, 11, 0.15)' : 'rgba(33, 150, 243, 0.15)')
                : 'rgba(255, 255, 255, 0.05)',
              color: isRankE
                ? '#ef4444'
                : task.min_rank_id
                ? (isRankInsufficient ? '#d97706' : '#2196f3')
                : 'var(--text-secondary)',
              padding: '0.1rem 0.45rem',
              borderRadius: '4px',
              border: isRankE
                ? '1px solid rgba(239, 68, 68, 0.4)'
                : task.min_rank_id
                ? (isRankInsufficient ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(33, 150, 243, 0.4)')
                : '1px solid var(--border-color)',
            }}
          >
            {isRankE
              ? '🔒 Banned Account'
              : task.min_rank_name
              ? (isRankInsufficient ? `🔒 Requires ${task.min_rank_name}` : `Min: ${task.min_rank_name}`)
              : 'All Ranks (D to S)'}
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
        <strong style={{ color: 'var(--text-primary)' }}>Client Request: </strong>
        {task.client_request}
      </p>

      {isRankInsufficient && (
        <div style={{
          fontSize: '0.75rem',
          color: isRankE ? '#ef4444' : '#d97706',
          backgroundColor: isRankE ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
          padding: '0.35rem 0.6rem',
          borderRadius: '4px',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          ⚠️ <span>
            {isRankE
              ? <>Your account is <strong>Rank E (Banned Account)</strong> and cannot book or perform any tasks.</>
              : <>Your rank (<strong>{userRankName}</strong>) is insufficient for this task. Minimum required: <strong>{task.min_rank_name || 'Rank ' + task.min_rank_id}</strong>.</>}
          </span>
        </div>
      )}

      {isCooldownActive && !isRankInsufficient && (
        <div style={{
          fontSize: '0.75rem',
          color: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          padding: '0.35rem 0.6rem',
          borderRadius: '4px',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          ⏱️ <span>Booking disabled during <strong>1-day post-submission cooldown</strong>.</span>
        </div>
      )}

      {isExpanded && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {task.deadline ? `Deadline: ${new Date(task.deadline).toLocaleDateString()}` : 'No deadline'}
          </span>
          <button
            onClick={() => onBookTask(task.id)}
            className="btn btn-primary"
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.75rem',
              borderRadius: '4px',
              opacity: isRankInsufficient || isCooldownActive ? 0.6 : 1,
              cursor: isRankInsufficient || isCooldownActive ? 'not-allowed' : 'pointer',
            }}
            disabled={isLoading || isBookingDisabled || isRankInsufficient}
            title={
              isRankE
                ? 'Account Rank E (Banned Account) cannot book tasks'
                : isRankInsufficient
                ? `Requires ${task.min_rank_name || 'higher rank'}`
                : isCooldownActive
                ? (cooldown?.reason || '1-day post-submission cooldown in effect')
                : undefined
            }
          >
            {isRankE
              ? '🔒 Banned (Rank E)'
              : isRankInsufficient
              ? `Requires ${task.min_rank_name || 'Higher Rank'}`
              : isCooldownActive
              ? '⏱️ Cooldown Active'
              : 'Book Task'}
          </button>
        </div>
      )}
    </div>
  );
}
