import type { Booking } from '../../types';
import TaskHistoryTable from './TaskHistoryTable';

interface UserEarningsTabProps {
  paidBalance: number;
  pendingBalance: number;
  earningsHistory: Booking[];
}

export default function UserEarningsTab({
  paidBalance,
  pendingBalance,
  earningsHistory,
}: UserEarningsTabProps) {
  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div
          className="glass-card"
          style={{
            padding: '1.5rem',
            flex: '1',
            minWidth: '180px',
            borderLeft: '4px solid var(--color-success)',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Paid Earned Balance</span>
          <h2 style={{ fontSize: '2rem', color: 'var(--color-success)', marginTop: '0.5rem' }}>
            ${paidBalance.toFixed(2)}
          </h2>
        </div>
        <div
          className="glass-card"
          style={{
            padding: '1.5rem',
            flex: '1',
            minWidth: '180px',
            borderLeft: '4px solid var(--color-warning)',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending Earned Balance</span>
          <h2 style={{ fontSize: '2rem', color: 'var(--color-warning)', marginTop: '0.5rem' }}>
            ${pendingBalance.toFixed(2)}
          </h2>
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Task Completion History</h3>
      <TaskHistoryTable history={earningsHistory} />
    </div>
  );
}
