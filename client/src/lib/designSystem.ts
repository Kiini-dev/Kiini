/**
 * Unified Design System
 * Ensures consistent styling across the entire application
 * Based on /crm dashboard design patterns
 */

// Card Styles with gradient backgrounds and animations
export const cardStyles = {
  base: 'rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md',
  gradient: {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800',
    emerald: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800',
    pink: 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border-pink-200 dark:border-pink-800',
    slate: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-slate-200 dark:border-slate-800',
  },
  hover: 'hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300',
  interactive: 'cursor-pointer active:scale-95 transition-transform duration-150',
};

// Dark Mode Colors - Unified with /crm dashboard
export const darkModeColors = {
  background: 'hsl(0 0% 3.6%)',
  foreground: 'hsl(0 0% 98%)',
  card: 'hsl(0 0% 8.6%)',
  cardfore: 'hsl(0 0% 98%)',
  popover: 'hsl(0 0% 8.6%)',
  popoverfore: 'hsl(0 0% 98%)',
  muted: 'hsl(0 0% 46.1%)',
  mutedfore: 'hsl(0 0% 8.6%)',
  accent: 'hsl(212 97% 39%)', // Blue
  accentfore: 'hsl(0 0% 98%)',
  destructive: 'hsl(0 84% 60%)',
  destructivefore: 'hsl(0 0% 98%)',
  border: 'hsl(0 0% 14.9%)',
  input: 'hsl(0 0% 14.9%)',
  ring: 'hsl(212 97% 39%)',
  primary: 'hsl(212 97% 39%)',
  secondary: 'hsl(217 33% 17%)',
};

// Light Mode Colors
export const lightModeColors = {
  background: 'hsl(0 0% 100%)',
  foreground: 'hsl(0 0% 3.6%)',
  card: 'hsl(0 0% 100%)',
  cardfore: 'hsl(0 0% 3.6%)',
  popover: 'hsl(0 0% 100%)',
  popoverfore: 'hsl(0 0% 3.6%)',
  muted: 'hsl(0 0% 88.7%)',
  mutedfore: 'hsl(0 0% 11.3%)',
  accent: 'hsl(212 97% 39%)',
  accentfore: 'hsl(0 0% 100%)',
  destructive: 'hsl(0 84% 60%)',
  destructivefore: 'hsl(0 0% 100%)',
  border: 'hsl(0 0% 91.8%)',
  input: 'hsl(0 0% 91.8%)',
  ring: 'hsl(212 97% 39%)',
  primary: 'hsl(212 97% 39%)',
  secondary: 'hsl(217 33% 17%)',
};

// Icon Color Map for status indicators
export const statusIconColors = {
  success: 'text-emerald-500 dark:text-emerald-400',
  warning: 'text-orange-500 dark:text-orange-400',
  error: 'text-red-500 dark:text-red-400',
  info: 'text-blue-500 dark:text-blue-400',
  neutral: 'text-slate-500 dark:text-slate-400',
};

// Badge Colors
export const badgeColors = {
  default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
  warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
};

// Animation Classes
export const animations = {
  fadeIn: 'animate-in fade-in duration-200',
  slideIn: 'animate-in slide-in-from-bottom-2 duration-300',
  scaleIn: 'animate-in zoom-in duration-200',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
};

// Responsive Typography
export const typography = {
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-bold tracking-tight',
  h3: 'text-2xl font-bold tracking-tight',
  h4: 'text-xl font-bold tracking-tight',
  body: 'text-sm leading-relaxed',
  label: 'text-sm font-medium',
  caption: 'text-xs text-muted-foreground',
};

// Spacing System
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
};

// Layout Patterns
export const layouts = {
  dashboardGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  dashboardGridWide: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6',
  pageContainer: 'space-y-6 max-w-7xl mx-auto',
  cardContainer: 'p-4 sm:p-6',
};

// Shadow Depths
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
};

/**
 * Helper function to apply gradient card styling
 */
export function getGradientCard(colorScheme: keyof typeof cardStyles.gradient) {
  return `${cardStyles.base} ${cardStyles.gradient[colorScheme]} ${cardStyles.hover}`;
}

/**
 * Helper function to get status color
 */
export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'completed':
    case 'approved':
    case 'active':
      return statusIconColors.success;
    case 'pending':
    case 'processing':
      return statusIconColors.warning;
    case 'failed':
    case 'error':
    case 'cancelled':
    case 'rejected':
      return statusIconColors.error;
    case 'draft':
    case 'info':
      return statusIconColors.info;
    default:
      return statusIconColors.neutral;
  }
}

/**
 * Helper function to get badge variant color
 */
export function getBadgeColor(variant: string): string {
  switch (variant?.toLowerCase()) {
    case 'success':
      return badgeColors.success;
    case 'warning':
      return badgeColors.warning;
    case 'danger':
    case 'error':
      return badgeColors.danger;
    case 'info':
      return badgeColors.info;
    default:
      return badgeColors.default;
  }
}
