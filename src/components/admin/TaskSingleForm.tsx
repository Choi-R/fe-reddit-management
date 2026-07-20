import { useState } from 'react';
import type { Task, BasicUserSummary } from '../../types';
import { adminService } from '../../services/adminService';

interface TaskSingleFormProps {
  editingTask: Task | null;
  users: BasicUserSummary[];
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setErrorMsg: (msg: string | null) => void;
  setSuccessMsg: (msg: string | null) => void;
  onCancelEdit: () => void;
  onRefreshData: () => void;
}

export default function TaskSingleForm({
  editingTask,
  users,
  isLoading,
  setIsLoading,
  setErrorMsg,
  setSuccessMsg,
  onCancelEdit,
  onRefreshData,
}: TaskSingleFormProps) {
  const [newTaskUrl, setNewTaskUrl] = useState(editingTask?.url || '');
  const [newTaskClientRequest, setNewTaskClientRequest] = useState(editingTask?.client_request || '');
  const [newTaskQuota, setNewTaskQuota] = useState(editingTask?.quota || 1);
  const [newTaskPrice, setNewTaskPrice] = useState(editingTask?.price || '');
  const [newTaskTypeId, setNewTaskTypeId] = useState(editingTask?.type_id || 'normal');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState(editingTask?.assigned_to_email || '');
  const [newTaskDeadline, setNewTaskDeadline] = useState(
    editingTask?.deadline ? editingTask.deadline.substring(0, 10) : ''
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskUrl || !newTaskClientRequest || !newTaskPrice || !newTaskTypeId) {
      setErrorMsg('URL, client request, price, and task type are required.');
      return;
    }

    const priceNum = parseFloat(newTaskPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Price must be a positive number.');
      return;
    }

    if (newTaskQuota < 1) {
      setErrorMsg('Quota must be at least 1.');
      return;
    }

    try {
      new URL(newTaskUrl);
    } catch {
      setErrorMsg('Please enter a valid Reddit URL.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (editingTask) {
        await adminService.updateTask(editingTask.id, {
          url: newTaskUrl,
          clientRequest: newTaskClientRequest,
          quota: newTaskQuota,
          price: priceNum,
          typeId: newTaskTypeId,
          assignedTo: newTaskAssignedTo || null,
          deadline: newTaskDeadline ? new Date(newTaskDeadline).toISOString() : null,
        });
        setSuccessMsg('Task updated successfully!');
        onCancelEdit();
      } else {
        await adminService.createTask({
          url: newTaskUrl,
          clientRequest: newTaskClientRequest,
          quota: newTaskQuota,
          price: priceNum,
          typeId: newTaskTypeId,
          assignedTo: newTaskAssignedTo || null,
          deadline: newTaskDeadline ? new Date(newTaskDeadline).toISOString() : null,
        });
        setSuccessMsg('Task created successfully!');
        setNewTaskUrl('');
        setNewTaskClientRequest('');
        setNewTaskQuota(1);
        setNewTaskPrice('');
        setNewTaskAssignedTo('');
        setNewTaskDeadline('');
      }
      onRefreshData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save task.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!newTaskAssignedTo) return true;
    const query = newTaskAssignedTo.toLowerCase();
    return u.email.toLowerCase().includes(query) || u.reddit.toLowerCase().includes(query);
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="taskUrl">Reddit Post/Comment URL*</label>
        <input
          id="taskUrl"
          type="url"
          className="form-input"
          placeholder="https://www.reddit.com/r/..."
          value={newTaskUrl}
          onChange={(e) => setNewTaskUrl(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="clientReq">Client Request Description*</label>
        <textarea
          id="clientReq"
          className="form-input"
          placeholder="Instructions for the user..."
          rows={3}
          value={newTaskClientRequest}
          onChange={(e) => setNewTaskClientRequest(e.target.value)}
          required
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label htmlFor="taskPrice">Price ($ USD)*</label>
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
        <div className="form-group">
          <label htmlFor="taskQuota">Quota (Available slots)*</label>
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
      </div>
      <div className="form-group">
        <label htmlFor="taskType">Task Type*</label>
        <select
          id="taskType"
          className="form-input"
          value={newTaskTypeId}
          onChange={(e) => setNewTaskTypeId(e.target.value)}
        >
          <option value="normal">Normal</option>
          <option value="silver">Silver Only</option>
          <option value="gold">Gold Only</option>
        </select>
      </div>
      <div className="form-group" style={{ position: 'relative' }}>
        <label htmlFor="taskAssignedTo">Assign Explicitly To User (Optional)</label>
        <input
          id="taskAssignedTo"
          type="text"
          className="form-input"
          placeholder="Enter user email or reddit name..."
          value={newTaskAssignedTo}
          onChange={(e) => {
            setNewTaskAssignedTo(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {showSuggestions && newTaskAssignedTo && filteredUsers.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              zIndex: 10,
              maxHeight: '150px',
              overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            }}
          >
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}
                onMouseDown={() => {
                  setNewTaskAssignedTo(u.email);
                  setShowSuggestions(false);
                }}
              >
                <strong>{u.email}</strong> <span style={{ color: 'var(--text-secondary)' }}>(u/{u.reddit})</span>
              </div>
            ))}
          </div>
        )}
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
            onClick={onCancelEdit}
            className="btn btn-secondary"
            style={{ flex: 1 }}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoading}>
            Update Task
          </button>
        </div>
      ) : (
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
          Publish Task
        </button>
      )}
    </form>
  );
}
