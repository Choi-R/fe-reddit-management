import type { ParsedTaskRow } from '../utils/excelParser';

interface BulkImportPreviewTableProps {
  bulkTasks: ParsedTaskRow[];
}

export default function BulkImportPreviewTable({ bulkTasks }: BulkImportPreviewTableProps) {
  if (bulkTasks.length === 0) return null;

  const hasErrors = bulkTasks.some((t) => !t.isValid);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Preview ({bulkTasks.length} tasks found)</span>
        {hasErrors && (
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
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
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
                  backgroundColor: t.isValid ? 'transparent' : 'rgba(239, 68, 68, 0.05)',
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
                    color: t.url ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                  title={t.url}
                >
                  {t.url || '(empty)'}
                </td>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>${t.price.toFixed(2)}</td>
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
  );
}
