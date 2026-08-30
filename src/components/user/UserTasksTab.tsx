import { useState } from 'react';
import type { Task, ActiveBooking, CooldownInfo } from '../../types';
import AlertBanner from '../common/AlertBanner';
import Pagination from '../common/Pagination';
import AvailableTaskCard from './AvailableTaskCard';
import ActiveBookingCard from './ActiveBookingCard';

interface UserTasksTabProps {
  availableTasks: Task[];
  activeBookings: ActiveBooking[];
  cooldown?: CooldownInfo;
  bookingLimit: number;
  userRankLevel?: number;
  userRankName?: string;
  isAdmin?: boolean;
  tasksPage: number;
  setTasksPage: (page: number) => void;
  isLoading: boolean;
  onBookTask: (taskId: string) => Promise<void>;
  onFormSubmit: (taskId: string, replyUrl: string, note?: string) => Promise<void>;
  onCancelBooking: (taskId: string) => Promise<void>;
  onRefreshData: () => void;
}

type PlatformFilter = 'ALL' | 'REDDIT' | 'PRODUCTHUNT';

function formatRemainingCooldown(ms: number): string {
  if (ms <= 0) return '0 minutes';
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (remHours > 0) parts.push(`${remHours} hour${remHours > 1 ? 's' : ''}`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);

  return parts.join(' ');
}

export default function UserTasksTab({
  availableTasks,
  activeBookings,
  cooldown,
  bookingLimit,
  userRankLevel = 1,
  userRankName = 'Rank D',
  isAdmin = false,
  tasksPage,
  setTasksPage,
  isLoading,
  onBookTask,
  onFormSubmit,
  onCancelBooking,
  onRefreshData,
}: UserTasksTabProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('ALL');

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
  const isCooldownActive = Boolean(cooldown?.isActive);

  // Filter tasks by platform
  const filteredTasks = platformFilter === 'ALL'
    ? availableTasks
    : availableTasks.filter((t) => t.platform === platformFilter);

  return (
    <div className="grid-2">
      {/* Left Column: Available Tasks */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Available Tasks ({filteredTasks.length})</h2>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {(['ALL', 'REDDIT', 'PRODUCTHUNT'] as PlatformFilter[]).map((pf) => (
              <button
                key={pf}
                onClick={() => setPlatformFilter(pf)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: platformFilter === pf ? 'var(--color-primary)' : 'transparent',
                  color: platformFilter === pf ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                }}
              >
                {pf === 'ALL' ? 'All' : pf === 'REDDIT' ? 'Reddit' : 'ProductHunt'}
              </button>
            ))}
          </div>
        </div>

        <AlertBanner
          type="warning"
          message="Safety Warning: Read the platform rules before doing any task. Do not do any task with 'no link' explicitly written in the rule."
        />

        {isCooldownActive && (
          <div
            style={{
              marginBottom: '1.25rem',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⏱️ 2-Day Cooldown Period Active
            </div>
            <div>
              You recently submitted proof for a task. To protect accounts from excessive activity, a <strong>2-day cooldown</strong> is required between task submissions.
            </div>
            {cooldown?.cooldownUntil && (
              <div style={{ fontSize: '0.8rem', opacity: 0.95, marginTop: '0.15rem' }}>
                Next task available in: <strong>{formatRemainingCooldown(cooldown.remainingMs)}</strong> (on {new Date(cooldown.cooldownUntil).toLocaleString()})
              </div>
            )}
          </div>
        )}

        {filteredTasks.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
            No tasks currently available{platformFilter !== 'ALL' ? ` for ${platformFilter}` : ''}. Check back later!
          </p>
        ) : (
          (() => {
            const totalPages = Math.ceil(filteredTasks.length / 5);
            const currentPage = Math.max(1, Math.min(tasksPage, totalPages || 1));
            const displayedTasks = filteredTasks.slice((currentPage - 1) * 5, currentPage * 5);
            return (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {displayedTasks.map((task) => (
                    <AvailableTaskCard
                      key={task.id}
                      task={task}
                      userRankLevel={userRankLevel}
                      userRankName={userRankName}
                      isAdmin={isAdmin}
                      cooldown={cooldown}
                      isExpanded={expandedTasks.has(task.id)}
                      onToggleExpand={() => toggleTaskExpanded(task.id)}
                      onBookTask={onBookTask}
                      isLoading={isLoading}
                      isBookingDisabled={incompleteCount >= bookingLimit || isCooldownActive}
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
