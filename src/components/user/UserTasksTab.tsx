import { useState } from 'react';
import type { Task, ActiveBooking } from '../../types';
import AlertBanner from '../common/AlertBanner';
import Pagination from '../common/Pagination';
import AvailableTaskCard from './AvailableTaskCard';
import ActiveBookingCard from './ActiveBookingCard';

interface UserTasksTabProps {
  availableTasks: Task[];
  activeBookings: ActiveBooking[];
  bookingLimit: number;
  tasksPage: number;
  setTasksPage: (page: number) => void;
  isLoading: boolean;
  onBookTask: (taskId: string) => Promise<void>;
  onFormSubmit: (taskId: string, replyUrl: string, note?: string) => Promise<void>;
  onCancelBooking: (taskId: string) => Promise<void>;
  onRefreshData: () => void;
}

export default function UserTasksTab({
  availableTasks,
  activeBookings,
  bookingLimit,
  tasksPage,
  setTasksPage,
  isLoading,
  onBookTask,
  onFormSubmit,
  onCancelBooking,
  onRefreshData,
}: UserTasksTabProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const incompleteCount = activeBookings.filter((b) => b.status_id === 'incomplete').length;

  return (
    <div className="grid-2">
      {/* Left Column: Available Tasks */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Available Tasks ({availableTasks.length})</h2>

        <AlertBanner
          type="warning"
          message="Safety Warning: Do not perform these tasks too frequently, as it may put your account at risk of being banned. Increase your organic activity on Reddit (commenting, voting) to mitigate this risk."
        />

        {availableTasks.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
            No tasks currently available. Check back later!
          </p>
        ) : (
          (() => {
            const totalPages = Math.ceil(availableTasks.length / 5);
            const currentPage = Math.max(1, Math.min(tasksPage, totalPages || 1));
            const displayedTasks = availableTasks.slice((currentPage - 1) * 5, currentPage * 5);
            return (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {displayedTasks.map((task) => (
                    <AvailableTaskCard
                      key={task.id}
                      task={task}
                      isExpanded={expandedTasks.has(task.id)}
                      onToggleExpand={() => toggleTaskExpanded(task.id)}
                      onBookTask={onBookTask}
                      isLoading={isLoading}
                      isBookingDisabled={incompleteCount >= bookingLimit}
                    />
                  ))}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setTasksPage} />
              </>
            );
          })()
        )}
      </div>

      {/* Right Column: My Tasks (Active Bookings) */}
      <div className="glass-panel" style={{ padding: '1.75rem', height: 'fit-content' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>My Tasks</h2>

        {activeBookings.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
            You have no active tasks. Book up to {bookingLimit} from the available list!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activeBookings.map((booking) => (
              <ActiveBookingCard
                key={booking.booking_id}
                booking={booking}
                onSubmit={onFormSubmit}
                onCancel={onCancelBooking}
                isLoading={isLoading}
                onExpire={onRefreshData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
