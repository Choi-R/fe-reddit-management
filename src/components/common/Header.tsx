import { useState } from 'react';
import type { User } from '../../types';
import AccountRankModal from './AccountRankModal';

interface HeaderProps {
  user: User;
  isAdmin: boolean;
  isChoi: boolean;
  onLogout: () => void;
}

export default function Header({ user, isAdmin, isChoi, onLogout }: HeaderProps) {
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);

  const rankId = user.account_rank?.id || user.rank_id || 'D';
  const rankName = user.account_rank?.rank_name || `Rank ${rankId}`;
  const cqmLevel = user.account_rank?.cqm_level || 'Lowest';

  const roleName = isChoi ? 'Choi' : isAdmin ? 'Admin' : 'Basic';
  const roleClass = isChoi ? 'role-choi' : isAdmin ? 'role-admin' : 'role-basic';

  const rankColors: Record<string, { bg: string; color: string; border: string }> = {
    D: { bg: '#edf2f7', color: '#4a5568', border: '#cbd5e0' },
    C: { bg: '#e6fffa', color: '#234e52', border: '#81e6d9' },
    B: { bg: '#ebf8ff', color: '#2b6cb0', border: '#90cdf4' },
    A: { bg: '#faf5ff', color: '#6b46c1', border: '#d6bcfa' },
    S: { bg: '#fffaf0', color: '#c05621', border: '#fbd38d' },
  };

  const currentRankStyle = rankColors[rankId] || rankColors.D;

  return (
    <>
      <header className="header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Reddit CRM</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="user-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.email}</span>
            {(isAdmin || isChoi) && (
              <span className={`badge-role ${roleClass}`}>{roleName}</span>
            )}
            
            {/* Clickable Account Rank Badge */}
            <button
              onClick={() => setIsRankModalOpen(true)}
              title="Click to view Account Rank details"
              style={{
                background: currentRankStyle.bg,
                color: currentRankStyle.color,
                border: `1px solid ${currentRankStyle.border}`,
                padding: '0.25rem 0.65rem',
                borderRadius: '16px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'transform 0.15s ease, boxShadow 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
              }}
            >
              <span>{rankName}</span>
              <span style={{ opacity: 0.75, fontSize: '0.725rem', fontWeight: 500 }}>({cqmLevel})</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.65 }}>ℹ️</span>
            </button>
          </div>

          <button
            onClick={onLogout}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Interactive Account Rank Information Modal */}
      <AccountRankModal
        user={user}
        isOpen={isRankModalOpen}
        onClose={() => setIsRankModalOpen(false)}
      />
    </>
  );
}
