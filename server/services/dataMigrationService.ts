import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';
type Database = any;

export interface ImportOptions {
  skipValidation?: boolean;
  skipDuplicates?: boolean;
  updateIfExists?: boolean;
  batchSize?: number;
}

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  includeMetadata?: boolean;
  dateFormat?: string;
}

export interface MigrationResult {
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: Array<{ recordIndex: number; error: string }>;
  warnings: Array<{ recordIndex: number; warning: string }>;
  duration: number; // in milliseconds
}

export interface DataValidationRule {
  field: string;
  type: 'string' | 'number' | 'date' | 'email' | 'phone' | 'enum';
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  enumValues?: string[];
  customValidator?: (value: any) => boolean;
}

/**
 * DataMigrationService - Bulk import/export and data transformation
 * Supports CSV, Excel, and JSON formats with validation and error handling
 */
export class DataMigrationService {
  private db: Database;
  private validationRules: Map<string, DataValidationRule[]> = new Map();

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Register validation rules for an entity type
   */
  registerValidationRules(entityType: string, rules: DataValidationRule[]): void {
    this.validationRules.set(entityType, rules);
  }

  /**
   * Parse CSV file
   */
  async parseCSV(fileContent: string): Promise<any[]> {
    const lines = fileContent.trim().split('\n');
    if (lines.length < 1) return [];

    const headers = lines[0].split(',').map((h) => h.trim());
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const record: any = {};

      headers.forEach((header, index) => {
        record[header] = values[index] || null;
      });

      data.push(record);
    }

    return data;
  }

  /**
   * Parse Excel file
   */
  async parseExcel(fileBuffer: Buffer, sheetName?: string): Promise<any[]> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = sheetName ? workbook.Sheets[sheetName] : workbook.Sheets[workbook.SheetNames[0]];

    if (!sheet) {
      throw new Error('Sheet not found');
    }

    return XLSX.utils.sheet_to_json(sheet);
  }

  /**
   * Parse JSON data
   */
  async parseJSON(jsonContent: string): Promise<any[]> {
    try {
      const data = JSON.parse(jsonContent);
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      throw new Error(`Invalid JSON: ${(error as Error).message}`);
    }
  }

  /**
   * Validate a record against rules
   */
  validateRecord(entityType: string, record: any, recordIndex: number): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const rules = this.validationRules.get(entityType) || [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of rules) {
      const value = record[rule.field];

      // Check required fields
      if (rule.required && (value === null || value === undefined || value === '')) {
        errors.push(`Field '${rule.field}' is required (row ${recordIndex})`);
        continue;
      }

      if (value === null || value === undefined || value === '') {
        continue;
      }

      // Type validation
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`Field '${rule.field}' must be a string (row ${recordIndex})`);
          } else {
            if (rule.minLength && value.length < rule.minLength) {
              errors.push(
                `Field '${rule.field}' must be at least ${rule.minLength} characters (row ${recordIndex})`
              );
            }
            if (rule.maxLength && value.length > rule.maxLength) {
              errors.push(
                `Field '${rule.field}' must be at most ${rule.maxLength} characters (row ${recordIndex})`
              );
            }
          }
          break;

        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`Field '${rule.field}' must be a number (row ${recordIndex})`);
          }
          break;

        case 'date':
          if (isNaN(new Date(value).getTime())) {
            errors.push(`Field '${rule.field}' must be a valid date (row ${recordIndex})`);
          }
          break;

        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(`Field '${rule.field}' must be a valid email (row ${recordIndex})`);
          }
          break;

        case 'phone':
          if (!/^[\d\s\-\+\(\)]+$/.test(value) || value.length < 10) {
            errors.push(`Field '${rule.field}' must be a valid phone number (row ${recordIndex})`);
          }
          break;

        case 'enum':
          if (rule.enumValues && !rule.enumValues.includes(value)) {
            errors.push(
              `Field '${rule.field}' must be one of: ${rule.enumValues.join(', ')} (row ${recordIndex})`
            );
          }
          break;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(String(value))) {
        errors.push(`Field '${rule.field}' format is invalid (row ${recordIndex})`);
      }

      // Custom validation
      if (rule.customValidator && !rule.customValidator(value)) {
        errors.push(`Field '${rule.field}' failed custom validation (row ${recordIndex})`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Import data with validation
   */
  async importData(
    entityType: string,
    data: any[],
    processor: (record: any) => Promise<any>,
    options: ImportOptions = {}
  ): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      totalRecords: data.length,
      successfulRecords: 0,
      failedRecords: 0,
      errors: [],
      warnings: [],
      duration: 0,
    };

    const batchSize = options.batchSize || 100;

    for (let i = 0; i < data.length; i++) {
      const record = data[i];

      // Validate record
      if (!options.skipValidation) {
        const validation = this.validateRecord(entityType, record, i + 1);
        if (!validation.isValid) {
          result.failedRecords++;
          validation.errors.forEach((error) => {
            result.errors.push({ recordIndex: i + 1, error });
          });
          continue;
        }
        validation.warnings.forEach((warning) => {
          result.warnings.push({ recordIndex: i + 1, warning });
        });
      }

      try {
        // Process record
        await processor(record);
        result.successfulRecords++;
      } catch (error) {
        result.failedRecords++;
        result.errors.push({
          recordIndex: i + 1,
          error: (error as Error).message,
        });
      }

      // Batch processing
      if ((i + 1) % batchSize === 0) {
        console.log(`Processed ${i + 1}/${data.length} records...`);
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Export data to format
   */
  async exportData(
    data: any[],
    options: ExportOptions = { format: 'csv' }
  ): Promise<string | Buffer> {
    if (data.length === 0) {
      return options.format === 'json' ? '[]' : '';
    }

    switch (options.format) {
      case 'csv': {
        try {
          const parser = new Parser();
          return parser.parse(data);
        } catch (error) {
          throw new Error(`CSV export failed: ${(error as Error).message}`);
        }
      }

      case 'xlsx': {
        try {
          const worksheet = XLSX.utils.json_to_sheet(data);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
          const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
          return buffer;
        } catch (error) {
          throw new Error(`Excel export failed: ${(error as Error).message}`);
        }
      }

      case 'json': {
        return JSON.stringify(data, null, 2);
      }

      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Generate migration report
   */
  generateMigrationReport(result: MigrationResult): string {
    const report = `
=== DATA MIGRATION REPORT ===
Total Records: ${result.totalRecords}
Successful: ${result.successfulRecords}
Failed: ${result.failedRecords}
Success Rate: ${((result.successfulRecords / result.totalRecords) * 100).toFixed(2)}%
Duration: ${(result.duration / 1000).toFixed(2)}s

ERRORS (${result.errors.length}):
${result.errors.map((e) => `  Row ${e.recordIndex}: ${e.error}`).join('\n')}

WARNINGS (${result.warnings.length}):
${result.warnings.map((w) => `  Row ${w.recordIndex}: ${w.warning}`).join('\n')}
    `.trim();

    return report;
  }
}

export const createDataMigrationService = (db: Database) => new DataMigrationService(db);