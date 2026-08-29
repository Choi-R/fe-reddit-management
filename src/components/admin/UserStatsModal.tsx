import { useState } from 'react';
import type { UserDetailStats, UserDetailMetrics, UserTaskDetailItem } from '../../types';
import StatusTag from '../common/StatusTag';

interface UserStatsModalProps {
  isOpen: boolean;
  isLoading: boolean;
  stats: UserDetailStats | null;
  onClose: () => void;
}

function OverviewCards({ metrics }: { metrics: UserDetailMetrics }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '0.85rem', borderLeft: '4px solid var(--color-primary)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Bookings</span>
        <h4 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', margin: '0.25rem 0 0 0' }}>
          {metrics.activeBookingCount}
        </h4>
      </div>
      <div className="glass-card" style={{ padding: '0.85rem', borderLeft: '4px solid var(--color-warning)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Under Review</span>
        <h4 style={{ fontSize: '1.25rem', color: 'var(--color-warning)', margin: '0.25rem 0 0 0' }}>
          {metrics.pendingReviewCount}
        </h4>
      </div>
      <div className="glass-card" style={{ padding: '0.85rem', borderLeft: '4px solid var(--color-success)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Completed Tasks</span>
        <h4 style={{ fontSize: '1.25rem', color: 'var(--color-success)', margin: '0.25rem 0 0 0' }}>
          {metrics.completedCount}
        </h4>
      </div>
      <div className="glass-card" style={{ padding: '0.85rem', borderLeft: '4px solid #8b5cf6' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Balance</span>
        <h4 style={{ fontSize: '1.25rem', color: '#8b5cf6', margin: '0.25rem 0 0 0' }}>
          ${metrics.totalBalance.toFixed(2)}
        </h4>
      </div>
    </div>
  );
}

function BookingsTab({ bookings }: { bookings: UserTaskDetailItem[] }) {
  if (bookings.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
        User currently has no active bookings.
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {bookings.map((item) => (
        <div
          key={item.booking_id}
          className="glass-card"
          style={{ padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
              {item.subreddit ? `r/${item.subreddit}` : 'Direct Task'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.client_request}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Booked at: {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
              ${parseFloat(item.price).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PendingTab({ pendingSubmissions }: { pendingSubmissions: UserTaskDetailItem[] }) {
  if (pendingSubmissions.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
        No pending task submissions under review.
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {pendingSubmissions.map((item) => (
        <div key={item.booking_id} className="glass-card" style={{ padding: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
              {item.subreddit ? `r/${item.subreddit}` : 'Direct Task'}
            </span>
            <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
              ${parseFloat(item.price).toFixed(2)}
            </span>
          </div>
          {item.reply_url && (
            <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              Submitted URL:{' '}
              <a href={item.reply_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>
                {item.reply_url}
              </a>
            </div>
          )}
          {item.note && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Note: "{item.note}"
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ProfileTab({ stats }: { stats: UserDetailStats }) {
  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <h4 style={{ fontSize: '0.95rem', margin: '0 0 1rem 0' }}>Profile & Account Details</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>User ID:</span>
          <br />
          <strong style={{ wordBreak: 'break-all' }}>{stats.user.id}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Email Address:</span>
          <br />
          <strong>{stats.user.email}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Reddit Username:</span>
          <br />
          <strong>
            <a
              href={`https://reddit.com/u/${stats.user.reddit}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
            >
              u/{stats.user.reddit}
            </a>
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Nickname (Admin-only):</span>
          <br />
          <strong style={{ color: 'var(--text-primary)' }}>{stats.user.nickname || 'None'}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>PayPal Email:</span>
          <br />
          <strong style={{ color: 'var(--text-primary)' }}>{stats.user.paypal || 'Not configured'}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Payment Methods:</span>
          <br />
          {stats.user.paymentInfo && stats.user.paymentInfo.length > 0 ? (
            <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {stats.user.paymentInfo.map((p, i) => (
                <div key={i} style={{ fontSize: '0.85rem' }}>
                  <strong style={{ textTransform: 'capitalize' }}>{p.type}</strong>: {' '}
                  {p.type === 'paypal' ? (
                    p.account_details.username
                  ) : p.type === 'bank' ? (
                    `${p.account_details.account_holder || ''} (${p.account_details.bank_name || ''})`
                  ) : (
                    `${p.account_details.coin || ''} ${p.account_details.wallet || ''}`
                  )}
                </div>
              ))}
            </div>
          ) : (
            <strong style={{ color: 'var(--text-primary)' }}>None configured</strong>
          )}
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Account Rank:</span>
          <br />
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              fontWeight: 'bold',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            {stats.user.rankName || `Rank ${stats.user.rankId}`} ({stats.user.cqmLevel || 'Lowest'})
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Account Created At:</span>
          <br />
          <strong>{new Date(stats.user.createdAt).toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}

export default function UserStatsModal({
  isOpen,
  isLoading,
  stats,
  onClose,
}: UserStatsModalProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'pending' | 'history' | 'profile'>('bookings');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '1.5rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
              {isLoading ? 'Loading User Details...' : stats ? `User Details: ${stats.user.email}${stats.user.nickname ? ` (${stats.user.nickname})` : ''}` : 'User Statistics'}
            </h2>
            {stats && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Reddit:{' '}
                <a
                  href={`https://reddit.com/u/${stats.user.reddit}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 'bold' }}
                >
                  u/{stats.user.reddit}
                </a>{' '}
                | Rank:{' '}
                <strong>{stats.user.rankName || `Rank ${stats.user.rankId}`}</strong>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.25rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading statistics & user detail data...
          </div>
        ) : stats ? (
          <>
            <OverviewCards metrics={stats.metrics} />

            {/* Sub-tabs */}
            <div className="tab-navigation" style={{ marginBottom: '1.25rem' }}>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
              >
                Current Active Bookings ({stats.metrics.activeBookingCount})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
              >
                Under Review ({stats.metrics.pendingReviewCount})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
              >
                Task Log History ({stats.taskHistory.length})
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              >
                Account Profile Info
              </button>
            </div>

            {/* Sub-tab view body */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
              {activeTab === 'bookings' && <BookingsTab bookings={stats.activeBookings} />}

              {activeTab === 'pending' && <PendingTab pendingSubmissions={stats.pendingSubmissions} />}

              {activeTab === 'history' && (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Task / Subreddit</th>
                        <th>Status</th>
                        <th>Price</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.taskHistory.map((item) => (
                        <tr key={item.booking_id}>
                          <td>{item.subreddit ? `r/${item.subreddit}` : 'Direct Task'}</td>
                          <td>
                            <StatusTag status={item.status_id} />
                            {item.admin_note && (
                              <div
                                style={{
                                  fontSize: '0.7rem',
                                  color: item.status_id === 'failed' ? 'var(--color-danger)' : 'var(--text-secondary)',
                                  marginTop: '0.2rem',
                                  maxWidth: '180px',
                                  wordBreak: 'break-word',
                                }}
                              >
                                Note: {item.admin_note}
                              </div>
                            )}
                          </td>
                          <td style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                            ${parseFloat(item.price).toFixed(2)}
                          </td>
                          <td>{new Date(item.updated_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'profile' && <ProfileTab stats={stats} />}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
