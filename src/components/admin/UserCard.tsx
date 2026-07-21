import type { BasicUserSummary } from '../../types';

interface UserCardProps {
  user: BasicUserSummary;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenUserStats: (userId: string) => void;
  onEdit: (user: BasicUserSummary) => void;
  onDelete: (userId: string) => void;
  isLoading: boolean;
}

export default function UserCard({
  user,
  isExpanded,
  onToggleExpand,
  onOpenUserStats,
  onEdit,
  onDelete,
  isLoading,
}: UserCardProps) {
  return (
    <div className="glass-card compact-card">
      {/* Header */}
      <div className="task-card-header" onClick={onToggleExpand}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
            {user.email}
            {user.nickname && (
              <span style={{ fontWeight: 'normal', color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '0.35rem' }}>
                ({user.nickname})
              </span>
            )}
          </span>
          <span
            className={`badge-role role-${(user.tier || 'Bronze').toLowerCase()}`}
            style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', textTransform: 'capitalize' }}
          >
            {user.tier || 'Bronze'} Tier
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>
            Active: {user.activeBookingCount || 0}
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
        </div>
      </div>

      {/* Main Info */}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        {user.nickname && (
          <>
            Nickname: <strong style={{ color: 'var(--text-primary)' }}>{user.nickname}</strong> |{' '}
          </>
        )}
        Reddit:{' '}
        <a
          href={`https://reddit.com/u/${user.reddit}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 'bold' }}
        >
          u/{user.reddit}
        </a>{' '}
        | PayPal:{' '}
        <strong style={{ color: 'var(--text-primary)' }}>{user.paypal || 'None'}</strong>
      </div>

      {/* Full Detail Modal Link */}
      <div style={{ marginBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => onOpenUserStats(user.id)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            textDecoration: 'underline',
          }}
        >
          📊 View Full Details & Statistics
        </button>
      </div>

      {/* Expanded Actions */}
      {isExpanded && (
        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Completed: {user.completedCount} | Pending: ${user.pendingBalance.toFixed(2)} | Paid: ${user.paidBalance.toFixed(2)}
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => onEdit(user)}
              className="btn btn-secondary"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px' }}
              disabled={isLoading}
            >
              Edit Profile
            </button>
            <button
              onClick={() => onDelete(user.id)}
              className="btn btn-danger"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px' }}
              disabled={isLoading}
            >
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
