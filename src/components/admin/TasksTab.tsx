import { useState } from 'react';
import type { Task, BasicUserSummary } from '../../types';
import Pagination from '../common/Pagination';
import { adminService } from '../../services/adminService';
import TaskSingleForm from './TaskSingleForm';
import TaskBulkImportForm from './TaskBulkImportForm';
import AdminTaskCard from './AdminTaskCard';

interface TasksTabProps {
  tasks: Task[];
  users: BasicUserSummary[];
  tasksPage: number;
  setTasksPage: (page: number) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setErrorMsg: (msg: string | null) => void;
  setSuccessMsg: (msg: string | null) => void;
  onRefreshData: () => void;
}

export default function TasksTab({
  tasks,
  users,
  tasksPage,
  setTasksPage,
  isLoading,
  setIsLoading,
  setErrorMsg,
  setSuccessMsg,
  onRefreshData,
}: TasksTabProps) {
  const [taskTabMode, setTaskTabMode] = useState<'single' | 'bulk'>('single');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
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

  const handleCancelEdit = () => {
    setEditingTask(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    const formElement = document.getElementById('taskFormTitle');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this task? This will also remove any bookings associated with it.'
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
      if (editingTask?.id === taskId) {
        handleCancelEdit();
      }
      onRefreshData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete task.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid-2">
      {/* Create / Edit / Bulk Form */}
      <div className="glass-panel" style={{ padding: '1.75rem', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 id="taskFormTitle" style={{ fontSize: '1.25rem', margin: 0 }}>
            {editingTask ? 'Edit Task' : taskTabMode === 'single' ? 'Create New Task' : 'Bulk Import Tasks'}
          </h2>

          {!editingTask && (
            <div className="tab-navigation">
              <button
                type="button"
                onClick={() => setTaskTabMode('single')}
                className={`tab-button ${taskTabMode === 'single' ? 'active' : ''}`}
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              >
                Single
              </button>
              <button
                type="button"
                onClick={() => setTaskTabMode('bulk')}
                className={`tab-button ${taskTabMode === 'bulk' ? 'active' : ''}`}
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              >
                Bulk Import
              </button>
            </div>
          )}
        </div>

        {taskTabMode === 'single' || editingTask ? (
          <TaskSingleForm
            key={editingTask ? editingTask.id : 'new'}
            editingTask={editingTask}
            users={users}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setErrorMsg={setErrorMsg}
            setSuccessMsg={setSuccessMsg}
            onCancelEdit={handleCancelEdit}
            onRefreshData={onRefreshData}
          />
        ) : (
          <TaskBulkImportForm
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setErrorMsg={setErrorMsg}
            setSuccessMsg={setSuccessMsg}
            onRefreshData={onRefreshData}
          />
        )}
      </div>

      {/* Tasks List */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Active Tasks ({tasks.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          {tasks.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
              No tasks found. Create one to begin!
            </p>
          ) : (
            (() => {
              const totalPages = Math.ceil(tasks.length / 5);
              const currentPage = Math.max(1, Math.min(tasksPage, totalPages || 1));
              const displayedTasks = tasks.slice((currentPage - 1) * 5, currentPage * 5);
              return (
                <>
                  {displayedTasks.map((task) => (
                    <AdminTaskCard
                      key={task.id}
                      task={task}
                      isExpanded={expandedTasks.has(task.id)}
                      onToggleExpand={() => toggleTaskExpanded(task.id)}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteTask}
                      isLoading={isLoading}
                    />
                  ))}
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setTasksPage} />
                </>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
