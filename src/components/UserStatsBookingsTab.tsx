import type { UserTaskDetailItem } from '../types';

interface UserStatsBookingsTabProps {
  bookings: UserTaskDetailItem[];
}

export default function UserStatsBookingsTab({ bookings }: UserStatsBookingsTabProps) {
  if (bookings.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
        User currently has no active bookings.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {bookings.map((item) => (
        <div
          key={item.booking_id}
          className="glass-card"
          style={{ padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
              {item.subreddit ? `r/${item.subreddit}` : 'Direct Task'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.client_request}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Booked at: {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
              ${parseFloat(item.price).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
