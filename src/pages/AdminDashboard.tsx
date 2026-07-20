import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import * as XLSX from 'xlsx';
import AlertBanner from '../components/AlertBanner';
import StatusTag from '../components/StatusTag';
import Pagination from '../components/Pagination';
import type { Task, BasicUserSummary, PendingSubmission } from '../types';

function getRelativeTimeString(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (isNaN(diffMs)) {
    return '';
  }

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    const remainingMins = diffMins % 60;
    if (remainingMins === 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}, ${remainingMins} ${remainingMins === 1 ? 'minute' : 'minutes'} ago`;
  } else {
    const remainingHours = diffHours % 24;
    if (remainingHours === 0) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}, ${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'} ago`;
  }
}

export default function AdminDashboard() {
  const [adminTab, setAdminTab] = useState<'tasks' | 'reviews' | 'payouts' | 'users'>('tasks');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data states
  const [adminTasks, setAdminTasks] = useState<Task[]>([]);
  const [adminUsers, setAdminUsers] = useState<BasicUserSummary[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);

  // Pagination and Expand/Collapse states
  const [tasksPage, setTasksPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
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

  // Reset page numbers when tab changes
  useEffect(() => {
    setTasksPage(1);
    setUsersPage(1);
  }, [adminTab]);

  // Task form states
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskUrl, setNewTaskUrl] = useState('');
  const [newTaskClientRequest, setNewTaskClientRequest] = useState('');
  const [newTaskQuota, setNewTaskQuota] = useState(1);
  const [newTaskPrice, setNewTaskPrice] = useState('');
  const [newTaskTypeId, setNewTaskTypeId] = useState('normal');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Task bulk add states
  const [taskAddMode, setTaskAddMode] = useState<'single' | 'bulk'>('single');
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkTasks, setBulkTasks] = useState<Array<{
    url: string;
    clientRequest: string;
    deadline: string | null;
    price: number;
    isValid: boolean;
    error?: string;
  }>>([]);
  const [hasHeader, setHasHeader] = useState(true);

  // Auto reset to single task add mode when editing starts
  useEffect(() => {
    if (editingTask) {
      setTaskAddMode('single');
    }
  }, [editingTask]);

  // User form states
  const [newBasicEmail, setNewBasicEmail] = useState('');
  const [newBasicPassword, setNewBasicPassword] = useState('');
  const [newBasicPaypal, setNewBasicPaypal] = useState('');
  const [newBasicReddit, setNewBasicReddit] = useState('');
  const [editingUser, setEditingUser] = useState<BasicUserSummary | null>(null);

  // Review note state
  const [reviewNote, setReviewNote] = useState('');

  // ─── Data Loaders ─────────────────────────────────────────────────

  const loadTabData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      if (adminTab === 'tasks') {
        const data = await adminService.getTasks();
        setAdminTasks(data.tasks);
        try {
          const usersData = await adminService.getUsers();
          setAdminUsers(usersData.users);
        } catch (usersErr) {
          console.warn('Failed to load users for assignment autocomplete:', usersErr);
        }
      } else if (adminTab === 'users' || adminTab === 'payouts') {
        const data = await adminService.getUsers();
        setAdminUsers(data.users);
      } else if (adminTab === 'reviews') {
        const data = await adminService.getPendingReviews();
        setPendingSubmissions(data.bookings || []);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to sync admin console.');
    } finally {
      setIsLoading(false);
    }
  }, [adminTab]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  // ─── Action Handlers ──────────────────────────────────────────────

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskUrl || !newTaskClientRequest || !newTaskPrice) {
      setErrorMsg('Reddit URL, request, and price are required.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const taskData = {
        url: newTaskUrl,
        clientRequest: newTaskClientRequest,
        quota: parseInt(newTaskQuota.toString()),
        price: parseFloat(newTaskPrice),
        typeId: newTaskTypeId,
        assignedTo: newTaskAssignedTo || null,
        deadline: newTaskDeadline ? new Date(newTaskDeadline).toISOString() : null,
      };

      if (editingTask) {
        await adminService.updateTask(editingTask.id, taskData);
        setSuccessMsg('Task updated successfully!');
      } else {
        await adminService.createTask(taskData);
        setSuccessMsg('New task added successfully!');
      }

      setEditingTask(null);
      setNewTaskUrl('');
      setNewTaskClientRequest('');
      setNewTaskQuota(1);
      setNewTaskPrice('');
      setNewTaskAssignedTo('');
      setNewTaskDeadline('');
      loadTabData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save task.');
    } finally {
      setIsLoading(false);
    }
  };

  const parseSpreadsheetFile = useCallback((file: File, skipHeader: boolean) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Use header: 1 to get a 2D array
        const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        const startingIndex = skipHeader ? 1 : 0;
        const parsed: Array<{
          url: string;
          clientRequest: string;
          deadline: string | null;
          price: number;
          isValid: boolean;
          error?: string;
        }> = [];

        for (let i = startingIndex; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row || row.length === 0) continue;

          // Check if the row is entirely empty
          const hasAnyValue = row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
          if (!hasAnyValue) continue;

          const rawUrl = row[0];
          const rawRequest = row[1];
          const rawDeadline = row[2];
          const rawPrice = row[3];

          const errors: string[] = [];

          // Validate URL
          const urlStr = rawUrl ? String(rawUrl).trim() : '';
          if (!urlStr) {
            errors.push('Reddit URL is required');
          } else {
            try {
              new URL(urlStr);
            } catch {
              errors.push('Invalid URL format');
            }
          }

          // Validate Client Request
          const requestStr = rawRequest ? String(rawRequest).trim() : '';
          if (!requestStr) {
            errors.push('Client request is required');
          }

          // Validate Price
          const priceNum = rawPrice !== undefined && rawPrice !== null ? parseFloat(rawPrice) : NaN;
          if (isNaN(priceNum) || priceNum <= 0) {
            errors.push('Price must be a positive number');
          }

          // Validate Deadline
          let formattedDeadline: string | null = null;
          if (rawDeadline) {
            if (rawDeadline instanceof Date) {
              if (isNaN(rawDeadline.getTime())) {
                errors.push('Invalid date format');
              } else {
                formattedDeadline = rawDeadline.toISOString().split('T')[0];
              }
            } else {
              const deadlineStr = String(rawDeadline).trim();
              if (deadlineStr) {
                const d = new Date(deadlineStr);
                if (isNaN(d.getTime())) {
                  errors.push('Invalid date format');
                } else {
                  formattedDeadline = d.toISOString().split('T')[0];
                }
              }
            }
          }

          parsed.push({
            url: urlStr,
            clientRequest: requestStr,
            deadline: formattedDeadline,
            price: isNaN(priceNum) ? 0 : priceNum,
            isValid: errors.length === 0,
            error: errors.join(', ')
          });
        }

        setBulkTasks(parsed);
      } catch (err: any) {
        setErrorMsg(err instanceof Error ? err.message : 'Error reading spreadsheet file.');
        setBulkTasks([]);
      }
    };
    reader.onerror = () => {
      setErrorMsg('File loading error.');
      setBulkTasks([]);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBulkFile(file);
    if (file) {
      parseSpreadsheetFile(file, hasHeader);
    } else {
      setBulkTasks([]);
    }
  };

  const handleHeaderToggle = (checked: boolean) => {
    setHasHeader(checked);
    if (bulkFile) {
      parseSpreadsheetFile(bulkFile, checked);
    }
  };

  const handleDownloadSample = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(
      "Reddit URL,Client Request,Deadline,Price\n" +
      "https://www.reddit.com/r/pics/comments/example_post,Please upvote this post and write a positive comment,2026-08-01,5.00"
    );
    const link = document.createElement("a");
    link.href = csvContent;
    link.download = "bulk_tasks_template.csv";
    link.click();
  };

  const handleBulkUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkTasks.length === 0) {
      setErrorMsg('No tasks found in the uploaded file.');
      return;
    }

    const invalidTasks = bulkTasks.filter(t => !t.isValid);
    if (invalidTasks.length > 0) {
      setErrorMsg(`Cannot upload. There are ${invalidTasks.length} invalid tasks. Please correct errors and re-upload.`);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const tasksData = bulkTasks.map(t => ({
        url: t.url,
        clientRequest: t.clientRequest,
        price: t.price,
        deadline: t.deadline ? new Date(t.deadline).toISOString() : null
      }));

      const res = await adminService.bulkCreateTasks(tasksData);
      setSuccessMsg(`Successfully imported ${res.count} tasks from file!`);
      
      setBulkFile(null);
      setBulkTasks([]);
      loadTabData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to import bulk tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setNewTaskUrl('');
    setNewTaskClientRequest('');
    setNewTaskQuota(1);
    setNewTaskPrice('');
    setNewTaskAssignedTo('');
    setNewTaskDeadline('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setNewTaskUrl(task.url);
    setNewTaskClientRequest(task.client_request);
    setNewTaskQuota(task.quota);
    setNewTaskPrice(task.price);
    setNewTaskTypeId(task.type_id);
    setNewTaskAssignedTo(task.assigned_to_email || '');
    if (task.deadline) {
      setNewTaskDeadline(task.deadline.substring(0, 10));
    } else {
      setNewTaskDeadline('');
    }
    // Scroll form into view
    const formElement = document.getElementById('taskFormTitle');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task? This will also remove any bookings associated with it.')) {
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
      loadTabData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete task.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBasicEmail || !newBasicReddit) {
      setErrorMsg('Email and Reddit username/link are required.');
      return;
    }
    if (!editingUser && !newBasicPassword) {
      setErrorMsg('Initial password is required.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (editingUser) {
        await adminService.updateUser(editingUser.id, {
          email: newBasicEmail,
          paypal: newBasicPaypal || null,
          reddit: newBasicReddit,
        });
        if (newBasicPassword) {
          await adminService.updateUserPassword(editingUser.id, newBasicPassword);
        }
        setSuccessMsg(`User "${newBasicEmail}" updated successfully!`);
        setEditingUser(null);
      } else {
        await adminService.createUser({
          email: newBasicEmail,
          password: newBasicPassword,
          paypal: newBasicPaypal || null,
          reddit: newBasicReddit,
        });
        setSuccessMsg(`User "${newBasicEmail}" registered successfully! A welcome email has been sent to them (remind them to check their spam folder).`);
      }
      setNewBasicEmail('');
      setNewBasicPassword('');
      setNewBasicPaypal('');
      setNewBasicReddit('');
      loadTabData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save user.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelUserEdit = () => {
    setEditingUser(null);
    setNewBasicEmail('');
    setNewBasicPassword('');
    setNewBasicPaypal('');
    setNewBasicReddit('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleEditUserClick = (u: BasicUserSummary) => {
    setEditingUser(u);
    setNewBasicEmail(u.email);
    setNewBasicPassword('');
    setNewBasicPaypal(u.paypal || '');
    setNewBasicReddit(u.reddit);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${email}"? This action cannot be undone and will delete all their task assignments and submissions.`)) {
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await adminService.deleteUser(userId);
      setSuccessMsg(`User "${email}" deleted successfully!`);
      if (editingUser?.id === userId) {
        handleCancelUserEdit();
      }
      loadTabData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete user.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmission = async (bookingId: string, statusId: 'success' | 'failed') => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const data = await adminService.reviewSubmission(bookingId, statusId, reviewNote || null);
      if (statusId === 'failed' && data.quotaReturned) {
        setSuccessMsg('Task marked as Failed. Task quota has been returned by 1.');
      } else {
        setSuccessMsg(`Task marked as ${statusId === 'success' ? 'Approved' : 'Failed'}.`);
      }
      setReviewNote('');
      loadTabData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to review submission.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayout = async (userId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const data = await adminService.recordPayout(userId);
      setSuccessMsg(data.message || 'Payout recorded successfully.');
      loadTabData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to record payout.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get autocomplete user suggestions
  const getSuggestions = () => {
    const query = newTaskAssignedTo.trim().toLowerCase();
    if (query.length < 3) return [];

    const cleanQuery = query.replace(/^\/?u\//i, '');

    return adminUsers
      .filter((u) => {
        const emailMatch = u.email.toLowerCase().includes(cleanQuery);
        const redditMatch = u.reddit.toLowerCase().includes(cleanQuery);
        return emailMatch || redditMatch;
      })
      .slice(0, 3);
  };

  const suggestions = getSuggestions();

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div>
      {errorMsg && <AlertBanner type="error" message={errorMsg} />}
      {successMsg && <AlertBanner type="success" message={successMsg} />}

      <div className="tab-container">
        <button
          onClick={() => setAdminTab('tasks')}
          className={`tab-btn ${adminTab === 'tasks' ? 'active' : ''}`}
        >
          Tasks Listing
        </button>
        <button
          onClick={() => setAdminTab('reviews')}
          className={`tab-btn ${adminTab === 'reviews' ? 'active' : ''}`}
        >
          Pending Reviews
        </button>
        <button
          onClick={() => setAdminTab('payouts')}
          className={`tab-btn ${adminTab === 'payouts' ? 'active' : ''}`}
        >
          PayPal Payouts
        </button>
        <button
          onClick={() => setAdminTab('users')}
          className={`tab-btn ${adminTab === 'users' ? 'active' : ''}`}
        >
          User Management
        </button>
      </div>

      {/* ── Tasks Tab ──────────────────────────────────────────────── */}
      {adminTab === 'tasks' && (
        <div className="grid-2">
          {/* Add/Edit Task Form */}
          {/* Add/Edit Task Form */}
          <div className="glass-panel" style={{ padding: '1.75rem', height: 'fit-content' }}>
            <h2 id="taskFormTitle" style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
              {editingTask ? 'Edit Task' : taskAddMode === 'bulk' ? 'Bulk Add Tasks' : 'Create New Task'}
            </h2>

            {!editingTask && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setTaskAddMode('single')}
                  className={`btn ${taskAddMode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                >
                  Single Task
                </button>
                <button
                  type="button"
                  onClick={() => setTaskAddMode('bulk')}
                  className={`btn ${taskAddMode === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                >
                  Bulk Add
                </button>
              </div>
            )}

            {taskAddMode === 'single' ? (
              <form onSubmit={handleSaveTask}>
                <div className="form-group">
                  <label htmlFor="taskUrl">Reddit URL (Post or Comment)*</label>
                  <input
                    id="taskUrl"
                    type="url"
                    className="form-input"
                    placeholder="https://reddit.com/r/..."
                    value={newTaskUrl}
                    onChange={(e) => setNewTaskUrl(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="taskClientRequest">Client Request Instructions*</label>
                  <textarea
                    id="taskClientRequest"
                    className="form-input"
                    style={{ resize: 'vertical', minHeight: '80px' }}
                    placeholder="Detailed tasks client instructions..."
                    value={newTaskClientRequest}
                    onChange={(e) => setNewTaskClientRequest(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: '1' }}>
                    <label htmlFor="taskQuota">Quota Slots*</label>
                    <input
                      id="taskQuota"
                      type="number"
                      min="1"
                      className="form-input"
                      value={newTaskQuota}
                      onChange={(e) => setNewTaskQuota(parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: '1' }}>
                    <label htmlFor="taskPrice">Price ($)*</label>
                    <input
                      id="taskPrice"
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="form-input"
                      placeholder="5.00"
                      value={newTaskPrice}
                      onChange={(e) => setNewTaskPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: '1' }}>
                    <label htmlFor="taskTypeId">Task Category*</label>
                    <select
                      id="taskTypeId"
                      className="form-input"
                      value={newTaskTypeId}
                      onChange={(e) => setNewTaskTypeId(e.target.value)}
                    >
                      <option value="normal">Normal</option>
                      <option value="edu_app">Edu App</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: '1', position: 'relative' }}>
                    <label htmlFor="taskAssignedTo">Assign User (Email or Reddit Username) (Optional)</label>
                    <input
                      id="taskAssignedTo"
                      type="text"
                      className="form-input"
                      placeholder="user@example.com or reddit_user"
                      value={newTaskAssignedTo}
                      onChange={(e) => {
                        setNewTaskAssignedTo(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      autoComplete="nope"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: '#111827',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          marginTop: '4px',
                          zIndex: 10,
                          boxShadow: 'var(--shadow-lg)',
                          overflow: 'hidden',
                        }}
                      >
                        {suggestions.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => {
                              setNewTaskAssignedTo(u.email);
                              setShowSuggestions(false);
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            style={{
                              padding: '0.75rem 1rem',
                              cursor: 'pointer',
                              borderBottom: '1px solid var(--border-color)',
                              fontSize: '0.85rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              color: 'var(--text-primary)',
                            }}
                          >
                            <span style={{ fontWeight: 500 }}>{u.email}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>u/{u.reddit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="taskDeadline">Hard Deadline Date (Optional)</label>
                  <input
                    id="taskDeadline"
                    type="date"
                    className="form-input"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                  />
                </div>

                {editingTask ? (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      disabled={isLoading}
                    >
                      Update Task
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={isLoading}
                  >
                    Publish Task
                  </button>
                )}
              </form>
            ) : (
              <form onSubmit={handleBulkUploadSubmit}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  fontSize: '0.825rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    File Column Formatting Guide
                  </div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                    Please format your spreadsheet (Excel or CSV) with these columns in order (from left to right):
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1rem', paddingLeft: '0.25rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Col A:</span>
                    <span><strong>Reddit URL</strong> (Required, e.g. <code>https://reddit.com/...</code>)</span>

                    <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Col B:</span>
                    <span><strong>Client Request</strong> (Required, text instructions)</span>

                    <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Col C:</span>
                    <span><strong>Deadline</strong> (Optional, date format e.g. <code>YYYY-MM-DD</code>)</span>

                    <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Col D:</span>
                    <span><strong>Price</strong> (Required, positive number e.g. <code>5.00</code>)</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Note: Check "First row contains column headers" if using a header row.
                    </span>
                    <button 
                      type="button" 
                      onClick={handleDownloadSample}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textDecoration: 'underline',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download CSV Template
                    </button>
                  </div>
                </div>

                <div 
                  style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: '12px',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    marginBottom: '1rem',
                    transition: 'all 0.2s ease',
                    backgroundColor: bulkFile ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                    borderColor: bulkFile ? 'var(--color-primary)' : 'var(--border-color)',
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = bulkFile ? 'var(--color-primary)' : 'var(--border-color)';
                    e.currentTarget.style.backgroundColor = bulkFile ? 'rgba(99, 102, 241, 0.03)' : 'transparent';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      setBulkFile(file);
                      parseSpreadsheetFile(file, hasHeader);
                    }
                  }}
                  onClick={() => document.getElementById('bulkFileInput')?.click()}
                >
                  <input
                    id="bulkFileInput"
                    type="file"
                    accept=".csv, .xlsx, .xls, .ods"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <svg
                    style={{ width: '40px', height: '40px', color: bulkFile ? 'var(--color-primary)' : 'var(--text-secondary)', marginBottom: '0.75rem' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    {bulkFile ? bulkFile.name : 'Click to upload or drag & drop'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Supports Excel (.xlsx, .xls), CSV (.csv), ODS
                  </p>
                  {bulkFile && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 500, marginTop: '0.5rem' }}>
                      {(bulkFile.size / 1024).toFixed(1)} KB
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <input
                    id="bulkHeaderToggle"
                    type="checkbox"
                    checked={hasHeader}
                    onChange={(e) => handleHeaderToggle(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="bulkHeaderToggle" style={{ cursor: 'pointer', fontSize: '0.85rem', margin: 0, userSelect: 'none' }}>
                    First row contains column headers
                  </label>
                </div>

                {bulkFile && bulkTasks.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                        Preview ({bulkTasks.length} tasks found)
                      </span>
                      {bulkTasks.some(t => !t.isValid) && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 500 }}>
                          Fix errors to import
                        </span>
                      )}
                    </div>
                    
                    <div 
                      style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                            <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', width: '40px' }}>Row</th>
                            <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>Reddit URL</th>
                            <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', width: '60px' }}>Price</th>
                            <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>Status / Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkTasks.map((t, idx) => (
                            <tr 
                              key={idx} 
                              style={{ 
                                borderBottom: idx < bulkTasks.length - 1 ? '1px solid var(--border-color)' : 'none',
                                backgroundColor: t.isValid ? 'transparent' : 'rgba(239, 68, 68, 0.05)'
                              }}
                            >
                              <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{idx + 1}</td>
                              <td 
                                style={{ 
                                  padding: '0.5rem 0.75rem', 
                                  maxWidth: '120px', 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap',
                                  color: t.url ? 'var(--text-primary)' : 'var(--text-secondary)'
                                }}
                                title={t.url}
                              >
                                {t.url || '(empty)'}
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>
                                ${t.price.toFixed(2)}
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem' }}>
                                {t.isValid ? (
                                  <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>✓ Valid</span>
                                ) : (
                                  <span style={{ color: 'var(--color-danger)', fontWeight: 500 }} title={t.error}>
                                    ⚠ {t.error}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkFile(null);
                      setBulkTasks([]);
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    disabled={isLoading || !bulkFile}
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                    disabled={isLoading || bulkTasks.length === 0 || bulkTasks.some(t => !t.isValid)}
                  >
                    {isLoading ? 'Uploading...' : `Upload ${bulkTasks.length} Tasks`}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Tasks List */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Active Tasks ({adminTasks.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
              {adminTasks.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                  No tasks found. Create one to begin!
                </p>
              ) : (() => {
                const totalPages = Math.ceil(adminTasks.length / 5);
                const currentPage = Math.max(1, Math.min(tasksPage, totalPages || 1));
                const displayedTasks = adminTasks.slice((currentPage - 1) * 5, currentPage * 5);
                return (
                  <>
                    {displayedTasks.map((task) => (
                      <div key={task.id} className="glass-card compact-card">
                        <div
                          className="task-card-header"
                          onClick={() => toggleTaskExpanded(task.id)}
                        >
                          <span style={{ fontWeight: 'bold', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            {task.subreddit ? `r/${task.subreddit}` : 'Direct Link'}
                            <span style={{ 
                              fontSize: '0.7rem', 
                              fontWeight: '500', 
                              background: 'rgba(255, 255, 255, 0.05)', 
                              color: 'var(--text-secondary)', 
                              padding: '0.1rem 0.35rem', 
                              borderRadius: '4px', 
                              border: '1px solid var(--border-color)',
                              textTransform: 'uppercase'
                            }}>
                              {task.type_name}
                            </span>
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--color-success)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                              ${parseFloat(task.price).toFixed(2)}
                            </span>
                            <span 
                              title={`Quota: ${task.quota}`}
                              style={{ 
                                fontSize: '0.7rem', 
                                background: 'rgba(99, 102, 241, 0.1)', 
                                color: 'var(--color-primary)', 
                                padding: '0.1rem 0.35rem', 
                                borderRadius: '9999px',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                fontWeight: '600'
                              }}
                            >
                              {task.quota}
                            </span>
                            <svg
                              className={`chevron-icon ${expandedTasks.has(task.id) ? 'rotated' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                              style={{ width: '14px', height: '14px', color: 'var(--text-secondary)' }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <p
                            className="line-clamp-2"
                            title={task.client_request}
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)',
                              margin: 0,
                              flex: 1
                            }}
                          >
                            {task.client_request}
                          </p>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                            alignSelf: 'center'
                          }}>
                            Assigned: <strong style={{ color: task.assigned_to_email ? 'var(--color-primary)' : 'inherit' }}>{task.assigned_to_email || 'None'}</strong>
                          </span>
                        </div>
                        
                        {expandedTasks.has(task.id) && (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '0.5rem',
                              borderTop: '1px solid var(--border-color)',
                              paddingTop: '0.5rem',
                            }}
                          >
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                              <StatusTag status="incomplete">Inc: {task.count_incomplete}</StatusTag>
                              <StatusTag status="pending">Pend: {task.count_pending}</StatusTag>
                              <StatusTag status="success">Succ: {task.count_success}</StatusTag>
                              <StatusTag status="paid">Paid: {task.count_paid}</StatusTag>
                              <StatusTag status="failed">Fail: {task.count_failed}</StatusTag>
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => handleEditClick(task)}
                                className="btn btn-secondary"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px' }}
                                disabled={isLoading}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="btn btn-danger"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px' }}
                                disabled={isLoading}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setTasksPage}
                    />
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── Reviews Tab ────────────────────────────────────────────── */}
      {adminTab === 'reviews' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Pending Task Validations</h2>

          <div className="form-group" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
            <label htmlFor="reviewNote">Review Feedback Note (Optional)</label>
            <input
              id="reviewNote"
              type="text"
              className="form-input"
              placeholder="Feedback message or reason for failure..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
          </div>

          {pendingSubmissions.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
              No pending submissions found. All caught up!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingSubmissions.map((sub) => (
                <div key={sub.booking_id} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '1rem' }}>User: {sub.user_email}</strong>
                      <br />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Reddit profile:{' '}
                        <strong>
                          <a
                            href={`https://reddit.com/u/${sub.user_reddit}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
                          >
                            u/{sub.user_reddit}
                          </a>
                        </strong>
                      </span>
                      <br />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Submitted:{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {new Date(sub.updated_at).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </strong>{' '}
                        <span style={{ color: 'var(--color-warning)', fontWeight: '500' }}>
                          ({getRelativeTimeString(sub.updated_at)})
                        </span>
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                        r/{sub.subreddit}
                      </span>
                      <br />
                      <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>
                        ${parseFloat(sub.price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(0,0,0,0.15)',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      marginBottom: '1rem',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Submitted Link:
                    </span>
                    <br />
                    <a
                      href={sub.reply_url ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: 'var(--color-primary)',
                        wordBreak: 'break-all',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                      }}
                    >
                      {sub.reply_url}
                    </a>
                    {sub.note && (
                      <p
                        style={{
                          marginTop: '0.75rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          borderTop: '1px dashed var(--border-color)',
                          paddingTop: '0.5rem',
                        }}
                      >
                        User note: "{sub.note}"
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleReviewSubmission(sub.booking_id, 'failed')}
                      className="btn btn-danger"
                      disabled={isLoading}
                    >
                      Reject (Fail)
                    </button>
                    <button
                      onClick={() => handleReviewSubmission(sub.booking_id, 'success')}
                      className="btn btn-primary"
                      style={{ background: 'var(--color-success)', color: '#fff' }}
                      disabled={isLoading}
                    >
                      Approve (Success)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Payouts Tab ────────────────────────────────────────────── */}
      {adminTab === 'payouts' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>PayPal Payout Ledger</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Process user payments manually in PayPal, then click <strong>Mark as Paid</strong> to
            clear their balance and move tasks to Paid.
          </p>

          <div className="table-container">
            {adminUsers.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
                No users registered.
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>User Email</th>
                    <th>Reddit User</th>
                    <th>PayPal Account</th>
                    <th>Accumulated Pending Earnings</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.email}</td>
                      <td>
                        <a
                          href={`https://reddit.com/u/${u.reddit}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
                        >
                          u/{u.reddit}
                        </a>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>{u.paypal || 'Not set'}</td>
                      <td
                        style={{
                          color:
                            u.pendingBalance > 0
                              ? 'var(--color-warning)'
                              : 'var(--text-secondary)',
                          fontWeight: 'bold',
                        }}
                      >
                        ${u.pendingBalance.toFixed(2)}
                      </td>
                      <td>
                        <button
                          onClick={() => handleConfirmPayout(u.id)}
                          className="btn btn-primary"
                          style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.75rem',
                            background: 'var(--color-success)',
                          }}
                          disabled={isLoading || u.pendingBalance <= 0}
                        >
                          Mark as Paid
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Users Tab ──────────────────────────────────────────────── */}
      {adminTab === 'users' && (
        <div className="grid-2">
          {/* Register Form */}
          <div className="glass-panel" style={{ padding: '1.75rem', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
              {editingUser ? 'Edit User Profile' : 'Register Basic User'}
            </h2>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label htmlFor="regEmail">Email Address*</label>
                <input
                  id="regEmail"
                  type="email"
                  className="form-input"
                  placeholder="user@redditcrm.com"
                  value={newBasicEmail}
                  onChange={(e) => setNewBasicEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="regPass">
                  {editingUser ? 'Password (Leave blank to keep current)' : 'Initial Password*'}
                </label>
                <input
                  id="regPass"
                  type="password"
                  className="form-input"
                  placeholder={editingUser ? 'Leave blank to keep current password' : 'Initial secure password (min 8 characters)'}
                  value={newBasicPassword}
                  onChange={(e) => setNewBasicPassword(e.target.value)}
                  required={!editingUser}
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label htmlFor="regPaypal">PayPal Email address (Optional)</label>
                <input
                  id="regPaypal"
                  type="email"
                  className="form-input"
                  placeholder="paypal@example.com"
                  value={newBasicPaypal}
                  onChange={(e) => setNewBasicPaypal(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label htmlFor="regReddit">Reddit Username or Profile Link*</label>
                <input
                  id="regReddit"
                  type="text"
                  className="form-input"
                  placeholder="reddit_username or https://reddit.com/u/..."
                  value={newBasicReddit}
                  onChange={(e) => setNewBasicReddit(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={isLoading}
                >
                  {editingUser ? 'Update User' : 'Register User'}
                </button>
                {editingUser && (
                  <button
                    type="button"
                    onClick={handleCancelUserEdit}
                    className="btn"
                    style={{ flex: 1, background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Users List */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>User Profiles ({adminUsers.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
              {adminUsers.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                  No users registered.
                </p>
              ) : (() => {
                const totalPages = Math.ceil(adminUsers.length / 5);
                const currentPage = Math.max(1, Math.min(usersPage, totalPages || 1));
                const displayedUsers = adminUsers.slice((currentPage - 1) * 5, currentPage * 5);
                return (
                  <>
                    {displayedUsers.map((u) => (
                      <div className="expandable-user-card" key={u.id}>
                        <div className="user-card-header" onClick={() => toggleUserExpanded(u.id)}>
                          <span style={{ fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.95rem' }}>
                            <span style={{ color: 'var(--color-primary)' }}>u/</span>
                            {u.reddit}
                          </span>
                          <svg
                            className={`chevron-icon ${expandedUsers.has(u.id) ? 'rotated' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ width: '16px', height: '16px' }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {expandedUsers.has(u.id) && (
                          <div className="user-card-details">
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                              Email: <strong style={{ color: 'var(--text-primary)' }}>{u.email}</strong>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                              Reddit Profile:{' '}
                              <strong>
                                <a
                                  href={`https://reddit.com/u/${u.reddit}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  u/{u.reddit}
                                </a>
                              </strong>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                              PayPal: <strong style={{ color: 'var(--text-primary)' }}>{u.paypal || 'Not set'}</strong>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                              Account Tier: <span className={`badge-role role-${u.tier?.toLowerCase() || 'bronze'}`} style={{ textTransform: 'capitalize', fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'inline-block', fontWeight: 'bold' }}>{u.tier || 'Bronze'}</span>
                              <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem' }}>
                                (Completed: <strong style={{ color: 'var(--text-primary)' }}>{u.completedCount || 0}</strong> tasks)
                              </span>
                            </div>
                            <div
                              style={{
                                borderTop: '1px solid var(--border-color)',
                                marginTop: '0.5rem',
                                paddingTop: '0.5rem',
                                display: 'flex',
                                gap: '1rem',
                                fontSize: '0.75rem',
                              }}
                            >
                              <span style={{ color: 'var(--color-warning)' }}>
                                Pending: <strong>${u.pendingBalance.toFixed(2)}</strong>
                              </span>
                              <span style={{ color: 'var(--color-success)' }}>
                                Total Paid: <strong>${u.paidBalance.toFixed(2)}</strong>
                              </span>
                            </div>
                            <div
                              style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}
                            >
                              UUID: <code>{u.id}</code>
                            </div>
                            <div
                              style={{
                                borderTop: '1px solid var(--border-color)',
                                marginTop: '0.75rem',
                                paddingTop: '0.75rem',
                                display: 'flex',
                                gap: '0.5rem',
                              }}
                            >
                              <button
                                onClick={() => handleEditUserClick(u)}
                                className="btn"
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  fontSize: '0.7rem',
                                  background: 'var(--color-primary)',
                                  color: '#fff',
                                  borderRadius: '4px',
                                }}
                                disabled={isLoading}
                              >
                                Edit Profile
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="btn"
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  fontSize: '0.7rem',
                                  background: 'var(--color-danger)',
                                  color: '#fff',
                                  borderRadius: '4px',
                                }}
                                disabled={isLoading}
                              >
                                Delete User
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setUsersPage}
                    />
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
