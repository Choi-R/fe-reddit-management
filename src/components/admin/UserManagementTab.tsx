import { useState } from 'react';
import type { BasicUserSummary } from '../../types';
import Pagination from '../common/Pagination';
import { adminService } from '../../services/adminService';
import UserForm from './UserForm';
import UserCard from './UserCard';

interface UserManagementTabProps {
  users: BasicUserSummary[];
  usersPage: number;
  setUsersPage: (page: number) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setErrorMsg: (msg: string | null) => void;
  setSuccessMsg: (msg: string | null) => void;
  onRefreshData: () => void;
  onOpenUserStats: (userId: string) => void;
}

export default function UserManagementTab({
  users,
  usersPage,
  setUsersPage,
  isLoading,
  setIsLoading,
  setErrorMsg,
  setSuccessMsg,
  onRefreshData,
  onOpenUserStats,
}: UserManagementTabProps) {
  const [editingUser, setEditingUser] = useState<BasicUserSummary | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleEditClick = (user: BasicUserSummary) => {
    setEditingUser(user);
    const formElement = document.getElementById('userFormTitle');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this user account? All assigned tasks and records will be removed.'
      )
    ) {
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await adminService.deleteUser(userId);
      setSuccessMsg('User account deleted successfully.');
      if (editingUser?.id === userId) {
        handleCancelEdit();
      }
      onRefreshData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete user.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid-2">
      {/* User Form */}
      <div className="glass-panel" style={{ padding: '1.75rem', height: 'fit-content' }}>
        <h2 id="userFormTitle" style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
          {editingUser ? 'Edit User Profile' : 'Register New User'}
        </h2>
        <UserForm
          key={editingUser ? editingUser.id : 'new'}
          editingUser={editingUser}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setErrorMsg={setErrorMsg}
          setSuccessMsg={setSuccessMsg}
          onCancelEdit={handleCancelEdit}
          onRefreshData={onRefreshData}
        />
      </div>

      {/* User Profiles List */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>User Profiles ({users.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {users.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
              No user accounts found.
            </p>
          ) : (
            (() => {
              const totalPages = Math.ceil(users.length / 5);
              const currentPage = Math.max(1, Math.min(usersPage, totalPages || 1));
              const displayedUsers = users.slice((currentPage - 1) * 5, currentPage * 5);
              return (
                <>
                  {displayedUsers.map((u) => (
                    <UserCard
                      key={u.id}
                      user={u}
                      isExpanded={expandedUsers.has(u.id)}
                      onToggleExpand={() => toggleUserExpanded(u.id)}
                      onOpenUserStats={onOpenUserStats}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteUser}
                      isLoading={isLoading}
                    />
                  ))}
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setUsersPage} />
                </>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
