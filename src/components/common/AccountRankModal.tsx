import type { User } from '../../types';

interface AccountRankModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export const RANKS_INFO = [
  { id: 'D', name: 'Rank D', cqm: 'Lowest', level: 1, color: '#9e9e9e', bg: 'rgba(158, 158, 158, 0.1)', desc: 'Standard starter account. Access to open tasks with no minimum rank requirement.' },
  { id: 'C', name: 'Rank C', cqm: 'Low', level: 2, color: '#4caf50', bg: 'rgba(76, 175, 80, 0.1)', desc: 'Low risk account. Access to Rank D and C restricted tasks.' },
  { id: 'B', name: 'Rank B', cqm: 'Moderate', level: 3, color: '#2196f3', bg: 'rgba(33, 150, 243, 0.1)', desc: 'Moderate quality account with good engagement history.' },
  { id: 'A', name: 'Rank A', cqm: 'High', level: 4, color: '#9c27b0', bg: 'rgba(156, 39, 176, 0.1)', desc: 'High quality account with established karma and trust score.' },
  { id: 'S', name: 'Rank S', cqm: 'Highest', level: 5, color: '#ff9800', bg: 'rgba(255, 152, 0, 0.1)', desc: 'Elite top-tier account with highest task success rates and full task access.' },
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
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      backdropFilter: 'blur(4px)'
    }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          padding: '1.75rem',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a' }}>Account Rank Information</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
              Ranks are based on Reddit Comment Quality Model (CQM).
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#888',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px'
            }}
          >
            &times;
          </button>
        </div>

        <div style={{
          backgroundColor: '#f8f9fa',
          borderLeft: '4px solid #2196f3',
          padding: '0.75rem 1rem',
          borderRadius: '4px',
          fontSize: '0.85rem',
          color: '#333',
          marginBottom: '1.25rem',
          lineHeight: '1.4'
        }}>
          💡 <strong>How Rank Requirements Work:</strong> Tasks with a <em>Minimum Rank Required</em> can only be booked by accounts with equal or higher rank level. Higher rank accounts achieve higher task success rates.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {RANKS_INFO.map((rank) => {
            const isCurrentRank = rank.id === currentRankId;
            return (
              <div
                key={rank.id}
                style={{
                  border: isCurrentRank ? `2px solid ${rank.color}` : '1px solid #e2e8f0',
                  backgroundColor: isCurrentRank ? rank.bg : '#fafafa',
                  borderRadius: '8px',
                  padding: '0.875rem 1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  backgroundColor: rank.color,
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  minWidth: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                }}>
                  {rank.id}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#2d3748' }}>{rank.name}</span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: rank.color,
                      backgroundColor: '#ffffff',
                      border: `1px solid ${rank.color}`,
                      padding: '0.1rem 0.5rem',
                      borderRadius: '12px'
                    }}>
                      Reddit CQM: {rank.cqm}
                    </span>
                    {isCurrentRank && (
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: '#2b6cb0',
                        color: '#ffffff',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '12px',
                        marginLeft: 'auto'
                      }}>
                        Your Rank
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.825rem', color: '#4a5568', lineHeight: '1.35' }}>
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
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', borderRadius: '6px' }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
