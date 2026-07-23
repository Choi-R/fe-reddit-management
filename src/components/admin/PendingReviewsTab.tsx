import { useState } from 'react';
import type { PendingSubmission } from '../../types';
import { adminService } from '../../services/adminService';
import { getRelativeTimeString } from '../../utils/date';

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
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});

  const setItemNote = (bookingId: string, text: string) => {
    setItemNotes((prev) => ({ ...prev, [bookingId]: text }));
  };

  const handleReviewSubmission = async (bookingId: string, statusId: 'success' | 'failed') => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    const note = itemNotes[bookingId] || null;
    try {
      const data = await adminService.reviewSubmission(bookingId, statusId, note);
      if (statusId === 'failed' && data.quotaReturned) {
        setSuccessMsg('Task marked as Failed. Task quota has been returned by 1.');
      } else {
        setSuccessMsg(`Task marked as ${statusId === 'success' ? 'Approved' : 'Failed'}.`);
      }
      setItemNotes((prev) => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });
      onRefreshData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to review submission.');
    } finally {
      setIsLoading(false);
    }
  };

  const presetApprovalNotes = ['Verified & Approved', 'Great submission!'];
  const presetRejectionNotes = [
    'Invalid/Broken Reddit link',
    'Comment removed by auto-mod',
    'Wrong subreddit used',
    'Guidelines not followed',
  ];

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Pending Task Validations</h2>

      {pendingSubmissions.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
          No pending submissions found. All caught up!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pendingSubmissions.map((sub) => {
            const currentNote = itemNotes[sub.booking_id] || '';
            return (
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

                {/* Optional Admin Decision Reasoning Input */}
                <div style={{ marginBottom: '1rem' }}>
                  <label
                    htmlFor={`admin-note-${sub.booking_id}`}
                    style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}
                  >
                    Admin Decision Reason / Feedback (Optional)
                  </label>
                  <input
                    id={`admin-note-${sub.booking_id}`}
                    type="text"
                    className="form-input"
                    placeholder="Enter reason or feedback for user..."
                    value={currentNote}
                    onChange={(e) => setItemNote(sub.booking_id, e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>Quick presets:</span>
                    {[...presetApprovalNotes, ...presetRejectionNotes].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setItemNote(sub.booking_id, preset)}
                        style={{
                          fontSize: '0.7rem',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-secondary)',
                          borderRadius: '4px',
                          padding: '0.15rem 0.4rem',
                          cursor: 'pointer',
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
