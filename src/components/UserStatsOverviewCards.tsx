import type { UserDetailMetrics } from '../types';

interface UserStatsOverviewCardsProps {
  metrics: UserDetailMetrics;
}

export default function UserStatsOverviewCards({ metrics }: UserStatsOverviewCardsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '0.85rem', borderLeft: '4px solid var(--color-primary)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Bookings</span>
        <h4 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', margin: '0.25rem 0 0 0' }}>
          {metrics.activeBookingCount}
        </h4>
      </div>
      <div className="glass-card" style={{ padding: '0.85rem', borderLeft: '4px solid var(--color-warning)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Under Review</span>
        <h4 style={{ fontSize: '1.25rem', color: 'var(--color-warning)', margin: '0.25rem 0 0 0' }}>
          {metrics.pendingReviewCount}
        </h4>
      </div>
      <div className="glass-card" style={{ padding: '0.85rem', borderLeft: '4px solid var(--color-success)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Completed Tasks</span>
        <h4 style={{ fontSize: '1.25rem', color: 'var(--color-success)', margin: '0.25rem 0 0 0' }}>
          {metrics.completedCount}
        </h4>
      </div>
      <div className="glass-card" style={{ padding: '0.85rem', borderLeft: '4px solid #8b5cf6' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Balance</span>
        <h4 style={{ fontSize: '1.25rem', color: '#8b5cf6', margin: '0.25rem 0 0 0' }}>
          ${metrics.totalBalance.toFixed(2)}
        </h4>
      </div>
    </div>
  );
}
