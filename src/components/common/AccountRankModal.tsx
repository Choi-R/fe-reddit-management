import type { User } from '../../types';

interface AccountRankModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export const RANKS_INFO = [
  { id: 'D', name: 'Rank D', cqs: 'Lowest', level: 1, color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)', desc: 'Starter account with lowest CQS. Access to tasks with no minimum rank requirement.' },
  { id: 'C', name: 'Rank C', cqs: 'Low', level: 2, color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', desc: 'Basic account with low CQS. Has potential for basic task execution and access to Rank D and C tasks.' },
  { id: 'B', name: 'Rank B', cqs: 'Moderate', level: 3, color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', desc: 'Moderate quality account with good engagement history. Better potential to achieve task success.' },
  { id: 'A', name: 'Rank A', cqs: 'High', level: 4, color: '#c084fc', bg: 'rgba(168, 85, 247, 0.15)', desc: 'High quality account with established karma and trust score. High potential to achieve task success.' },
  { id: 'S', name: 'Rank S', cqs: 'Highest', level: 5, color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', desc: 'Elite top-tier account with highest CQS. Maximum potential to achieve task success and full task access.' },
];

export default function AccountRankModal({ user, isOpen, onClose }: AccountRankModalProps) {
  if (!isOpen) return null;

  const currentRankId = user.account_rank?.id || user.rank_id || 'D';

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          maxWidth: '580px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          padding: '1.75rem',
          position: 'relative',
          color: '#f3f4f6'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#f3f4f6' }}>Account Rank Information</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#9ca3af' }}>
              Ranks are based on Reddit Contributor Quality Score (CQS).
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#9ca3af',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
          >
            &times;
          </button>
        </div>

        {/* How Rank Requirements Work Info Box */}
        <div style={{
          backgroundColor: 'rgba(30, 58, 138, 0.25)',
          borderLeft: '4px solid #3b82f6',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#dbeafe',
          marginBottom: '0.85rem',
          lineHeight: '1.4'
        }}>
          💡 <strong>How Rank Requirements Work:</strong> Tasks with a <em>Minimum Rank Required</em> can only be booked by accounts with equal or higher rank level. Higher rank accounts indicate a <strong>higher potential to achieve success</strong> when tasking.
        </div>

        {/* Tip: How to Check CQS Box */}
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          borderLeft: '4px solid #10b981',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#d1fae5',
          marginBottom: '1.25rem',
          lineHeight: '1.45'
        }}>
          🔍 <strong>How to check your CQS?</strong><br />
          You can check your Reddit account's Contributor Quality Score by posting <em>"What is my CQS"</em> on the official subreddit{' '}
          <a
            href="https://www.reddit.com/r/WhatIsMyCQS/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#6ee7b7', textDecoration: 'underline', fontWeight: 600 }}
          >
            r/WhatIsMyCQS
          </a>.
        </div>

        {/* Rank List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {RANKS_INFO.map((rank) => {
            const isCurrentRank = rank.id === currentRankId;
            return (
              <div
                key={rank.id}
                style={{
                  border: isCurrentRank ? `2px solid ${rank.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: isCurrentRank ? rank.bg : 'rgba(31, 41, 55, 0.45)',
                  borderRadius: '10px',
                  padding: '0.875rem 1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  backgroundColor: rank.color,
                  color: '#080b11',
                  fontWeight: 800,
                  fontSize: '1rem',
                  minWidth: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 10px ${rank.color}40`
                }}>
                  {rank.id}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f3f4f6' }}>{rank.name}</span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: rank.color,
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: `1px solid ${rank.color}`,
                      padding: '0.1rem 0.5rem',
                      borderRadius: '12px'
                    }}>
                      Reddit CQS: {rank.cqs}
                    </span>
                    {isCurrentRank && (
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: '#4f46e5',
                        color: '#ffffff',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '12px',
                        marginLeft: 'auto'
                      }}>
                        Your Rank
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.825rem', color: '#9ca3af', lineHeight: '1.4' }}>
                    {rank.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'right' }}>
          <button
            className="btn btn-primary"
            onClick={onClose}
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', borderRadius: '8px' }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
