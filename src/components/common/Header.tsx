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
  const cqsLevel = user.account_rank?.cqm_level || 'Lowest';

  const roleName = isChoi ? 'Choi' : isAdmin ? 'Admin' : 'Basic';
  const roleClass = isChoi ? 'role-choi' : isAdmin ? 'role-admin' : 'role-basic';

  const rankColors: Record<string, { bg: string; color: string; border: string }> = {
    D: { bg: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af', border: 'rgba(156, 163, 175, 0.3)' },
    C: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    B: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
    A: { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' },
    S: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
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
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'transform 0.15s ease, boxShadow 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
              }}
            >
              <span>{rankName}</span>
              <span style={{ opacity: 0.85, fontSize: '0.725rem', fontWeight: 500 }}>({cqsLevel})</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.75 }}>ℹ️</span>
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
