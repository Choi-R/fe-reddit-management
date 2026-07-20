import type { Booking } from '../types';
import StatusTag from './StatusTag';

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
            <th>Subreddit</th>
            <th>Type</th>
            <th>Price</th>
            <th>Date Completed</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map((row) => (
            <tr key={row.booking_id}>
              <td style={{ fontWeight: 'bold' }}>
                {row.subreddit ? `r/${row.subreddit}` : 'Direct Link'}
              </td>
              <td>{row.type_name}</td>
              <td style={{ color: 'var(--color-success)', fontWeight: '600' }}>
                ${parseFloat(row.price).toFixed(2)}
              </td>
              <td>{new Date(row.updated_at).toLocaleDateString()}</td>
              <td>
                <StatusTag status={row.status_id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
