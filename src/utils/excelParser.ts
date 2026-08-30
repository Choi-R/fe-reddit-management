export interface ParsedTaskRow {
  url: string;
  clientRequest: string;
  deadline: string | null;
  price: number;
  platform?: 'REDDIT' | 'PRODUCTHUNT';
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
  reader.onload = async (evt) => {
    try {
      const buffer = evt.target?.result as ArrayBuffer;
      const XLSX = await import('xlsx');
      const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];

      const rawData = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
      let rows = rawData.filter((r) => r && r.length > 0);

      if (headerOption && rows.length > 0) {
        rows = rows.slice(1);
      }

      const parsed: ParsedTaskRow[] = rows.map((row) => {
        const rawPlatform = row[0] ? String(row[0]).trim().toUpperCase() : 'REDDIT';
        const validPlatforms = ['REDDIT', 'PRODUCTHUNT'];
        const platform = validPlatforms.includes(rawPlatform) ? rawPlatform as 'REDDIT' | 'PRODUCTHUNT' : 'REDDIT';
        
        const rawUrl = row[1] ? String(row[1]).trim() : '';
        const rawRequest = row[2] ? String(row[2]).trim() : '';
        const rawDeadline = row[3] ? row[3] : null;
        const rawPrice = row[4] !== undefined ? parseFloat(String(row[4])) : NaN;

        let isValid = true;
        let error = '';

        if (!rawUrl) {
          isValid = false;
          error = 'Missing URL';
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
          platform,
          isValid,
          error,
        };
      });

      onSuccess(parsed);
    } catch {
      onError('Failed to parse file. Please ensure it is a valid Excel or CSV spreadsheet.');
    }
  };

  reader.readAsArrayBuffer(file);
}
