export function generateTemporaryPassword(length = 14): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const required = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  const allChars = uppercase + lowercase + numbers + symbols;
  const randomChars = Array.from({ length: Math.max(0, length - required.length) }, () => allChars[Math.floor(Math.random() * allChars.length)]);

  return [...required, ...randomChars].sort(() => Math.random() - 0.5).join('');
}

export function resolveInitialPassword(inputPassword?: string | null): string {
  if (typeof inputPassword === 'string' && inputPassword.trim().length >= 8) {
    return inputPassword.trim();
  }

  return generateTemporaryPassword(14);
}

export function shouldForcePasswordReset(user: { requiresPasswordChange?: boolean | number | null } | null | undefined): boolean {
  if (!user) return false;
  if (typeof user.requiresPasswordChange === 'boolean') return user.requiresPasswordChange;
  if (typeof user.requiresPasswordChange === 'number') return user.requiresPasswordChange === 1;
  return false;
}
