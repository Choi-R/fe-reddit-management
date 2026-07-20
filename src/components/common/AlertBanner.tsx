interface AlertBannerProps {
  type: 'error' | 'success' | 'warning';
  message: string | null;
  onClose?: () => void;
}

const STYLES: Record<AlertBannerProps['type'], React.CSSProperties> = {
  error: {
    backgroundColor: 'var(--color-danger-bg)',
    color: 'var(--color-danger)',
    border: '1px solid rgba(239,68,68,0.2)',
  },
  success: {
    backgroundColor: 'var(--color-success-bg)',
    color: 'var(--color-success)',
    border: '1px solid rgba(16,185,129,0.2)',
  },
  warning: {
    backgroundColor: 'var(--color-warning-bg)',
    color: 'var(--color-warning)',
    border: '1px solid rgba(245,158,11,0.2)',
  },
};

const ICONS: Record<AlertBannerProps['type'], string> = {
  error: '⚠️',
  success: '✅',
  warning: '⚠️',
};

export default function AlertBanner({ type, message, onClose }: AlertBannerProps) {
  if (!message) return null;

  return (
    <div
      className="alert"
      style={{
        ...STYLES[type],
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}
    >
      <span>
        {ICONS[type]} {message}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '0 0.25rem',
            marginLeft: '0.5rem',
          }}
          aria-label="Dismiss message"
        >
          ✕
        </button>
      )}
    </div>
  );
}
