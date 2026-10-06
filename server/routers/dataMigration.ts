import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createFeatureRestrictedProcedure } from '../_core/trpc';
import { router } from '../_core/trpc';
import { createDataMigrationService, type ImportOptions, type ExportOptions } from '../services/dataMigrationService';
import { getDb } from '../db';

const dataMigrationService = createDataMigrationService(getDb());

// Validation schemas
const ImportSchema = z.object({
  entityType: z.string().min(1, 'Entity type is required'),
  format: z.enum(['csv', 'xlsx', 'json']),
  data: z.string().or(z.instanceof(Buffer)),
  options: z
    .object({
      skipValidation: z.boolean().optional(),
      skipDuplicates: z.boolean().optional(),
      updateIfExists: z.boolean().optional(),
      batchSize: z.number().min(1).max(1000).optional(),
    })
    .optional(),
});

const ExportSchema = z.object({
  entityType: z.string().min(1),
  format: z.enum(['csv', 'xlsx', 'json']),
  filters: z.record(z.string(), z.any()).optional(),
});

const ValidationRuleSchema = z.object({
  field: z.string().min(1),
  type: z.enum(['string', 'number', 'date', 'email', 'phone', 'enum']),
  required: z.boolean().optional(),
  pattern: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  enumValues: z.array(z.string()).optional(),
});

export const dataMigrationRouter = router({
  /**
   * Register validation rules for an entity type
   */
  registerValidationRules: createFeatureRestrictedProcedure('data-migration:write')
    .input(
      z.object({
        entityType: z.string().min(1),
        rules: z.array(ValidationRuleSchema),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        dataMigrationService.registerValidationRules(input.entityType, input.rules as any);

        return {
          success: true,
          message: `Validation rules registered for ${input.entityType}`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to register validation rules: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Import data from file (CSV, Excel, or JSON)
   */
  importData: createFeatureRestrictedProcedure('data-migration:write')
    .input(ImportSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        let parsedData: any[];

        // Parse based on format
        if (input.format === 'csv') {
          const content = typeof input.data === 'string' ? input.data : input.data.toString();
          parsedData = await dataMigrationService.parseCSV(content);
        } else if (input.format === 'xlsx') {
          const buffer = typeof input.data === 'string' ? Buffer.from(input.data) : input.data;
          parsedData = await dataMigrationService.parseExcel(buffer);
        } else {
          const content = typeof input.data === 'string' ? input.data : input.data.toString();
          parsedData = await dataMigrationService.parseJSON(content);
        }

        if (parsedData.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No data found in file',
          });
        }

        // Define processor function based on entity type
        const processor = async (record: any) => {
          // TODO: Implement entity-specific processor
          // For now, just validate the record
          console.log(`Processing ${input.entityType}:`, record);
        };

        // Import data
        const result = await dataMigrationService.importData(
          input.entityType,
          parsedData,
          processor,
          (input.options as ImportOptions) || {}
        );

        return {
          ...result,
          report: dataMigrationService.generateMigrationReport(result),
          success: result.failedRecords === 0,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to import data: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Export data to file (CSV, Excel, or JSON)
   */
  exportData: createFeatureRestrictedProcedure('data-migration:read')
    .input(ExportSchema)
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Query data from database based on entity type and filters
        // const data = await queryDataByEntityType(input.entityType, input.filters);

        const mockData = [
          { id: '1', name: 'Sample 1', value: 100 },
          { id: '2', name: 'Sample 2', value: 200 },
        ];

        const exportOptions: ExportOptions = {
          format: input.format,
          includeMetadata: true,
        };

        const exportedData = await dataMigrationService.exportData(mockData, exportOptions);

        return {
          data: typeof exportedData === 'string' ? exportedData : exportedData.toString('base64'),
          format: input.format,
          recordCount: mockData.length,
          success: true,
          message: `Exported ${mockData.length} records as ${input.format.toUpperCase()}`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to export data: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Preview import data without saving
   */
  previewImport: createFeatureRestrictedProcedure('data-migration:read')
    .input(
      z.object({
        entityType: z.string().min(1),
        format: z.enum(['csv', 'xlsx', 'json']),
        data: z.string(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        let parsedData: any[];

        if (input.format === 'csv') {
          parsedData = await dataMigrationService.parseCSV(input.data);
        } else if (input.format === 'xlsx') {
          parsedData = await dataMigrationService.parseExcel(Buffer.from(input.data));
        } else {
          parsedData = await dataMigrationService.parseJSON(input.data);
        }

        // Validate first few records
        const previewRecords = parsedData.slice(0, input.limit).map((record, index) => {
          const validation = (dataMigrationService as any).validateRecord(input.entityType, record, index + 1);
          return {
            record,
            isValid: validation.isValid,
            errors: validation.errors,
            warnings: validation.warnings,
          };
        });

        const validRecords = previewRecords.filter((p) => p.isValid).length;

        return {
          totalRecords: parsedData.length,
          previewRecords,
          validRecords,
          invalidRecords: previewRecords.length - validRecords,
          estimatedSuccess:
            parsedData.length > 0
              ? Math.round((validRecords / previewRecords.length) * 100)
              : 0,
          success: true,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to preview import: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Get import/export history
   */
  getMigrationHistory: createFeatureRestrictedProcedure('data-migration:read')
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Query migration history from database
        // const history = await db.query.migrationHistory.findMany({
        //   where: eq(migrationHistory.organizationId, ctx.user.organizationId),
        //   orderBy: desc(migrationHistory.createdAt),
        //   limit: input.limit,
        //   offset: input.offset,
        // });

        return {
          history: [],
          total: 0,
          limit: input.limit,
          offset: input.offset,
          success: true,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch migration history: ${(error as Error).message}`,
        });
      }
    }),
});

export type DataMigrationRouter = typeof dataMigrationRouter;