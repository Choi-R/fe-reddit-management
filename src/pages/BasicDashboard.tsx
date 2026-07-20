import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import AlertBanner from '../components/AlertBanner';
import type { Task, Booking, ActiveBooking } from '../types';
import { useAuth } from '../hooks/useAuth';
import Guidelines from '../components/Guidelines';
import OnboardingModal from '../components/OnboardingModal';
import UserTasksTab from '../components/UserTasksTab';
import UserEarningsTab from '../components/UserEarningsTab';

export default function BasicDashboard() {
  const [basicTab, setBasicTab] = useState<'tasks' | 'earnings' | 'guidelines'>('tasks');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Onboarding guidelines states
  const { user } = useAuth();
  const isSilver = user?.roles.includes('silver') || false;
  const isGold = user?.roles.includes('gold') || false;
  const bookingLimit = isGold ? 3 : isSilver ? 2 : 1;

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
  const [tasksPage, setTasksPage] = useState(1);
  const [earningsHistory, setEarningsHistory] = useState<Booking[]>([]);
  const [paidBalance, setPaidBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);

  useEffect(() => {
    setTasksPage(1);
  }, [basicTab]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      const [tasksData, earningsData] = await Promise.all([
        taskService.getAvailable(),
        taskService.getEarnings(),
      ]);

      setAvailableTasks(tasksData.available);
      setActiveBookings(tasksData.active || []);
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
      loadData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to book task.');
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
      loadData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit task.');
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
      loadData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to cancel booking.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container dashboard-container">
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
          bookingLimit={bookingLimit}
          tasksPage={tasksPage}
          setTasksPage={setTasksPage}
          isLoading={isLoading}
          onBookTask={handleBookTask}
          onFormSubmit={handleFormSubmit}
          onCancelBooking={handleCancelBooking}
          onRefreshData={loadData}
        />
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
            Reddit Promotion Guidelines
          </h2>
          <Guidelines />
        </div>
      )}

      {/* Onboarding Overlay Modal */}
      <OnboardingModal isOpen={showOnboarding} onAcknowledge={handleAcknowledge} />
    </div>
  );
}
