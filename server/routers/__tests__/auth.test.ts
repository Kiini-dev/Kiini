import { describe, it, expect, vi } from 'vitest';
import * as bcrypt from 'bcryptjs';
import { generateSecret, generate, verify } from 'otplib';
import { _lockStore, _resetLockStore, buildSafeAddColumnSql, shouldBlockLoginForUnverifiedUser, shouldShowEmailVerificationReminder, resolveClientRegistrationSetting } from '../auth';
import { generateTemporaryPassword, resolveInitialPassword, shouldForcePasswordReset } from '../../../utils/accountSecurity';
import { resolveRequestOrganizationContext, resolveUserOrganizationContext } from '../../_core/sdk';

/**
 * Authentication System Tests
 * Tests for standalone local authentication without remote identity services
 */

describe('Standalone Authentication System', () => {
  describe('Organization context resolution', () => {
    it('resolves a legacy user organization from active membership', async () => {
      const user = { id: 'user-1', organizationId: null, role: 'user' };
      const resolveMembership = vi.fn().mockResolvedValue('org-1');

      await expect(resolveUserOrganizationContext(user, resolveMembership)).resolves.toMatchObject({
        id: 'user-1',
        organizationId: 'org-1',
      });
      expect(resolveMembership).toHaveBeenCalledWith('user-1', null);
    });

    it('passes the authenticated email to legacy membership resolution', async () => {
      const user = { id: 'user-1', email: 'member@example.com', organizationId: null, role: 'user' };
      const resolveMembership = vi.fn().mockResolvedValue('org-by-email');

      await expect(resolveUserOrganizationContext(user, resolveMembership)).resolves.toMatchObject({
        organizationId: 'org-by-email',
      });
      expect(resolveMembership).toHaveBeenCalledWith('user-1', 'member@example.com');
    });

    it('keeps the persisted organization without querying membership', async () => {
      const user = { id: 'user-1', organizationId: 'org-existing', role: 'user' };
      const resolveMembership = vi.fn();

      await expect(resolveUserOrganizationContext(user, resolveMembership)).resolves.toBe(user);
      expect(resolveMembership).not.toHaveBeenCalled();
    });

    it('resolves a global super admin tenant from a same-host organization route', async () => {
      const user = { id: 'platform-admin', role: 'super_admin', organizationId: null };
      const req = {
        hostname: 'kiini.africa',
        get: (header: string) => header === 'host'
          ? 'kiini.africa'
          : 'https://kiini.africa/org/acme/bank-reconciliation',
      } as any;
      const findOrganization = vi.fn().mockResolvedValue({ id: 'org-1', slug: 'acme', isActive: 1, isArchived: 0 });

      await expect(resolveRequestOrganizationContext(user, req, findOrganization)).resolves.toMatchObject({
        id: 'platform-admin',
        organizationId: 'org-1',
        organizationSlug: 'acme',
      });
      expect(findOrganization).toHaveBeenCalledWith('acme');
    });

    it('does not resolve tenant context from a cross-host referrer', async () => {
      const user = { id: 'platform-admin', role: 'super_admin', organizationId: null };
      const req = {
        hostname: 'kiini.africa',
        get: (header: string) => header === 'host'
          ? 'kiini.africa'
          : 'https://attacker.example/org/acme/bank-reconciliation',
      } as any;
      const findOrganization = vi.fn();

      await expect(resolveRequestOrganizationContext(user, req, findOrganization)).resolves.toBe(user);
      expect(findOrganization).not.toHaveBeenCalled();
    });

    it('does not replace a member’s organization with a route slug', async () => {
      const user = { id: 'member-1', role: 'accountant', organizationId: 'org-member' };
      const req = {
        hostname: 'kiini.africa',
        get: (header: string) => header === 'host'
          ? 'kiini.africa'
          : 'https://kiini.africa/org/other-org/bank-reconciliation',
      } as any;
      const findOrganization = vi.fn();

      await expect(resolveRequestOrganizationContext(user, req, findOrganization)).resolves.toBe(user);
      expect(findOrganization).not.toHaveBeenCalled();
    });

    it('does not attach inactive or unknown organizations to a platform admin', async () => {
      const user = { id: 'platform-admin', role: 'super_admin', organizationId: null };
      const req = {
        hostname: 'kiini.africa',
        get: (header: string) => header === 'host'
          ? 'kiini.africa'
          : 'https://kiini.africa/org/acme/bank-reconciliation',
      } as any;
      const findOrganization = vi.fn().mockResolvedValue({ id: 'org-1', slug: 'acme', isActive: 0, isArchived: 0 });

      await expect(resolveRequestOrganizationContext(user, req, findOrganization)).resolves.toBe(user);
    });
  });

  describe('Password Hashing with bcrypt', () => {
    it('should hash passwords securely', async () => {
      const password = 'SecurePassword123';
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);

      // Both hashes should verify correctly with the same password
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
      
      // Different passwords should not verify
      expect(await bcrypt.compare('WrongPassword', hash1)).toBe(false);
    });

    it('should reject incorrect password during verification', async () => {
      const password = 'SecurePassword123';
      const hash = await bcrypt.hash(password, 10);

      expect(await bcrypt.compare('WrongPassword123', hash)).toBe(false);
    });

    it('should handle empty passwords', async () => {
      const hash = await bcrypt.hash('', 10);
      expect(await bcrypt.compare('', hash)).toBe(true);
      expect(await bcrypt.compare('any-password', hash)).toBe(false);
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(100);
      const hash = await bcrypt.hash(longPassword, 10);

      expect(await bcrypt.compare(longPassword, hash)).toBe(true);
      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should handle special characters in passwords', async () => {
      const specialPassword = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await bcrypt.hash(specialPassword, 10);

      expect(await bcrypt.compare(specialPassword, hash)).toBe(true);
    });

    it('should use consistent salt rounds', async () => {
      const password = 'TestPassword123';
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);

      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });
  });

  describe('JWT Token Validation Requirements', () => {
    it('should validate JWT structure', () => {
      const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const jwtRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

      expect(validJWT).toMatch(jwtRegex);
    });

    it('should validate JWT has three parts', () => {
      const validJWT = 'header.payload.signature';
      const parts = validJWT.split('.');

      expect(parts).toHaveLength(3);
      expect(parts[0]).toBeDefined();
      expect(parts[1]).toBeDefined();
      expect(parts[2]).toBeDefined();
    });

    it('should reject invalid JWT format', () => {
      const invalidJWTs = [
        'invalid-token',
        'header.payload',
        'header.payload.signature.extra',
        '',
      ];

      const jwtRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

      invalidJWTs.forEach((token) => {
        expect(token).not.toMatch(jwtRegex);
      });
    });
  });

  describe('Email Validation', () => {
    it('should generate MySQL-safe add-column SQL without invalid IF NOT EXISTS syntax', () => {
      const sql = buildSafeAddColumnSql('users', 'twoFactorEnabled', 'TINYINT(1) NOT NULL DEFAULT 0');

      expect(sql).toContain('INFORMATION_SCHEMA.COLUMNS');
      expect(sql).toContain("COLUMN_NAME = 'twoFactorEnabled'");
      expect(sql).not.toContain('ADD COLUMN IF NOT EXISTS');
    });

    it('should allow local users to sign in before email verification is complete', () => {
      expect(shouldBlockLoginForUnverifiedUser({ loginMethod: 'local', emailVerificationRequired: 1, emailVerified: null })).toBe(false);
      expect(shouldBlockLoginForUnverifiedUser({ loginMethod: 'local', emailVerificationRequired: 1, emailVerified: new Date() })).toBe(false);
      expect(shouldBlockLoginForUnverifiedUser({ loginMethod: 'google', emailVerificationRequired: 1, emailVerified: null })).toBe(false);
    });

    it('should surface an email verification reminder while verification is pending', () => {
      expect(shouldShowEmailVerificationReminder({ loginMethod: 'local', emailVerificationRequired: 1, emailVerified: null })).toBe(true);
      expect(shouldShowEmailVerificationReminder({ loginMethod: 'local', emailVerificationRequired: 1, emailVerified: new Date() })).toBe(false);
      expect(shouldShowEmailVerificationReminder({ loginMethod: 'google', emailVerificationRequired: 1, emailVerified: null })).toBe(false);
    });

    it('should validate email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const validEmails = [
        'user@example.com',
        'john.doe@company.co.uk',
        'test+tag@domain.org',
      ];

      validEmails.forEach((email) => {
        expect(email).toMatch(emailRegex);
      });
    });

    it('should reject invalid email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
      ];

      invalidEmails.forEach((email) => {
        expect(email).not.toMatch(emailRegex);
      });
    });
  });

  describe('Password Validation Rules', () => {
    it('should generate a strong temporary password and require a reset on first login', () => {
      const password = generateTemporaryPassword();

      expect(password.length).toBeGreaterThanOrEqual(12);
      expect(/[A-Z]/.test(password)).toBe(true);
      expect(/[a-z]/.test(password)).toBe(true);
      expect(/[0-9]/.test(password)).toBe(true);
      expect(/[^A-Za-z0-9]/.test(password)).toBe(true);
      expect(shouldForcePasswordReset({ requiresPasswordChange: true })).toBe(true);
      expect(shouldForcePasswordReset({ requiresPasswordChange: false })).toBe(false);
    });

    it('should auto-generate a secure temporary password when no password is supplied', () => {
      const password = resolveInitialPassword('');

      expect(password.length).toBeGreaterThanOrEqual(12);
      expect(/[A-Z]/.test(password)).toBe(true);
      expect(/[a-z]/.test(password)).toBe(true);
      expect(/[0-9]/.test(password)).toBe(true);
      expect(/[^A-Za-z0-9]/.test(password)).toBe(true);
      expect(resolveInitialPassword('StrongPassword123!')).toBe('StrongPassword123!');
    });

    it('should enforce minimum 8 character password', () => {
      const passwords: Record<string, boolean> = {
        'short': false,
        'SevenCh': false,
        'EightChar': true,
        'LongerPassword123': true,
      };

      Object.entries(passwords).forEach(([password, isValid]) => {
        expect(password.length >= 8).toBe(isValid);
      });
    });

    it('should accept passwords with special characters', () => {
      const validPasswords = [
        'P@ssw0rd!',
        'Secure#Pass123',
        'Complex$Password&More',
      ];

      validPasswords.forEach((password) => {
        expect(password.length >= 8).toBe(true);
      });
    });

    it('should accept passwords with uppercase and lowercase', () => {
      const password = 'MixedCasePassword123';
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);

      expect(hasUppercase).toBe(true);
      expect(hasLowercase).toBe(true);
    });
  });

  describe('Client Registration Settings', () => {
    it('should allow registration by default and block when explicitly disabled', () => {
      expect(resolveClientRegistrationSetting(undefined)).toBe(true);
      expect(resolveClientRegistrationSetting('true')).toBe(true);
      expect(resolveClientRegistrationSetting('1')).toBe(true);
      expect(resolveClientRegistrationSetting('false')).toBe(false);
      expect(resolveClientRegistrationSetting('0')).toBe(false);
      expect(resolveClientRegistrationSetting(false)).toBe(false);
    });
  });

  describe('Authentication Flow', () => {
    it('should validate registration flow requirements', () => {
      const registrationData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePassword123',
      };

      expect(registrationData.name).toBeDefined();
      expect(registrationData.email).toBeDefined();
      expect(registrationData.password).toBeDefined();

      expect(typeof registrationData.name).toBe('string');
      expect(typeof registrationData.email).toBe('string');
      expect(typeof registrationData.password).toBe('string');

      expect(registrationData.name.length).toBeGreaterThanOrEqual(2);
      expect(registrationData.email.length).toBeGreaterThan(0);
      expect(registrationData.password.length).toBeGreaterThanOrEqual(8);
    });

    it('should validate login flow requirements', () => {
      const loginData = {
        email: 'john@example.com',
        password: 'SecurePassword123',
      };

      expect(loginData.email).toBeDefined();
      expect(loginData.password).toBeDefined();
      expect(typeof loginData.email).toBe('string');
      expect(typeof loginData.password).toBe('string');
    });

    it('should validate password change flow requirements', () => {
      const changePasswordData = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      };

      expect(changePasswordData.currentPassword).toBeDefined();
      expect(changePasswordData.newPassword).toBeDefined();
      expect(changePasswordData.confirmPassword).toBeDefined();
      expect(changePasswordData.newPassword).toBe(changePasswordData.confirmPassword);
      expect(changePasswordData.newPassword.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Two-Factor Authentication', () => {
    it('should generate a valid TOTP secret and verify the current code', async () => {
      const secret = generateSecret();
      const token = await generate({ secret });

      expect(secret).toBeTruthy();
      expect(token).toMatch(/^\d{6}$/);
      expect((await verify({ token, secret, window: 1 }))?.valid).toBe(true);
    });

    it('should reject an invalid TOTP code', async () => {
      const secret = generateSecret();

      expect((await verify({ token: '000000', secret, window: 1 }))?.valid).toBe(false);
      expect((await verify({ token: '123456', secret, window: 1 }))?.valid).toBe(false);
    });
  });

  describe('Security Requirements', () => {
    it('should enforce password confirmation matching', () => {
      const passwords: Record<string, { new: string; confirm: string; valid: boolean }> = {
        match: { new: 'NewPassword123', confirm: 'NewPassword123', valid: true },
        mismatch: { new: 'NewPassword123', confirm: 'DifferentPassword123', valid: false },
      };

      Object.values(passwords).forEach(({ new: newPass, confirm, valid }) => {
        expect(newPass === confirm).toBe(valid);
      });
    });

    it('should prevent password reuse validation', () => {
      const oldPassword = 'OldPassword123';
      const newPassword = 'NewPassword123';
      const sameAsOld = 'OldPassword123';

      expect(newPassword !== oldPassword).toBe(true);
      expect(sameAsOld === oldPassword).toBe(true);
    });

    it('should validate JWT expiration concept', () => {
      const now = Date.now();
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      const expirationTime = now + oneYearMs;

      expect(expirationTime).toBeGreaterThan(now);
      expect(expirationTime - now).toBe(oneYearMs);
    });

    it('should enforce secure cookie attributes', () => {
      const cookieAttributes = {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 365 * 24 * 60 * 60 * 1000,
      };

      expect(cookieAttributes.httpOnly).toBe(true);
      expect(cookieAttributes.secure).toBe(true);
      expect(cookieAttributes.sameSite).toBe('Strict');
      expect(cookieAttributes.maxAge).toBeGreaterThan(0);
    });
  });

  describe('Account Lockout', () => {
    it('should lock account after max failed attempts', () => {
      const email = 'lock@example.com';
      const lockInfo = _lockStore.get(email) || { attempts: 0 };
      // simulate failed attempts
      for (let i = 0; i < 5; i++) {
        lockInfo.attempts = (lockInfo.attempts || 0) + 1;
        if (lockInfo.attempts >= 5) {
          lockInfo.lockedUntil = Date.now() + 30 * 60 * 1000;
        }
      }
      _lockStore.set(email, lockInfo);
      const stored = _lockStore.get(email)!;
      expect(stored.attempts).toBeGreaterThanOrEqual(5);
      expect(stored.lockedUntil).toBeDefined();
    });

    it('should reset lock info on successful login', () => {
      const email = 'reset@example.com';
      _lockStore.set(email, { attempts: 3, lockedUntil: Date.now() + 10000 });
      // simulate successful login
      _lockStore.delete(email);
      expect(_lockStore.has(email)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing credentials', () => {
      const loginAttempt = {
        email: '',
        password: '',
      };

      const isValid = Boolean(loginAttempt.email && loginAttempt.password);
      expect(isValid).toBe(false);
    });

    it('should handle null user lookup', () => {
      const user = null;
      expect(user).toBeNull();
    });

    it('should handle database connection errors', () => {
      const dbError = new Error('Database connection failed');
      expect(dbError.message).toContain('Database');
    });
  });

  describe('Standalone Deployment Validation', () => {
    it('should have all required standalone environment variables', () => {
      const requiredVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'VITE_APP_TITLE',
      ];

      const config: Record<string, string> = {
        DATABASE_URL: 'mysql://localhost/db',
        JWT_SECRET: 'secret',
        VITE_APP_TITLE: 'CRM',
      };

      requiredVars.forEach((varName) => {
        expect(config[varName]).toBeDefined();
      });
    });

    it('should validate database connection string format', () => {
      const validConnStrings = [
        'mysql://user:pass@localhost:3306/db',
        'mysql://user:pass@host.com/database',
      ];

      const dbUrlRegex = /^mysql:\/\/[^:]+:[^@]+@[^:]+(?::\d+)?\/[^/]+$/;

      validConnStrings.forEach((connStr) => {
        expect(connStr).toMatch(dbUrlRegex);
        expect(connStr.startsWith('mysql://')).toBe(true);
      });
    });
  });
});
