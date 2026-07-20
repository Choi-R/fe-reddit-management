import type { BasicUserSummary } from '../types';
import { adminService } from '../services/adminService';

interface PayoutsTabProps {
  users: BasicUserSummary[];
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setErrorMsg: (msg: string | null) => void;
  setSuccessMsg: (msg: string | null) => void;
  onRefreshData: () => void;
}

export default function PayoutsTab({
  users,
  isLoading,
  setIsLoading,
  setErrorMsg,
  setSuccessMsg,
  onRefreshData,
}: PayoutsTabProps) {
  const handleConfirmPayout = async (userId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const data = await adminService.recordPayout(userId);
      setSuccessMsg(data.message || 'Payout recorded successfully.');
      onRefreshData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to record payout.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>PayPal Payout Ledger</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Process user payments manually in PayPal, then click <strong>Mark as Paid</strong> to clear their balance and move
        tasks to Paid.
      </p>

      <div className="table-container">
        {users.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>No users registered.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User Email</th>
                <th>Reddit User</th>
                <th>PayPal Account</th>
                <th>Accumulated Pending Earnings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>
                    <a
                      href={`https://reddit.com/u/${u.reddit}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
                    >
                      u/{u.reddit}
                    </a>
                  </td>
                  <td style={{ fontWeight: 'bold' }}>{u.paypal || 'Not set'}</td>
                  <td
                    style={{
                      color: u.pendingBalance > 0 ? 'var(--color-warning)' : 'var(--text-secondary)',
                      fontWeight: 'bold',
                    }}
                  >
                    ${u.pendingBalance.toFixed(2)}
                  </td>
                  <td>
                    <button
                      onClick={() => handleConfirmPayout(u.id)}
                      className="btn btn-primary"
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.75rem',
                        background: 'var(--color-success)',
                      }}
                      disabled={isLoading || u.pendingBalance <= 0}
                    >
                      Mark as Paid
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
