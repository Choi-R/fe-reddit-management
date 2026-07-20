import * as XLSX from 'xlsx';

export interface ParsedTaskRow {
  url: string;
  clientRequest: string;
  deadline: string | null;
  price: number;
  isValid: boolean;
  error?: string;
}

export function parseSpreadsheetFile(
  file: File,
  headerOption: boolean,
  onSuccess: (rows: ParsedTaskRow[]) => void,
  onError: (errMsg: string) => void
): void {
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];

      const rawData = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
      let rows = rawData.filter((r) => r && r.length > 0);

      if (headerOption && rows.length > 0) {
        rows = rows.slice(1);
      }

      const parsed: ParsedTaskRow[] = rows.map((row) => {
        const rawUrl = row[0] ? String(row[0]).trim() : '';
        const rawRequest = row[1] ? String(row[1]).trim() : '';
        const rawDeadline = row[2] ? row[2] : null;
        const rawPrice = row[3] !== undefined ? parseFloat(String(row[3])) : NaN;

        let isValid = true;
        let error = '';

        if (!rawUrl) {
          isValid = false;
          error = 'Missing Reddit URL';
        } else {
          try {
            new URL(rawUrl);
          } catch {
            isValid = false;
            error = 'Invalid URL format';
          }
        }

        if (isValid && !rawRequest) {
          isValid = false;
          error = 'Missing Client Request';
        }

        if (isValid && (isNaN(rawPrice) || rawPrice <= 0)) {
          isValid = false;
          error = 'Price must be positive';
        }

        let formattedDeadline: string | null = null;
        if (isValid && rawDeadline) {
          if (rawDeadline instanceof Date) {
            formattedDeadline = rawDeadline.toISOString().split('T')[0];
          } else {
            const dStr = String(rawDeadline).trim();
            const parsedDate = new Date(dStr);
            if (!isNaN(parsedDate.getTime())) {
              formattedDeadline = parsedDate.toISOString().split('T')[0];
            } else {
              isValid = false;
              error = 'Invalid deadline date format';
            }
          }
        }

        return {
          url: rawUrl,
          clientRequest: rawRequest,
          deadline: formattedDeadline,
          price: isNaN(rawPrice) ? 0 : rawPrice,
          isValid,
          error,
        };
      });

      onSuccess(parsed);
    } catch (err: unknown) {
      onError('Failed to parse file. Please ensure it is a valid Excel or CSV spreadsheet.');
    }
  };

  reader.readAsBinaryString(file);
}
