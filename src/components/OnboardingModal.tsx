import React, { useState } from 'react';
import Guidelines from './Guidelines';

interface OnboardingModalProps {
  isOpen: boolean;
  onAcknowledge: () => void;
}

export default function OnboardingModal({ isOpen, onAcknowledge }: OnboardingModalProps) {
  const [hasScrolledOnboarding, setHasScrolledOnboarding] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 30) {
      setHasScrolledOnboarding(true);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '2rem',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              color: 'var(--color-primary)',
              marginBottom: '1rem',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Onboarding: Read Promotion Guidelines
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Before taking any tasks, please review and accept our posting guidelines below.
          </p>
        </div>

        <div
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '0.5rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '1.5rem',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <Guidelines />
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              cursor: hasScrolledOnboarding ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem',
              color: hasScrolledOnboarding ? 'var(--text-primary)' : 'var(--text-secondary)',
              opacity: hasScrolledOnboarding ? 1 : 0.6,
            }}
          >
            <input
              type="checkbox"
              checked={hasCheckedOnboarding}
              onChange={(e) => hasScrolledOnboarding && setHasCheckedOnboarding(e.target.checked)}
              disabled={!hasScrolledOnboarding}
              style={{ marginTop: '0.2rem', cursor: hasScrolledOnboarding ? 'pointer' : 'not-allowed' }}
            />
            <span>
              {hasScrolledOnboarding
                ? 'I have fully read, understood, and agree to adhere to the Reddit promotion eligibility requirements, payment cycle, and safety rules.'
                : 'Please scroll to the bottom of the guidelines document to enable verification.'}
            </span>
          </label>

          <button
            type="button"
            onClick={onAcknowledge}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
            disabled={!hasScrolledOnboarding || !hasCheckedOnboarding}
          >
            Accept and Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
