import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export async function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalize headers to match expected format
        return header.trim().replace(/\s+/g, '');
      },
      transform: (value, field) => {
        // Transform specific fields
        if (typeof field === 'string' && (field.includes('Slots') || field.includes('Phases'))) {
          try {
            return JSON.parse(value.replace(/'/g, '"'));
          } catch {
            return value
              .split(',')
              .map((v: string) => parseInt(v.trim()))
              .filter((v: number) => !isNaN(v));
          }
        }
        if (typeof field === 'string' && (field.includes('Skills') || field.includes('TaskIDs'))) {
          return value.split(',').map((v: string) => v.trim());
        }
        if (typeof field === 'string' && field.includes('JSON')) {
          try {
            return JSON.parse(value);
          } catch {
            return {};
          }
        }
        return value;
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error('CSV parsing failed'));
        } else {
          resolve(results.data as any[]);
        }
      },
      error: (error) => reject(error)
    });
  });
}

export async function parseXLSX(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: ''
        });

        if (jsonData.length === 0) {
          resolve([]);
          return;
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1);

        const parsedData = rows.map((row) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            const normalizedHeader = header.trim().replace(/\s+/g, '');
            let value = (row as any[])[index] || '';

            // Transform specific fields
            if (normalizedHeader.includes('Slots') || normalizedHeader.includes('Phases')) {
              try {
                value = typeof value === 'string'
                  ? JSON.parse(value.replace(/'/g, '"'))
                  : value
                      .toString()
                      .split(',')
                      .map((v: string) => parseInt(v.trim()))
                      .filter((v: number) => !isNaN(v));
              } catch {
                value = [];
              }
            } else if (normalizedHeader.includes('Skills') || normalizedHeader.includes('TaskIDs')) {
              value = typeof value === 'string'
                ? value.split(',').map((v: string) => v.trim())
                : [value.toString()];
            } else if (normalizedHeader.includes('JSON')) {
              try {
                value = typeof value === 'string' ? JSON.parse(value) : {};
              } catch {
                value = {};
              }
            }

            obj[normalizedHeader] = value;
          });
          return obj;
        });

        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsArrayBuffer(file);
  });
}
