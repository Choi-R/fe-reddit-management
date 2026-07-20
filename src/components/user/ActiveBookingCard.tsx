import React, { useState, useEffect } from 'react';
import type { ActiveBooking } from '../../types';
import StatusTag from '../common/StatusTag';
import { useCountdown } from '../../hooks/useCountdown';

interface ActiveBookingCardProps {
  booking: ActiveBooking;
  onSubmit: (bookingId: string, replyUrl: string, note?: string) => Promise<void>;
  onCancel: (taskId: string) => Promise<void>;
  isLoading: boolean;
  onExpire: () => void;
}

export default function ActiveBookingCard({
  booking,
  onSubmit,
  onCancel,
  isLoading,
  onExpire,
}: ActiveBookingCardProps) {
  const [replyUrl, setReplyUrl] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const timeRemaining = useCountdown(
    booking.status_id === 'incomplete' && !booking.assigned_to
      ? booking.booked_at
      : null
  );

  useEffect(() => {
    if (timeRemaining === 'Expired') {
      onExpire();
    }
  }, [timeRemaining, onExpire]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyUrl) {
      setFormError('Please enter your Reddit reply URL.');
      return;
    }

    // 1. Client-side URL format validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(replyUrl);
    } catch {
      setFormError('Please enter a valid absolute URL (starting with http:// or https://).');
      return;
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      setFormError('The URL must use http:// or https:// protocol.');
      return;
    }

    const host = parsedUrl.hostname.toLowerCase();
    const isRedditHost = host === 'reddit.com' || host.endsWith('.reddit.com') || host === 'redd.it';
    if (!isRedditHost) {
      setFormError('The URL must be a valid Reddit domain (e.g. reddit.com, old.reddit.com).');
      return;
    }

    // 2. Client-side Subreddit match validation
    if (booking.subreddit) {
      const pathParts = parsedUrl.pathname.split('/');
      const rIdx = pathParts.findIndex((part) => part.toLowerCase() === 'r');
      if (
        rIdx === -1 ||
        !pathParts[rIdx + 1] ||
        pathParts[rIdx + 1].toLowerCase() !== booking.subreddit.toLowerCase()
      ) {
        setFormError(`This task requires a post/comment from the r/${booking.subreddit} subreddit. Please check your link.`);
        return;
      }
    }

    setFormError(null);
    try {
      await onSubmit(booking.id, replyUrl, note || undefined);
      setReplyUrl('');
      setNote('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit task.');
    }
  };

  const handleCancel = async () => {
    if (
      window.confirm(
        'Are you sure you want to cancel this booking? This will return the task to the available list and restore the quota.'
      )
    ) {
      try {
        setFormError(null);
        await onCancel(booking.id);
      } catch (err: any) {
        setFormError(err.message || 'Failed to cancel booking.');
      }
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <StatusTag status={booking.status_id} />
        {booking.status_id === 'incomplete' && !booking.assigned_to && (
          <span style={{ fontSize: '0.9rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>
            Time Left: {timeRemaining}
          </span>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          {booking.subreddit ? `r/${booking.subreddit}` : 'Direct Link'}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {booking.client_request}
        </p>

        {booking.url && (
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reddit URL:</span>
            <br />
            <a
              href={booking.url}
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                wordBreak: 'break-all',
              }}
            >
              {booking.url}
            </a>
          </div>
        )}
      </div>

      {formError && (
        <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          {formError}
        </div>
      )}

      {booking.status_id === 'incomplete' ? (
        <form onSubmit={handleSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div className="form-group">
            <label htmlFor={`replyUrl-${booking.id}`}>Reddit Reply URL</label>
            <input
              id={`replyUrl-${booking.id}`}
              type="url"
              className="form-input"
              placeholder="https://reddit.com/r/subreddit/comments/..."
              value={replyUrl}
              onChange={(e) => setReplyUrl(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor={`submitNote-${booking.id}`}>Note (Optional)</label>
            <textarea
              id={`submitNote-${booking.id}`}
              className="form-input"
              style={{ resize: 'vertical', minHeight: '60px' }}
              placeholder="Add any notes about your post here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
              Submit Completed Task
            </button>
            <button
              type="button"
              className="btn btn-danger"
              style={{ width: '100%' }}
              disabled={isLoading}
              onClick={handleCancel}
            >
              Cancel Booking (Second-Thought)
            </button>
          </div>
        </form>
      ) : (
        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            textAlign: 'center',
          }}
        >
          <p>Awaiting Admin validation. You can book other available tasks.</p>
        </div>
      )}
    </div>
  );
}
