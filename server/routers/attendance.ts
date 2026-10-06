import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { attendance, employees } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const attendanceRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];
        const orgId = ctx.user.organizationId;
        const rows = orgId
          ? await db.select().from(attendance).where(eq(attendance.organizationId, orgId)).limit(input?.limit || 50).offset(input?.offset || 0)
          : await db.select().from(attendance).limit(input?.limit || 50).offset(input?.offset || 0);
        return rows.map((r: any) => ({
          ...r,
          checkIn: (r as any).checkIn || (r as any).checkInTime || null,
          checkOut: (r as any).checkOut || (r as any).checkOutTime || null,
        }));
      } catch (error: any) {
        console.error('Attendance list error:', error?.message || error);
        throw new Error('Failed to retrieve attendance records');
      }
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return null;
        const orgId = ctx.user.organizationId;
        const where = orgId ? and(eq(attendance.id, input), eq(attendance.organizationId, orgId)) : eq(attendance.id, input);
        const result = await db.select().from(attendance).where(where).limit(1);
        const row = result[0] || null;
        if (!row) return null;
        return {
          ...row,
          checkIn: (row as any).checkIn || (row as any).checkInTime || null,
          checkOut: (row as any).checkOut || (row as any).checkOutTime || null,
        };
      } catch (error) {
        console.error('Attendance getById error:', error);
        return null;
      }
    }),

  byEmployee: protectedProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];
        const orgId = ctx.user.organizationId;
        const where = orgId ? and(eq(attendance.employeeId, input.employeeId), eq(attendance.organizationId, orgId)) : eq(attendance.employeeId, input.employeeId);
        const result = await db.select().from(attendance).where(where);
        return result.map((r: any) => ({
          ...r,
          checkIn: (r as any).checkIn || (r as any).checkInTime || null,
          checkOut: (r as any).checkOut || (r as any).checkOutTime || null,
        }));
      } catch (error: any) {
        console.error('Attendance byEmployee error:', error?.message || error);
        throw new Error('Failed to retrieve employee attendance');
      }
    }),

  create: createFeatureRestrictedProcedure("attendance:create")
    .input(z.object({
      employeeId: z.string(),
      date: z.coerce.date(),
      checkInTime: z.coerce.date().optional(),
      checkOutTime: z.coerce.date().optional(),
      status: z.enum(["present", "absent", "late", "leave"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const orgId = ctx.user.organizationId;
      const employeeWhere = orgId
        ? and(eq(employees.id, input.employeeId), eq((employees as any).organizationId, orgId))
        : eq(employees.id, input.employeeId);
      const employee = await db.select({ id: employees.id }).from(employees).where(employeeWhere).limit(1);
      if (!employee.length) throw new Error("Employee not found in your organization");
      if (input.checkInTime && input.checkOutTime && input.checkOutTime < input.checkInTime) {
        throw new Error("Check-out time cannot be before check-in time");
      }
      const existing = await db.select({ id: attendance.id }).from(attendance).where(
        and(eq(attendance.employeeId, input.employeeId), eq(attendance.date, input.date), orgId ? eq(attendance.organizationId, orgId) : undefined as any)
      ).limit(1);
      if (existing.length) throw new Error("Attendance already exists for this employee and date");
      
      const id = uuidv4();
      const insertData: any = {
        ...input,
      };

      await db.insert(attendance).values({
        id,
        ...insertData,
        organizationId: ctx.user.organizationId ?? null,
      });
      return { id };
    }),

  update: createFeatureRestrictedProcedure("attendance:edit")
    .input(z.object({
      id: z.string(),
      employeeId: z.string().optional(),
      date: z.coerce.date().optional(),
      checkInTime: z.coerce.date().optional(),
      checkOutTime: z.coerce.date().optional(),
      status: z.enum(["present", "absent", "late", "leave"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      const orgId = ctx.user.organizationId;
      const updateWhere = orgId ? and(eq(attendance.id, id), eq(attendance.organizationId, orgId)) : eq(attendance.id, id);
      const existing = await db.select().from(attendance).where(updateWhere).limit(1);
      if (!existing.length) throw new Error("Attendance record not found");
      const employeeId = data.employeeId || (existing[0] as any).employeeId;
      const employeeWhere = orgId
        ? and(eq(employees.id, employeeId), eq((employees as any).organizationId, orgId))
        : eq(employees.id, employeeId);
      const employee = await db.select({ id: employees.id }).from(employees).where(employeeWhere).limit(1);
      if (!employee.length) throw new Error("Employee not found in your organization");
      if (data.checkInTime && data.checkOutTime && data.checkOutTime < data.checkInTime) throw new Error("Check-out time cannot be before check-in time");
      const updateData: any = {
        ...data,
      };

      await db.update(attendance).set(updateData as any).where(updateWhere);
      return { success: true };
    }),

  delete: createFeatureRestrictedProcedure("attendance:delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const orgId = ctx.user.organizationId;
      const deleteWhere = orgId ? and(eq(attendance.id, input), eq(attendance.organizationId, orgId)) : eq(attendance.id, input);
      await db.delete(attendance).where(deleteWhere);
      return { success: true };
    }),
});

