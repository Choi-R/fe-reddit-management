import { useState, useEffect } from 'react';
import type { BasicUserSummary } from '../../types';
import { adminService } from '../../services/adminService';

interface UserFormProps {
  editingUser: BasicUserSummary | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setErrorMsg: (msg: string | null) => void;
  setSuccessMsg: (msg: string | null) => void;
  onCancelEdit: () => void;
  onRefreshData: () => void;
}

export default function UserForm({
  editingUser,
  isLoading,
  setIsLoading,
  setErrorMsg,
  setSuccessMsg,
  onCancelEdit,
  onRefreshData,
}: UserFormProps) {
  const [newEmail, setNewEmail] = useState(editingUser?.email || '');
  const [newPaypal, setNewPaypal] = useState(editingUser?.paypal || '');
  const [newReddit, setNewReddit] = useState(editingUser?.reddit || '');
  const [newNickname, setNewNickname] = useState(editingUser?.nickname || '');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (editingUser) {
      setNewEmail(editingUser.email);
      setNewPaypal(editingUser.paypal || '');
      setNewReddit(editingUser.reddit || '');
      setNewNickname(editingUser.nickname || '');
      setNewPassword('');
    } else {
      setNewEmail('');
      setNewPaypal('');
      setNewReddit('');
      setNewNickname('');
      setNewPassword('');
    }
  }, [editingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newReddit) {
      setErrorMsg('Email and Reddit username are required.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (editingUser) {
        await adminService.updateUser(editingUser.id, {
          email: newEmail,
          paypal: newPaypal || null,
          reddit: newReddit,
          nickname: newNickname || null,
        });

        if (newPassword) {
          if (newPassword.length < 8) {
            setErrorMsg('New password must be at least 8 characters long.');
            setIsLoading(false);
            return;
          }
          await adminService.updateUserPassword(editingUser.id, newPassword);
          setSuccessMsg('User profile & password updated successfully!');
        } else {
          setSuccessMsg('User profile updated successfully!');
        }
        onCancelEdit();
      } else {
        if (!newPassword) {
          setErrorMsg('Password is required for creating a new user.');
          setIsLoading(false);
          return;
        }
        if (newPassword.length < 8) {
          setErrorMsg('Password must be at least 8 characters long.');
          setIsLoading(false);
          return;
        }
        await adminService.createUser({
          email: newEmail,
          password: newPassword,
          paypal: newPaypal || null,
          reddit: newReddit,
          nickname: newNickname || null,
        });
        setSuccessMsg('User created successfully!');
        setNewEmail('');
        setNewPaypal('');
        setNewReddit('');
        setNewNickname('');
        setNewPassword('');
      }
      onRefreshData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save user.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="userEmail">Email Address*</label>
        <input
          id="userEmail"
          type="email"
          className="form-input"
          placeholder="user@example.com"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="userReddit">Reddit Username / Profile Link*</label>
        <input
          id="userReddit"
          type="text"
          className="form-input"
          placeholder="john_doe or u/john_doe or reddit.com/u/john_doe"
          value={newReddit}
          onChange={(e) => setNewReddit(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="userNickname">Nickname (Admin-only, Optional)</label>
        <input
          id="userNickname"
          type="text"
          className="form-input"
          placeholder="e.g. John's Secondary"
          value={newNickname}
          onChange={(e) => setNewNickname(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="userPaypal">PayPal Email (Optional)</label>
        <input
          id="userPaypal"
          type="email"
          className="form-input"
          placeholder="paypal@example.com"
          value={newPaypal}
          onChange={(e) => setNewPaypal(e.target.value)}
        />
      </div>
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="userPassword">
          {editingUser ? 'Reset Password (Leave blank to keep unchanged)' : 'Initial Password*'}
        </label>
        <input
          id="userPassword"
          type="password"
          className="form-input"
          placeholder={editingUser ? '••••••••' : 'At least 8 characters'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required={!editingUser}
        />
      </div>

      {editingUser ? (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="button" onClick={onCancelEdit} className="btn btn-secondary" style={{ flex: 1 }} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoading}>
            Save Changes
          </button>
        </div>
      ) : (
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
          Create User Account
        </button>
      )}
    </form>
  );
}
