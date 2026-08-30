import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import AlertBanner from '../components/common/AlertBanner';
import type { Task, Booking, ActiveBooking, CooldownInfo } from '../types';
import { useAuth } from '../hooks/useAuth';
import Guidelines from '../components/user/Guidelines';
import OnboardingModal from '../components/user/OnboardingModal';
import UserTasksTab from '../components/user/UserTasksTab';
import UserEarningsTab from '../components/user/UserEarningsTab';
import UserTaskHistoryTab from '../components/user/UserTaskHistoryTab';

export default function BasicDashboard() {
  const [basicTab, setBasicTab] = useState<'tasks' | 'history' | 'earnings' | 'guidelines'>('tasks');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Onboarding guidelines states
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('admin') || user?.roles.includes('choi') || false;
  const rankId = user?.account_rank?.id ?? user?.rank_id;
  const bookingLimit = isAdmin ? 99 : rankId === 'S' ? 3 : rankId === 'A' ? 2 : 1;

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const acknowledged = localStorage.getItem(`acknowledged_guidelines_${user.id}`);
      if (!acknowledged) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleAcknowledge = () => {
    if (user?.id) {
      localStorage.setItem(`acknowledged_guidelines_${user.id}`, 'true');
      setShowOnboarding(false);
    }
  };

  // Task & Earnings states
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([]);
  const [cooldown, setCooldown] = useState<CooldownInfo | undefined>(undefined);
  const [tasksPage, setTasksPage] = useState(1);
  const [earningsHistory, setEarningsHistory] = useState<Booking[]>([]);
  const [paidBalance, setPaidBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);

  useEffect(() => {
    setTasksPage(1);
  }, [basicTab]);

  const loadData = useCallback(async (clearError = true) => {
    try {
      setIsLoading(true);
      if (clearError) {
        setErrorMsg(null);
      }

      const [tasksData, earningsData] = await Promise.all([
        taskService.getAvailable(),
        taskService.getEarnings(),
      ]);

      setAvailableTasks(tasksData.available);
      setActiveBookings(tasksData.active || []);
      setCooldown(tasksData.cooldown);
      setEarningsHistory(earningsData.history);
      setPaidBalance(earningsData.paidBalance);
      setPendingBalance(earningsData.pendingBalance);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to sync dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBookTask = async (taskId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await taskService.book(taskId);
      setSuccessMsg('Task booked successfully! Go to My Tasks to perform it.');
      await loadData(false);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to book task.');
      await loadData(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (taskId: string, replyUrl: string, note?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await taskService.submit(taskId, replyUrl, note);
      setSuccessMsg('Submission sent successfully! Awaiting Admin approval.');
      await loadData(false);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit task.');
      await loadData(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (taskId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await taskService.cancel(taskId);
      setSuccessMsg('Booking cancelled successfully! The task is back in the available list.');
      await loadData(false);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to cancel booking.');
      await loadData(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header Bar */}
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
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Task Management Console</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Book tasks, submit proof, and track your accumulated balance.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="tab-navigation">
          <button
            onClick={() => setBasicTab('tasks')}
            className={`tab-button ${basicTab === 'tasks' ? 'active' : ''}`}
          >
            Tasks ({availableTasks.length})
          </button>
          <button
            onClick={() => setBasicTab('history')}
            className={`tab-button ${basicTab === 'history' ? 'active' : ''}`}
          >
            Task History
          </button>
          <button
            onClick={() => setBasicTab('earnings')}
            className={`tab-button ${basicTab === 'earnings' ? 'active' : ''}`}
          >
            Earnings (${(paidBalance + pendingBalance).toFixed(2)})
          </button>
          <button
            onClick={() => setBasicTab('guidelines')}
            className={`tab-button ${basicTab === 'guidelines' ? 'active' : ''}`}
          >
            Guidelines
          </button>
        </div>
      </div>

      <AlertBanner type="error" message={errorMsg} onClose={() => setErrorMsg(null)} />
      <AlertBanner type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />

      {/* Tab Content */}
      {basicTab === 'tasks' ? (
        <UserTasksTab
          availableTasks={availableTasks}
          activeBookings={activeBookings}
          cooldown={cooldown}
          bookingLimit={bookingLimit}
          userRankLevel={typeof user?.account_rank?.rank_level === 'number' ? user.account_rank.rank_level : 1}
          userRankName={user?.account_rank?.rank_name || 'Rank D'}
          isAdmin={user?.roles.includes('admin') || user?.roles.includes('choi') || false}
          tasksPage={tasksPage}
          setTasksPage={setTasksPage}
          isLoading={isLoading}
          onBookTask={handleBookTask}
          onFormSubmit={handleFormSubmit}
          onCancelBooking={handleCancelBooking}
          onRefreshData={loadData}
        />
      ) : basicTab === 'history' ? (
        <UserTaskHistoryTab />
      ) : basicTab === 'earnings' ? (
        <UserEarningsTab
          paidBalance={paidBalance}
          pendingBalance={pendingBalance}
          earningsHistory={earningsHistory}
        />
      ) : (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2
            style={{
              fontSize: '1.5rem',
              marginBottom: '1.5rem',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '0.75rem',
            }}
          >
            Platform Promotion Guidelines
          </h2>
          <Guidelines />
        </div>
      )}

      {/* Onboarding Overlay Modal */}
      <OnboardingModal isOpen={showOnboarding} onAcknowledge={handleAcknowledge} />
    </div>
  );
}

