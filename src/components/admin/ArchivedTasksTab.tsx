import { useState } from 'react';
import type { Task } from '../../types';
import Pagination from '../common/Pagination';
import ArchivedTaskCard from './ArchivedTaskCard';
import { adminService } from '../../services/adminService';

interface ArchivedTasksTabProps {
  tasks: Task[];
  page: number;
  setPage: (page: number) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setErrorMsg: (msg: string | null) => void;
  setSuccessMsg: (msg: string | null) => void;
  onRefreshData: () => void;
  onEditTask?: (task: Task) => void;
  mode?: 'archived' | 'completed' | 'deleted';
  title?: string;
  subtitle?: string;
}

export default function ArchivedTasksTab({
  tasks,
  page,
  setPage,
  isLoading,
  setIsLoading,
  setErrorMsg,
  setSuccessMsg,
  onRefreshData,
  onEditTask,
  mode = 'archived',
  title,
  subtitle,
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

  const handleArchiveTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to move this task to Archived?')) {
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await adminService.archiveTask(taskId);
      setSuccessMsg('Task moved to Archived successfully.');
      onRefreshData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to archive task.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this task? This action will move it to the deleted list and cannot be undone from the site.'
      )
    ) {
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await adminService.deleteTask(taskId);
      setSuccessMsg('Task deleted successfully.');
      onRefreshData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete task.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tasks based on search & reason
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      ((task.target_subreddit || task.subreddit || '')).toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.client_request.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (reasonFilter === 'all') return true;
    if (reasonFilter === 'quota') return task.archive_reason?.includes('Quota');
    if (reasonFilter === 'deadline') return task.archive_reason?.includes('Deadline');
    if (reasonFilter === 'failures') return task.archive_reason?.includes('Failures');

    return true;
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  const displayedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const displayTitle = title || (mode === 'archived' ? `📦 Archived Tasks (${tasks.length})` : mode === 'completed' ? `🏁 Completed & Expired Tasks (${tasks.length})` : `🗑️ Deleted Tasks (${tasks.length})`);
  const displaySubtitle = subtitle || (mode === 'archived' ? 'Explicitly archived campaigns by administrator.' : mode === 'completed' ? 'Tasks that have completed their target quota or passed their deadline.' : 'Soft-deleted tasks stored to keep worker earnings and proof links intact (cannot be restored).');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Controls & Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {displayTitle}
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
              {displaySubtitle}
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
                setPage(1);
              }}
              style={{ minWidth: '220px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            />

            {mode === 'completed' && (
              <select
                className="input"
                value={reasonFilter}
                onChange={(e) => {
                  setReasonFilter(e.target.value);
                  setPage(1);
                }}
                style={{ minWidth: '160px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              >
                <option value="all">All Reasons</option>
                <option value="quota">📉 Quota Depleted</option>
                <option value="deadline">⏰ Deadline Passed</option>
                <option value="failures">⚠️ Excessive Failures</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredTasks.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem 1rem' }}>
              {tasks.length === 0
                ? `No ${mode} tasks found.`
                : 'No tasks match your search filter.'}
            </p>
          ) : (
            <>
              {displayedTasks.map((task) => (
                <ArchivedTaskCard
                  key={task.id}
                  task={task}
                  isExpanded={expandedTasks.has(task.id)}
                  onToggleExpand={() => toggleTaskExpanded(task.id)}
                  onRestore={mode === 'archived' ? handleRestoreTask : undefined}
                  onArchive={mode === 'completed' ? handleArchiveTask : undefined}
                  onEdit={mode !== 'deleted' ? onEditTask : undefined}
                  onDelete={mode !== 'deleted' ? handleDeleteTask : undefined}
                  isDeletedView={mode === 'deleted'}
                  isLoading={isLoading}
                />
              ))}
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
