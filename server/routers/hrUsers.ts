import { router, publicProcedure } from '../_core/trpc'
import { getDb, logActivity } from '../db'
import { users, employees, organizationUsers, customRoles, userDeletions, organizations } from '../../drizzle/schema'
import { eq, and, desc, like, sql } from 'drizzle-orm'
import { z } from 'zod'
import { sendSystemEmail } from '../services/systemEmailService'
import { setPasswordResetToken } from '../db'
import { v4 as uuidv4 } from 'uuid'
import { createFeatureRestrictedProcedure } from '../middleware/enhancedRbac'
import * as bcrypt from 'bcryptjs'

const createUserSchema = z.object({
  organizationId: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['user', 'admin', 'staff', 'accountant', 'client', 'super_admin', 'project_manager', 'hr', 'ict_manager', 'procurement_manager', 'sales_manager']).default('staff'),
  customRoleId: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  employeeId: z.string().optional(),
  password: z.string().min(8).optional(),
})

const updateUserSchema = createUserSchema.partial().extend({
  id: z.string(),
})

const resetPasswordSchema = z.object({
  userId: z.string(),
  newPassword: z.string().min(8),
})

const changeUserRoleSchema = z.object({
  userId: z.string(),
  newRole: z.enum(['user', 'admin', 'staff', 'accountant', 'client', 'super_admin', 'project_manager', 'hr', 'ict_manager', 'procurement_manager', 'sales_manager']),
  effectiveDate: z.string().datetime(),
})

async function getOrganizationEmailBrand(database: any, organizationId?: string | null) {
  if (!organizationId) return undefined;
  const [organization] = await database.select({
    name: organizations.name,
    email: organizations.contactEmail,
    address: organizations.address,
    website: organizations.website,
    logo: organizations.logoUrl,
  }).from(organizations).where(eq(organizations.id, organizationId)).limit(1);
  return organization;
}

