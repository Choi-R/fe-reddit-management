import { useState } from 'react';
import { adminService } from '../services/adminService';
import { parseSpreadsheetFile, type ParsedTaskRow } from '../utils/excelParser';
import BulkImportPreviewTable from './BulkImportPreviewTable';

interface TaskBulkImportFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setErrorMsg: (msg: string | null) => void;
  setSuccessMsg: (msg: string | null) => void;
  onRefreshData: () => void;
}

export default function TaskBulkImportForm({
  isLoading,
  setIsLoading,
  setErrorMsg,
  setSuccessMsg,
  onRefreshData,
}: TaskBulkImportFormProps) {
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [hasHeader, setHasHeader] = useState(true);
  const [bulkTasks, setBulkTasks] = useState<ParsedTaskRow[]>([]);

  const handleProcessFile = (file: File, headerOption: boolean) => {
    parseSpreadsheetFile(
      file,
      headerOption,
      (parsed) => setBulkTasks(parsed),
      (err) => {
        setErrorMsg(err);
        setBulkTasks([]);
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBulkFile(file);
      handleProcessFile(file, hasHeader);
    }
  };

  const handleHeaderToggle = (checked: boolean) => {
    setHasHeader(checked);
    if (bulkFile) {
      handleProcessFile(bulkFile, checked);
    }
  };

  const handleDownloadSample = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      encodeURIComponent(
        'Reddit URL,Client Request,Deadline,Price\n' +
          'https://www.reddit.com/r/pics/comments/example_post,Please upvote this post and write a positive comment,2026-08-01,5.00'
      );
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = 'bulk_tasks_template.csv';
    link.click();
  };

  const handleBulkUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkTasks.length === 0) {
      setErrorMsg('No tasks found in the uploaded file.');
      return;
    }

    const invalidTasks = bulkTasks.filter((t) => !t.isValid);
    if (invalidTasks.length > 0) {
      setErrorMsg(`Cannot upload. There are ${invalidTasks.length} invalid tasks. Please correct errors and re-upload.`);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const tasksData = bulkTasks.map((t) => ({
        url: t.url,
        clientRequest: t.clientRequest,
        price: t.price,
        deadline: t.deadline ? new Date(t.deadline).toISOString() : null,
      }));

      const res = await adminService.bulkCreateTasks(tasksData);
      setSuccessMsg(`Successfully imported ${res.count} tasks from file!`);

      setBulkFile(null);
      setBulkTasks([]);
      onRefreshData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to import bulk tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleBulkUploadSubmit}>
      {/* Formatting Guide Banner */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1rem',
          fontSize: '0.825rem',
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          File Column Formatting Guide
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
          Format your spreadsheet with: <strong>Col A: URL</strong>, <strong>Col B: Client Request</strong>,{' '}
          <strong>Col C: Deadline</strong>, <strong>Col D: Price</strong>.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Check header toggle if row 1 contains labels.
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
            }}
          >
            Download Sample CSV
          </button>
        </div>
      </div>

      {/* File Dropzone */}
      <div
        style={{
          border: '2px dashed var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '1rem',
          backgroundColor: bulkFile ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
          borderColor: bulkFile ? 'var(--color-primary)' : 'var(--border-color)',
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
        <p style={{ fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>
          {bulkFile ? bulkFile.name : 'Click to upload or drag & drop spreadsheet'}
        </p>
      </div>

      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          id="bulkHeaderToggle"
          type="checkbox"
          checked={hasHeader}
          onChange={(e) => handleHeaderToggle(e.target.checked)}
          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
        />
        <label htmlFor="bulkHeaderToggle" style={{ cursor: 'pointer', fontSize: '0.85rem', margin: 0 }}>
          First row contains column headers
        </label>
      </div>

      <BulkImportPreviewTable bulkTasks={bulkTasks} />

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
          disabled={isLoading || bulkTasks.length === 0 || bulkTasks.some((t) => !t.isValid)}
        >
          {isLoading ? 'Uploading...' : `Upload ${bulkTasks.length} Tasks`}
        </button>
      </div>
    </form>
  );
}
