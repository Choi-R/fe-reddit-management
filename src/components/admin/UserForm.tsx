import { useState, useEffect } from 'react';
import type { BasicUserSummary, ProductHuntAccount } from '../../types';
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
  
  const [newReddit, setNewReddit] = useState(editingUser?.reddit || '');
  const [newNickname, setNewNickname] = useState(editingUser?.nickname || '');
  const [newRankId, setNewRankId] = useState(editingUser?.rankId || 'D');
  const [newPassword, setNewPassword] = useState('');
  const [paymentInfo, setPaymentInfo] = useState<any[]>([]);
  const [newPaymentType, setNewPaymentType] = useState<'paypal' | 'bank' | 'crypto'>('paypal');
  const [newPaymentFields, setNewPaymentFields] = useState<any>({});

  // ProductHunt account state
  const [phAccounts, setPhAccounts] = useState<ProductHuntAccount[]>([]);
  const [newPhUsername, setNewPhUsername] = useState('');
  const [newPhHeadline, setNewPhHeadline] = useState('');
  const [newPhBio, setNewPhBio] = useState('');
  const [editingPhId, setEditingPhId] = useState<string | null>(null);

  useEffect(() => {
    if (editingUser) {
      setNewEmail(editingUser.email);
      // Initialize paymentInfo from editingUser.paymentInfo or legacy paypal
      setPaymentInfo(editingUser.paymentInfo || (editingUser.paypal ? [{ type: 'paypal', account_details: { username: editingUser.paypal } }] : []));
      setNewReddit(editingUser.reddit || '');
      setNewNickname(editingUser.nickname || '');
      setNewRankId(editingUser.rankId || 'D');
      setNewPassword('');
      // Load PH accounts for existing user
      if (editingUser.id) {
        adminService.getProductHuntAccounts(editingUser.id).then((res) => {
          setPhAccounts(res.accounts || []);
        }).catch(() => setPhAccounts([]));
      }
    } else {
      setNewEmail('');
      setPaymentInfo([]);
      setNewReddit('');
      setNewNickname('');
      setNewRankId('D');
      setNewPassword('');
      setPhAccounts([]);
    }
  }, [editingUser]);

  const handleAddPhAccount = async () => {
    if (!newPhUsername.trim() || !editingUser?.id) return;
    setIsLoading(true);
    try {
      const res = await adminService.createProductHuntAccount(editingUser.id, {
        username: newPhUsername.trim(),
        headline: newPhHeadline.trim() || null,
        bio: newPhBio.trim() || null,
      });
      setPhAccounts((prev) => [...prev, res.account]);
      setNewPhUsername('');
      setNewPhHeadline('');
      setNewPhBio('');
      setSuccessMsg('ProductHunt account added!');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add PH account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePhAccount = async (phId: string) => {
    if (!editingUser?.id) return;
    setIsLoading(true);
    try {
      const res = await adminService.updateProductHuntAccount(editingUser.id, phId, {
        username: newPhUsername.trim(),
        headline: newPhHeadline.trim() || null,
        bio: newPhBio.trim() || null,
      });
      setPhAccounts((prev) => prev.map((a) => a.id === phId ? res.account : a));
      setEditingPhId(null);
      setNewPhUsername('');
      setNewPhHeadline('');
      setNewPhBio('');
      setSuccessMsg('ProductHunt account updated!');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update PH account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhAccount = async (phId: string) => {
    if (!editingUser?.id) return;
    try {
      await adminService.deleteProductHuntAccount(editingUser.id, phId);
      setPhAccounts((prev) => prev.filter((a) => a.id !== phId));
      setSuccessMsg('ProductHunt account deleted.');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete PH account.');
    }
  };

  const startEditPh = (account: ProductHuntAccount) => {
    setEditingPhId(account.id);
    setNewPhUsername(account.username);
    setNewPhHeadline(account.headline || '');
    setNewPhBio(account.bio || '');
  };

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
          paymentInfo: paymentInfo,
          reddit: newReddit,
          nickname: newNickname || null,
          rankId: newRankId,
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
          paymentInfo: paymentInfo,
          reddit: newReddit,
          nickname: newNickname || null,
          rankId: newRankId,
        });
        setSuccessMsg('User created successfully!');
        setNewEmail('');
        setNewReddit('');
        setNewNickname('');
        setNewRankId('D');
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
        <label htmlFor="userRank">Account Rank (Reddit CQS)*</label>
        <select
          id="userRank"
          className="form-input"
          value={newRankId}
          onChange={(e) => setNewRankId(e.target.value)}
        >
          <option value="E">Rank E (CQS: Banned)</option>
          <option value="D">Rank D (CQS: Lowest)</option>
          <option value="C">Rank C (CQS: Low)</option>
          <option value="B">Rank B (CQS: Moderate)</option>
          <option value="A">Rank A (CQS: High)</option>
          <option value="S">Rank S (CQS: Highest)</option>
        </select>
      </div>
      <div className="form-group">
        <label>Payment Info (Optional)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <select value={newPaymentType} onChange={(e) => setNewPaymentType(e.target.value as any)} className="form-input" style={{ width: '220px' }}>
            <option value="paypal">PayPal</option>
            <option value="bank">Bank</option>
            <option value="crypto">Crypto</option>
          </select>

          {/* Dynamic fields based on type - stacked vertically for clarity */}
          {newPaymentType === 'paypal' && (
            <input
              type="email"
              placeholder="paypal@example.com"
              className="form-input"
              value={newPaymentFields.username || ''}
              onChange={(e) => setNewPaymentFields({ ...newPaymentFields, username: e.target.value })}
            />
          )}
          {newPaymentType === 'bank' && (
            <>
              <input
                type="text"
                placeholder="Bank Name"
                className="form-input"
                value={newPaymentFields.bank_name || ''}
                onChange={(e) => setNewPaymentFields({ ...newPaymentFields, bank_name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Account Number"
                className="form-input"
                value={newPaymentFields.account_number || ''}
                onChange={(e) => setNewPaymentFields({ ...newPaymentFields, account_number: e.target.value })}
              />
              <input
                type="text"
                placeholder="Account Holder"
                className="form-input"
                value={newPaymentFields.account_holder || ''}
                onChange={(e) => setNewPaymentFields({ ...newPaymentFields, account_holder: e.target.value })}
              />
            </>
          )}
          {newPaymentType === 'crypto' && (
            <>
              <input
                type="text"
                placeholder="Wallet Address"
                className="form-input"
                value={newPaymentFields.wallet || ''}
                onChange={(e) => setNewPaymentFields({ ...newPaymentFields, wallet: e.target.value })}
              />
              <input
                type="text"
                placeholder="Coin (e.g. USDT)"
                className="form-input"
                value={newPaymentFields.coin || ''}
                onChange={(e) => setNewPaymentFields({ ...newPaymentFields, coin: e.target.value })}
                style={{ width: '140px' }}
              />
              <input
                type="text"
                placeholder="Network (e.g. ethereum)"
                className="form-input"
                value={newPaymentFields.network || ''}
                onChange={(e) => setNewPaymentFields({ ...newPaymentFields, network: e.target.value })}
                style={{ width: '180px' }}
              />
            </>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                // validate minimal fields
                if (newPaymentType === 'paypal' && !newPaymentFields.username) return;
                if (newPaymentType === 'bank' && !newPaymentFields.account_number) return;
                if (newPaymentType === 'crypto' && !newPaymentFields.wallet) return;
                setPaymentInfo((prev) => [...prev, { type: newPaymentType, account_details: newPaymentFields }]);
                setNewPaymentFields({});
              }}
            >
              Add
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setNewPaymentFields({})}
              style={{ alignSelf: 'center' }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Existing entries list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {paymentInfo.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No payment methods added.</div>
          ) : (
            paymentInfo.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ flex: 1, fontSize: '0.9rem' }}>
                  <strong style={{ textTransform: 'capitalize' }}>{p.type}</strong>: {p.type === 'paypal' ? p.account_details.username : p.type === 'bank' ? `${p.account_details.account_holder || ''} (${p.account_details.bank_name || ''}) — ${p.account_details.account_number || ''}` : `${p.account_details.coin || ''} ${p.account_details.wallet || ''}`}
                </div>
                <button type="button" className="btn btn-danger" onClick={() => setPaymentInfo(paymentInfo.filter((_, i) => i !== idx))}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
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

      {/* ProductHunt Accounts Section */}
      {editingUser && (
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>ProductHunt Accounts</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {phAccounts.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No ProductHunt accounts added.</div>
            ) : (
              phAccounts.map((ph) => (
                <div key={ph.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, fontSize: '0.9rem' }}>
                    <a
                      href={`https://www.producthunt.com/@${ph.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
                    >
                      @{ph.username}
                    </a>
                    {ph.headline && (
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>— {ph.headline}</span>
                    )}
                  </div>
                  {editingPhId === ph.id ? (
                    <>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Username"
                        value={newPhUsername}
                        onChange={(e) => setNewPhUsername(e.target.value)}
                        style={{ width: '140px' }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Headline"
                        value={newPhHeadline}
                        onChange={(e) => setNewPhHeadline(e.target.value)}
                        style={{ width: '200px' }}
                      />
                      <button type="button" className="btn btn-primary" onClick={() => handleUpdatePhAccount(ph.id)} style={{ padding: '0.35rem 0.75rem' }}>Save</button>
                      <button type="button" className="btn btn-ghost" onClick={() => { setEditingPhId(null); setNewPhUsername(''); setNewPhHeadline(''); setNewPhBio(''); }} style={{ padding: '0.35rem 0.75rem' }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="btn btn-secondary" onClick={() => startEditPh(ph)} style={{ padding: '0.35rem 0.75rem' }}>Edit</button>
                      <button type="button" className="btn btn-danger" onClick={() => handleDeletePhAccount(ph.id)} style={{ padding: '0.35rem 0.75rem' }}>Delete</button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              placeholder="PH Username"
              value={newPhUsername}
              onChange={(e) => setNewPhUsername(e.target.value)}
              style={{ width: '140px' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Headline (optional)"
              value={newPhHeadline}
              onChange={(e) => setNewPhHeadline(e.target.value)}
              style={{ width: '200px' }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddPhAccount}
              disabled={isLoading || !newPhUsername.trim()}
            >
              Add Account
            </button>
          </div>
        </div>
      )}

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
