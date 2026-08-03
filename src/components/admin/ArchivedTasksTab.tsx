import { useState } from 'react';
import type { Task } from '../../types';
import Pagination from '../common/Pagination';
import ArchivedTaskCard from './ArchivedTaskCard';
import { adminService } from '../../services/adminService';

interface ArchivedTasksTabProps {
  archivedTasks: Task[];
  archivedPage: number;
  setArchivedPage: (page: number) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setErrorMsg: (msg: string | null) => void;
  setSuccessMsg: (msg: string | null) => void;
  onRefreshData: () => void;
  onEditTask?: (task: Task) => void;
}

export default function ArchivedTasksTab({
  archivedTasks,
  archivedPage,
  setArchivedPage,
  isLoading,
  setIsLoading,
  setErrorMsg,
  setSuccessMsg,
  onRefreshData,
  onEditTask,
}: ArchivedTasksTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
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

  const handleRestoreTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to restore this task to Active status?')) {
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await adminService.restoreTask(taskId);
      let successMessage = 'Task restored to Active status successfully.';
      if (res.telegramNotified) {
        successMessage += ' Telegram group notified.';
      }
      setSuccessMsg(successMessage);
      onRefreshData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to restore task.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermanentDelete = async (taskId: string) => {
    if (
      !window.confirm(
        '⚠️ PERMANENT DELETE WARNING: Are you sure you want to permanently delete this task? This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await adminService.deleteTask(taskId, true);
      setSuccessMsg('Task permanently deleted.');
      onRefreshData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to permanently delete task.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tasks based on search & reason
  const filteredTasks = archivedTasks.filter((task) => {
    const matchesSearch =
      (task.subreddit || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.client_request.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (reasonFilter === 'all') return true;
    if (reasonFilter === 'deleted') return task.archive_reason?.includes('Deleted');
    if (reasonFilter === 'quota') return task.archive_reason?.includes('Quota');
    if (reasonFilter === 'deadline') return task.archive_reason?.includes('Deadline');
    if (reasonFilter === 'failures') return task.archive_reason?.includes('Failures');

    return true;
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const currentPage = Math.max(1, Math.min(archivedPage, totalPages || 1));
  const displayedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Controls & Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📦 Archived Tasks ({archivedTasks.length})
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
              Tasks moved to Archive when deleted, expired deadline, 0 quota, or &gt;3x failure threshold.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              className="input"
              placeholder="Search by subreddit, url, or keyword..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setArchivedPage(1);
              }}
              style={{ minWidth: '220px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            />

            <select
              className="input"
              value={reasonFilter}
              onChange={(e) => {
                setReasonFilter(e.target.value);
                setArchivedPage(1);
              }}
              style={{ minWidth: '160px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="all">All Archive Reasons</option>
              <option value="deleted">🗑️ Deleted by Admin</option>
              <option value="quota">📉 Quota Depleted</option>
              <option value="deadline">⏰ Deadline Passed</option>
              <option value="failures">⚠️ Excessive Failures</option>
            </select>
          </div>
        </div>
      </div>

      {/* Archived Cards List */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredTasks.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem 1rem' }}>
              {archivedTasks.length === 0
                ? 'No archived tasks found. Active tasks will appear here when archived or deleted.'
                : 'No archived tasks match your search filters.'}
            </p>
          ) : (
            <>
              {displayedTasks.map((task) => (
                <ArchivedTaskCard
                  key={task.id}
                  task={task}
                  isExpanded={expandedTasks.has(task.id)}
                  onToggleExpand={() => toggleTaskExpanded(task.id)}
                  onRestore={handleRestoreTask}
                  onEdit={onEditTask}
                  onPermanentDelete={handlePermanentDelete}
                  isLoading={isLoading}
                />
              ))}
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setArchivedPage} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
