import type { UserTaskDetailItem } from '../types';

interface UserStatsPendingTabProps {
  pendingSubmissions: UserTaskDetailItem[];
}

export default function UserStatsPendingTab({ pendingSubmissions }: UserStatsPendingTabProps) {
  if (pendingSubmissions.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
        No pending task submissions under review.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {pendingSubmissions.map((item) => (
        <div key={item.booking_id} className="glass-card" style={{ padding: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
              {item.subreddit ? `r/${item.subreddit}` : 'Direct Task'}
            </span>
            <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
              ${parseFloat(item.price).toFixed(2)}
            </span>
          </div>
          {item.reply_url && (
            <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              Proof URL:{' '}
              <a href={item.reply_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>
                {item.reply_url}
              </a>
            </div>
          )}
          {item.note && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Note: "{item.note}"
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
