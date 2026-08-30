import type { Booking } from '../../types';
import StatusTag from '../common/StatusTag';

interface TaskHistoryTableProps {
  history: Booking[];
}

export default function TaskHistoryTable({ history }: TaskHistoryTableProps) {
  if (history.length === 0) {
    return (
      <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
        No completed tasks yet.
      </p>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Platform & Target</th>
            <th>Min Rank</th>
            <th>Price</th>
            <th>Date Completed</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map((row) => (
            <tr key={row.booking_id}>
              <td style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    background: row.platform === 'PRODUCTHUNT' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 107, 53, 0.15)',
                    color: row.platform === 'PRODUCTHUNT' ? '#fbbf24' : '#ff6b35',
                    padding: '0.1rem 0.3rem',
                    borderRadius: '3px',
                    letterSpacing: '0.05em',
                  }}
                >
                  {row.platform || 'REDDIT'}
                </span>
                {(row.target_subreddit || row.subreddit) ? `${row.platform === 'PRODUCTHUNT' ? '' : 'r/'}${row.target_subreddit || row.subreddit}` : ''}
              </td>
              <td>{row.min_rank_name || 'All'}</td>
              <td style={{ color: 'var(--color-success)', fontWeight: '600' }}>
                ${parseFloat(row.price).toFixed(2)}
              </td>
              <td>{new Date(row.updated_at).toLocaleDateString()}</td>
              <td>
                <StatusTag status={row.status_id} />
                {row.admin_note && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: row.status_id === 'failed' ? 'var(--color-danger)' : 'var(--text-secondary)',
                      marginTop: '0.25rem',
                      maxWidth: '220px',
                      wordBreak: 'break-word',
                    }}
                  >
                    <strong>Feedback:</strong> {row.admin_note}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
