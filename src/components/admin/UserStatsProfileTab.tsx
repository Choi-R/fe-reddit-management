import type { UserDetailStats } from '../../types';

interface UserStatsProfileTabProps {
  stats: UserDetailStats;
}

export default function UserStatsProfileTab({ stats }: UserStatsProfileTabProps) {
  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <h4 style={{ fontSize: '0.95rem', margin: '0 0 1rem 0' }}>Profile & Account Details</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>User ID:</span>
          <br />
          <strong style={{ wordBreak: 'break-all' }}>{stats.user.id}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Email Address:</span>
          <br />
          <strong>{stats.user.email}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Reddit Username:</span>
          <br />
          <strong>
            <a
              href={`https://reddit.com/u/${stats.user.reddit}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
            >
              u/{stats.user.reddit}
            </a>
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Nickname (Admin-only):</span>
          <br />
          <strong style={{ color: 'var(--text-primary)' }}>{stats.user.nickname || 'None'}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>PayPal Email:</span>
          <br />
          <strong style={{ color: 'var(--text-primary)' }}>{stats.user.paypal || 'Not configured'}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Account Tier:</span>
          <br />
          <span
            className={`badge-role role-${stats.user.tier.toLowerCase()}`}
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'capitalize', fontWeight: 'bold' }}
          >
            {stats.user.tier} Tier (Max {stats.user.bookingLimit} booking{stats.user.bookingLimit === 1 ? '' : 's'})
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Account Created At:</span>
          <br />
          <strong>{new Date(stats.user.createdAt).toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}
