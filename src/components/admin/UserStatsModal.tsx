import { useState } from 'react';
import type { UserDetailStats } from '../../types';
import UserStatsOverviewCards from './UserStatsOverviewCards';
import UserStatsBookingsTab from './UserStatsBookingsTab';
import UserStatsPendingTab from './UserStatsPendingTab';
import UserStatsProfileTab from './UserStatsProfileTab';
import StatusTag from '../common/StatusTag';

interface UserStatsModalProps {
  isOpen: boolean;
  isLoading: boolean;
  stats: UserDetailStats | null;
  onClose: () => void;
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
              {isLoading ? 'Loading User Details...' : stats ? `User Details: ${stats.user.email}` : 'User Statistics'}
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
                | Tier:{' '}
                <strong style={{ textTransform: 'capitalize' }}>{stats.user.tier}</strong>
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
            <UserStatsOverviewCards metrics={stats.metrics} />

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
              {activeTab === 'bookings' && <UserStatsBookingsTab bookings={stats.activeBookings} />}

              {activeTab === 'pending' && <UserStatsPendingTab pendingSubmissions={stats.pendingSubmissions} />}

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

              {activeTab === 'profile' && <UserStatsProfileTab stats={stats} />}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