export const hrUsersRouter = router({
  // Create user
  createUser: createFeatureRestrictedProcedure(['user:manage', 'admin:all', 'hr:manage'])
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      // Check if email already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      })

      if (existingUser) {
        throw new Error('Email already in use')
      }

      const userId = uuidv4()
      const hashedPassword = input.password 
        ? await bcrypt.hash(input.password, 10)
        : await bcrypt.hash(Math.random().toString(36), 10)

      // Create user
      await db.insert(users).values({
        id: userId,
        name: input.name,
        email: input.email,
        passwordHash: hashedPassword,
        role: input.role,
        customRoleId: input.customRoleId,
        organizationId: input.organizationId,
        position: input.position,
        department: input.department,
        phone: input.phone,
        isActive: 1,
        createdAt: new Date().toISOString(),
      })

      // Link to employee if provided
      if (input.employeeId) {
        await db.update(employees)
          .set({ userId })
          .where(eq(employees.id, input.employeeId))
      }

      // Create organization user record
      if (input.organizationId) {
        await db.insert(organizationUsers).values({
          id: userId,
          organizationId: input.organizationId,
          name: input.name,
          email: input.email,
          role: input.role,
          position: input.position,
          department: input.department,
          phone: input.phone,
          isActive: 1,
          createdBy: ctx.user.id,
          createdAt: new Date().toISOString(),
        })
      }

      // Send welcome email
      const resetToken = uuidv4();
      await setPasswordResetToken(userId, resetToken);
      const baseUrl = (process.env.APP_URL || process.env.PUBLIC_APP_URL || 'https://kiini.africa').replace(/\/$/, '');
      const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
      const organization = await getOrganizationEmailBrand(db, input.organizationId);
      await sendSystemEmail('user/staff_invitation', {
        recipientEmail: input.email,
        recipientName: input.name,
        recipient_first_name: input.name.trim().split(/\s+/)[0],
        recipient_email: input.email,
        invited_by_name: ctx.user.name || 'Your administrator',
        company: organization,
        app_name: 'Kiini',
        user_role: input.role,
        department_name: input.department || 'Not specified',
        invitation_url: resetUrl,
        expiry_date: new Date(Date.now() + 60 * 60 * 1000).toLocaleString(),
      }, {
        subject: `Invitation to join ${organization?.name || 'Kiini'}`,
        html: `<p>Hello ${input.name},</p><p>Set your password to join your workspace: <a href="${resetUrl}">Accept invitation</a></p>`,
        text: `Set your password and accept the invitation: ${resetUrl}`,
      });

      return { userId, email: input.email }
    }),

  // Get user
  getUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const user = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
      })

      if (!user) return null

      // Don't return password hash
      const { passwordHash, ...userWithoutPassword } = user
      return userWithoutPassword
    }),

  // List users
  listUsers: publicProcedure
    .input(z.object({
      organizationId: z.string().optional(),
      role: z.string().optional(),
      isActive: z.boolean().optional(),
      search: z.string().optional(),
      limit: z.number().int().default(50),
      offset: z.number().int().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      let query = db.select().from(users)

      if (input.organizationId) {
        query = query.where(eq(users.organizationId, input.organizationId))
      }

      if (input.role) {
        query = query.where(eq(users.role, input.role as any))
      }

      if (input.isActive !== undefined) {
        query = query.where(eq(users.isActive, input.isActive ? 1 : 0))
      }

      if (input.search) {
        query = query.where(
          sql`${users.name} LIKE ${`%${input.search}%`} OR ${users.email} LIKE ${`%${input.search}%`}`
        )
      }

      return query.orderBy(desc(users.createdAt)).limit(input.limit).offset(input.offset)
    }),

  // Update user
  updateUser: createFeatureRestrictedProcedure(['user:manage', 'admin:all', 'hr:manage'])
    .input(updateUserSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const { id, password, ...updateData } = input
      const updatePayload: any = { ...updateData, updatedAt: new Date().toISOString() }

      // If password is provided, hash it
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        updatePayload.passwordHash = hashedPassword
      }

      await db.update(users)
        .set(updatePayload)
        .where(eq(users.id, id))

      return { userId: id }
    }),

  // Reset user password
  resetUserPassword: createFeatureRestrictedProcedure(['user:manage', 'admin:all', 'hr:manage'])
    .input(resetPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const user = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
      })

      if (!user) {
        throw new Error('User not found')
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 10)

      await db.update(users)
        .set({ passwordHash: hashedPassword })
        .where(eq(users.id, input.userId))

      // Send password reset notification
      const organization = await getOrganizationEmailBrand(db, user.organizationId);
      const baseUrl = (process.env.APP_URL || process.env.PUBLIC_APP_URL || 'https://kiini.africa').replace(/\/$/, '');
      await sendSystemEmail('user/password_changed', {
        recipientEmail: user.email,
        recipientName: user.name,
        recipient_first_name: user.name?.trim().split(/\s+/)[0] || user.email,
        recipient_email: user.email,
        company: organization,
        app_name: 'Kiini',
        changed_at: new Date().toLocaleString(),
        reset_link: `${baseUrl}/account?tab=security`,
      }, {
        subject: 'Your Kiini password was changed',
        html: '<p>Your password was changed by an administrator.</p>',
        text: 'Your password was changed by an administrator.',
      });

      return { userId: input.userId }
    }),

  // Toggle user status
  toggleUserStatus: createFeatureRestrictedProcedure(['user:manage', 'admin:all', 'hr:manage'])
    .input(z.object({
      userId: z.string(),
      isActive: z.boolean(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const user = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
      })

      if (!user) {
        throw new Error('User not found')
      }

      await db.update(users)
        .set({ isActive: input.isActive ? 1 : 0 })
        .where(eq(users.id, input.userId))

      const organization = await getOrganizationEmailBrand(db, user.organizationId);
      const baseUrl = (process.env.APP_URL || process.env.PUBLIC_APP_URL || 'https://kiini.africa').replace(/\/$/, '');
      if (input.isActive) {
        await sendSystemEmail('user/account_reactivated', {
          recipientEmail: user.email,
          recipientName: user.name,
          recipient_first_name: user.name?.trim().split(/\s+/)[0] || user.email,
          recipient_email: user.email,
          company: organization,
          app_name: 'Kiini',
          reactivation_date: new Date().toLocaleString(),
          login_url: `${baseUrl}/login`,
        }, {
          subject: 'Your Kiini account is active again',
          html: '<p>Your account has been reactivated.</p>',
          text: 'Your account has been reactivated.',
        });
      } else {
        await sendSystemEmail('user/account_suspended', {
          recipientEmail: user.email,
          recipientName: user.name,
          recipient_first_name: user.name?.trim().split(/\s+/)[0] || user.email,
          recipient_email: user.email,
          company: organization,
          app_name: 'Kiini',
          suspension_date: new Date().toLocaleString(),
          suspension_reason: input.reason || 'Please contact your administrator for details.',
          restoration_steps: 'Contact your organization administrator for assistance restoring access.',
        }, {
          subject: 'Your Kiini account has been suspended',
          html: `<p>Your account has been suspended. ${input.reason || ''}</p>`,
          text: `Your account has been suspended. ${input.reason || ''}`,
        });
      }

      return { userId: input.userId, isActive: input.isActive }
    }),

  // Change user role
  changeUserRole: createFeatureRestrictedProcedure(['user:manage', 'admin:all', 'hr:manage'])
    .input(changeUserRoleSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const user = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
      })

      if (!user) {
        throw new Error('User not found')
      }

      await db.update(users)
        .set({ role: input.newRole })
        .where(eq(users.id, input.userId))

      // Send role change notification
      const organization = await getOrganizationEmailBrand(db, user.organizationId);
      const baseUrl = (process.env.APP_URL || process.env.PUBLIC_APP_URL || 'https://kiini.africa').replace(/\/$/, '');
      await sendSystemEmail('user/account_role_changed', {
        recipientEmail: user.email,
        recipientName: user.name,
        recipient_first_name: user.name?.trim().split(/\s+/)[0] || user.email,
        recipient_email: user.email,
        company: organization,
        app_name: 'Kiini',
        old_role: user.role,
        new_role: input.newRole,
        effective_date: new Date(input.effectiveDate).toLocaleDateString(),
        updated_by_name: ctx.user.name || 'An administrator',
        login_url: `${baseUrl}/login`,
      }, {
        subject: 'Your role on Kiini was updated',
        html: `<p>Your role was changed to ${input.newRole}.</p>`,
        text: `Your role was changed to ${input.newRole}.`,
      });

      return { userId: input.userId, newRole: input.newRole }
    }),

  // Soft delete user
  deleteUser: createFeatureRestrictedProcedure(['user:manage', 'admin:all', 'hr:manage'])
    .input(z.object({
      userId: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const user = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Create deletion record (soft delete)
      await db.insert(userDeletions).values({
        id: uuidv4(),
        userId: input.userId,
        userName: user.name,
        userEmail: user.email,
        deletedReason: input.reason,
        deletedBy: ctx.user.id,
        deletedAt: new Date().toISOString(),
        archived: 1,
        createdAt: new Date().toISOString(),
      })

      // Deactivate user
      await db.update(users)
        .set({ isActive: 0 })
        .where(eq(users.id, input.userId))

      return { userId: input.userId, deleted: true }
    }),

  // Restore deleted user
  restoreUser: createFeatureRestrictedProcedure(['user:manage', 'admin:all', 'hr:manage'])
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      await db.update(users)
        .set({ isActive: 1 })
        .where(eq(users.id, input.userId))

      // Update deletion record
      const deletion = await db.query.userDeletions.findFirst({
        where: eq(userDeletions.userId, input.userId),
      })

      if (deletion) {
        await db.update(userDeletions)
          .set({ restoredAt: new Date().toISOString(), restoredBy: ctx.user.id, archived: 0 })
          .where(eq(userDeletions.id, deletion.id))
      }

      return { userId: input.userId, restored: true }
    }),

  // Get user sessions (active logins)
  getUserSessions: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      // This would query activeSessions table
      // Returns list of active sessions for the user
      return []
    }),

  // Get user activity log
  getUserActivityLog: publicProcedure
    .input(z.object({
      userId: z.string(),
      limit: z.number().int().default(20),
      offset: z.number().int().default(0),
    }))
    .query(async ({ input }) => {
      // This would query activityLog table
      // Returns user's recent activities
      return []
    }),

  // Search users
  searchUsers: publicProcedure
    .input(z.object({
      organizationId: z.string(),
      query: z.string(),
      limit: z.number().int().default(10),
    }))
    .query(async ({ input }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      return db.select()
        .from(users)
        .where(
          and(
            eq(users.organizationId, input.organizationId),
            sql`${users.name} LIKE ${`%${input.query}%`} OR ${users.email} LIKE ${`%${input.query}%`}`
          )
        )
        .limit(input.limit)
    }),

  // Get user permissions
  getUserPermissions: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const user = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
      })

      if (!user) return null

      // Build permissions based on role and custom role
      const basePermissions = getPermissionsByRole(user.role)

      if (user.customRoleId) {
        const customRole = await db.query.customRoles.findFirst({
          where: eq(customRoles.id, user.customRoleId),
        })

        if (customRole?.permissions) {
          const customPerms = JSON.parse(customRole.permissions)
          return [...basePermissions, ...customPerms]
        }
      }

      return basePermissions
    }),

  // Bulk create users (from CSV)
  bulkCreateUsers: createFeatureRestrictedProcedure(['user:manage', 'admin:all', 'hr:manage'])
    .input(z.object({
      organizationId: z.string(),
      users: z.array(createUserSchema),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const results = []

      for (const userData of input.users) {
        try {
          const userId = uuidv4()
          const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10)

          await db.insert(users).values({
            id: userId,
            name: userData.name,
            email: userData.email,
            passwordHash: hashedPassword,
            role: userData.role,
            organizationId: input.organizationId,
            isActive: 1,
            createdAt: new Date().toISOString(),
          })

          results.push({ email: userData.email, status: 'success', userId })
        } catch (error: any) {
          results.push({ email: userData.email, status: 'failed', error: error.message })
        }
      }

      return { results, processed: results.length }
    }),
})

// Helper function to get default permissions by role
function getPermissionsByRole(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    super_admin: ['*'],
    admin: ['user:*', 'org:*', 'billing:*', 'hr:*', 'payroll:*'],
    hr: ['hr:*', 'leave:*', 'attendance:*', 'user:view'],
    accountant: ['payroll:*', 'billing:*', 'finance:*'],
    project_manager: ['project:*', 'task:*'],
    manager: ['hr:view', 'team:manage', 'task:manage'],
    staff: ['task:view', 'leave:request', 'timesheet:submit'],
    user: ['profile:view'],
  }

  return rolePermissions[role] || rolePermissions['user']
}
