import type { User } from '../../types';

interface HeaderProps {
  user: User;
  isAdmin: boolean;
  isChoi: boolean;
  onLogout: () => void;
}

export default function Header({ user, isAdmin, isChoi, onLogout }: HeaderProps) {
  const isSilver = user.roles.includes('silver');
  const isGold = user.roles.includes('gold');

  const roleName = isChoi 
    ? 'Choi' 
    : isAdmin 
    ? 'Admin' 
    : isGold 
    ? 'Gold' 
    : isSilver 
    ? 'Silver' 
    : 'Bronze';

  const roleClass = isChoi 
    ? 'role-choi' 
    : isAdmin 
    ? 'role-admin' 
    : isGold 
    ? 'role-gold' 
    : isSilver 
    ? 'role-silver' 
    : 'role-bronze';

  return (
    <header className="header">
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Reddit CRM</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div className="user-badge">
          <span style={{ fontSize: '0.875rem' }}>{user.email}</span>
          <span className={`badge-role ${roleClass}`}>{roleName}</span>
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
  );
}
