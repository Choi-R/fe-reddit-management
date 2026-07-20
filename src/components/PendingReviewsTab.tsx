import { useState } from 'react';
import type { PendingSubmission } from '../types';
import { adminService } from '../services/adminService';
import { getRelativeTimeString } from '../utils/date';

interface PendingReviewsTabProps {
  pendingSubmissions: PendingSubmission[];
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setErrorMsg: (msg: string | null) => void;
  setSuccessMsg: (msg: string | null) => void;
  onRefreshData: () => void;
}

export default function PendingReviewsTab({
  pendingSubmissions,
  isLoading,
  setIsLoading,
  setErrorMsg,
  setSuccessMsg,
  onRefreshData,
}: PendingReviewsTabProps) {
  const [reviewNote, setReviewNote] = useState('');

  const handleReviewSubmission = async (bookingId: string, statusId: 'success' | 'failed') => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const data = await adminService.reviewSubmission(bookingId, statusId, reviewNote || null);
      if (statusId === 'failed' && data.quotaReturned) {
        setSuccessMsg('Task marked as Failed. Task quota has been returned by 1.');
      } else {
        setSuccessMsg(`Task marked as ${statusId === 'success' ? 'Approved' : 'Failed'}.`);
      }
      setReviewNote('');
      onRefreshData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to review submission.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Pending Task Validations</h2>

      <div className="form-group" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
        <label htmlFor="reviewNote">Review Feedback Note (Optional)</label>
        <input
          id="reviewNote"
          type="text"
          className="form-input"
          placeholder="Feedback message or reason for failure..."
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
        />
      </div>

      {pendingSubmissions.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
          No pending submissions found. All caught up!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pendingSubmissions.map((sub) => (
            <div key={sub.booking_id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <strong style={{ fontSize: '1rem' }}>User: {sub.user_email}</strong>
                  <br />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Reddit profile:{' '}
                    <strong>
                      <a
                        href={`https://reddit.com/u/${sub.user_reddit}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
                      >
                        u/{sub.user_reddit}
                      </a>
                    </strong>
                  </span>
                  <br />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Submitted:{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {new Date(sub.updated_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </strong>{' '}
                    <span style={{ color: 'var(--color-warning)', fontWeight: '500' }}>
                      ({getRelativeTimeString(sub.updated_at)})
                    </span>
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                    r/{sub.subreddit}
                  </span>
                  <br />
                  <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>
                    ${parseFloat(sub.price).toFixed(2)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(0,0,0,0.15)',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1rem',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Submitted Link:</span>
                <br />
                <a
                  href={sub.reply_url ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: 'var(--color-primary)',
                    wordBreak: 'break-all',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                  }}
                >
                  {sub.reply_url}
                </a>
                {sub.note && (
                  <p
                    style={{
                      marginTop: '0.75rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      borderTop: '1px dashed var(--border-color)',
                      paddingTop: '0.5rem',
                    }}
                  >
                    User note: "{sub.note}"
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleReviewSubmission(sub.booking_id, 'failed')}
                  className="btn btn-danger"
                  disabled={isLoading}
                >
                  Reject (Fail)
                </button>
                <button
                  onClick={() => handleReviewSubmission(sub.booking_id, 'success')}
                  className="btn btn-primary"
                  style={{ background: 'var(--color-success)', color: '#fff' }}
                  disabled={isLoading}
                >
                  Approve (Success)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
