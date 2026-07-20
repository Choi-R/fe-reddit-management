import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import AlertBanner from '../components/AlertBanner';
import type { Task, BasicUserSummary, UserDetailStats, PendingSubmission } from '../types';
import TasksTab from '../components/TasksTab';
import PendingReviewsTab from '../components/PendingReviewsTab';
import PayoutsTab from '../components/PayoutsTab';
import UserManagementTab from '../components/UserManagementTab';
import UserStatsModal from '../components/UserStatsModal';

export default function AdminDashboard() {
  const [adminTab, setAdminTab] = useState<'tasks' | 'reviews' | 'payouts' | 'users'>('tasks');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data states
  const [adminTasks, setAdminTasks] = useState<Task[]>([]);
  const [adminUsers, setAdminUsers] = useState<BasicUserSummary[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);

  // Pagination states
  const [tasksPage, setTasksPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);

  // User Details & Stats modal states
  const [selectedUserStats, setSelectedUserStats] = useState<UserDetailStats | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // Reset page numbers when tab changes
  useEffect(() => {
    setTasksPage(1);
    setUsersPage(1);
  }, [adminTab]);

  const loadTabData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (adminTab === 'tasks') {
        const [tasksData, usersData] = await Promise.all([
          adminService.getTasks(),
          adminService.getUsers(),
        ]);
        setAdminTasks(tasksData.tasks);
        setAdminUsers(usersData.users);
      } else if (adminTab === 'users' || adminTab === 'payouts') {
        const data = await adminService.getUsers();
        setAdminUsers(data.users);
      } else if (adminTab === 'reviews') {
        const data = await adminService.getPendingReviews();
        setPendingSubmissions(data.bookings);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to fetch dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, [adminTab]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  const handleOpenUserStats = async (userId: string) => {
    setIsStatsLoading(true);
    setIsStatsModalOpen(true);
    try {
      const res = await adminService.getUserDetail(userId);
      setSelectedUserStats(res.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load user details');
      setIsStatsModalOpen(false);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const handleCloseUserStats = () => {
    setIsStatsModalOpen(false);
    setSelectedUserStats(null);
  };

  return (
    <div className="container dashboard-container" style={{ paddingBottom: '4rem' }}>
      {/* Page Title & Tab Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Admin Management Console</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            System Administration & Control Center
          </p>
        </div>

        <div className="tab-navigation">
          <button
            onClick={() => setAdminTab('tasks')}
            className={`tab-button ${adminTab === 'tasks' ? 'active' : ''}`}
          >
            Tasks ({adminTasks.length})
          </button>
          <button
            onClick={() => setAdminTab('reviews')}
            className={`tab-button ${adminTab === 'reviews' ? 'active' : ''}`}
          >
            Pending Reviews ({pendingSubmissions.length})
          </button>
          <button
            onClick={() => setAdminTab('payouts')}
            className={`tab-button ${adminTab === 'payouts' ? 'active' : ''}`}
          >
            Payouts Ledger
          </button>
          <button
            onClick={() => setAdminTab('users')}
            className={`tab-button ${adminTab === 'users' ? 'active' : ''}`}
          >
            User Profiles ({adminUsers.length})
          </button>
        </div>
      </div>

      <AlertBanner message={errorMsg} type="error" onClose={() => setErrorMsg(null)} />
      <AlertBanner message={successMsg} type="success" onClose={() => setSuccessMsg(null)} />

      {/* Tab 1: Tasks */}
      {adminTab === 'tasks' && (
        <TasksTab
          tasks={adminTasks}
          users={adminUsers}
          tasksPage={tasksPage}
          setTasksPage={setTasksPage}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setErrorMsg={setErrorMsg}
          setSuccessMsg={setSuccessMsg}
          onRefreshData={loadTabData}
        />
      )}

      {/* Tab 2: Reviews */}
      {adminTab === 'reviews' && (
        <PendingReviewsTab
          pendingSubmissions={pendingSubmissions}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setErrorMsg={setErrorMsg}
          setSuccessMsg={setSuccessMsg}
          onRefreshData={loadTabData}
        />
      )}

      {/* Tab 3: Payouts */}
      {adminTab === 'payouts' && (
        <PayoutsTab
          users={adminUsers}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setErrorMsg={setErrorMsg}
          setSuccessMsg={setSuccessMsg}
          onRefreshData={loadTabData}
        />
      )}

      {/* Tab 4: User Profiles */}
      {adminTab === 'users' && (
        <UserManagementTab
          users={adminUsers}
          usersPage={usersPage}
          setUsersPage={setUsersPage}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setErrorMsg={setErrorMsg}
          setSuccessMsg={setSuccessMsg}
          onRefreshData={loadTabData}
          onOpenUserStats={handleOpenUserStats}
        />
      )}

      {/* User Detail & Statistics Modal */}
      <UserStatsModal
        isOpen={isStatsModalOpen}
        isLoading={isStatsLoading}
        stats={selectedUserStats}
        onClose={handleCloseUserStats}
      />
    </div>
  );
}
