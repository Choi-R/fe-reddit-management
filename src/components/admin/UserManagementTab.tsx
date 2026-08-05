import { useState, useMemo } from 'react';
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

  // Search, Sort, Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [cqsFilter, setCqsFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'abc' | 'cqs' | 'joinTime'>('abc');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  // Processed Users: Filter & Sort
  const processedUsers = useMemo(() => {
    let result = [...users];

    // 1. Search filter (nickname, email, or reddit username)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.reddit.toLowerCase().includes(q) ||
          (u.nickname && u.nickname.toLowerCase().includes(q))
      );
    }

    // 2. Filter by CQS (Rank)
    if (cqsFilter !== 'ALL') {
      result = result.filter((u) => (u.rankId || 'D').toUpperCase() === cqsFilter);
    }

    // 3. Sort
    result.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'abc') {
        const nameA = (a.nickname || a.reddit || a.email).toLowerCase();
        const nameB = (b.nickname || b.reddit || b.email).toLowerCase();
        comparison = nameA.localeCompare(nameB);
      } else if (sortBy === 'cqs') {
        const rankA = typeof a.rankLevel === 'number' ? a.rankLevel : 1;
        const rankB = typeof b.rankLevel === 'number' ? b.rankLevel : 1;
        comparison = rankA - rankB;
      } else if (sortBy === 'joinTime') {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        comparison = timeA - timeB;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [users, searchQuery, cqsFilter, sortBy, sortOrder]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setUsersPage(1);
  };

  const handleCqsChange = (val: string) => {
    setCqsFilter(val);
    setUsersPage(1);
  };

  const handleSortByChange = (val: 'abc' | 'cqs' | 'joinTime') => {
    setSortBy(val);
    setUsersPage(1);
  };

  const handleSortOrderToggle = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setUsersPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCqsFilter('ALL');
    setSortBy('abc');
    setSortOrder('asc');
    setUsersPage(1);
  };

  const isFiltered = searchQuery !== '' || cqsFilter !== 'ALL' || sortBy !== 'abc' || sortOrder !== 'asc';

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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem' }}>
            User Profiles ({processedUsers.length}
            {processedUsers.length !== users.length ? ` of ${users.length}` : ''})
          </h2>
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px' }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Toolbar: Search, Sort, Filter */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            padding: '0.85rem',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by nickname, email, or u/reddit..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.25rem',
                paddingRight: searchQuery ? '2rem' : '0.75rem',
                fontSize: '0.85rem',
                height: '38px',
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                pointerEvents: 'none',
              }}
            >
              🔍
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter & Sort Controls Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
            {/* Filter by CQS */}
            <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
              <label
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '0.2rem',
                  fontWeight: 600,
                }}
              >
                Filter by CQS
              </label>
              <select
                className="form-input"
                value={cqsFilter}
                onChange={(e) => handleCqsChange(e.target.value)}
                style={{ fontSize: '0.8rem', height: '34px', padding: '0 0.5rem' }}
              >
                <option value="ALL">All CQS (Ranks)</option>
                <option value="D">Rank D (Lowest)</option>
                <option value="C">Rank C (Low)</option>
                <option value="B">Rank B (Moderate)</option>
                <option value="A">Rank A (High)</option>
                <option value="S">Rank S (Highest)</option>
              </select>
            </div>

            {/* Sort By */}
            <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
              <label
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '0.2rem',
                  fontWeight: 600,
                }}
              >
                Sort By
              </label>
              <select
                className="form-input"
                value={sortBy}
                onChange={(e) => handleSortByChange(e.target.value as 'abc' | 'cqs' | 'joinTime')}
                style={{ fontSize: '0.8rem', height: '34px', padding: '0 0.5rem' }}
              >
                <option value="abc">ABC (Alphabetical)</option>
                <option value="cqs">CQS (Rank Level)</option>
                <option value="joinTime">Join Time (Registered)</option>
              </select>
            </div>

            {/* Sort Direction Toggle */}
            <div style={{ minWidth: '90px' }}>
              <label
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '0.2rem',
                  fontWeight: 600,
                }}
              >
                Order
              </label>
              <button
                type="button"
                onClick={handleSortOrderToggle}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  height: '34px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                }}
              >
                {sortOrder === 'asc' ? 'ASC ▲' : 'DESC ▼'}
              </button>
            </div>
          </div>
        </div>

        {/* User List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {processedUsers.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
              No user accounts found matching current criteria.
            </p>
          ) : (
            (() => {
              const totalPages = Math.ceil(processedUsers.length / 5);
              const currentPage = Math.max(1, Math.min(usersPage, totalPages || 1));
              const displayedUsers = processedUsers.slice((currentPage - 1) * 5, currentPage * 5);
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
