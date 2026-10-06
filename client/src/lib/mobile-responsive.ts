/**
 * Mobile Responsiveness Utilities and Breakpoints
 * Tailwind CSS breakpoints and mobile-first responsive utilities
 */

// Tailwind Breakpoints
export const Breakpoints = {
  xs: "0px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// Media Query Helpers
export const MediaQueries = {
  // Mobile first approach
  SM: "(min-width: 640px)",
  MD: "(min-width: 768px)",
  LG: "(min-width: 1024px)",
  XL: "(min-width: 1280px)",
  "2XL": "(min-width: 1536px)",

  // Max width queries
  SM_MAX: "(max-width: 639px)",
  MD_MAX: "(max-width: 767px)",
  LG_MAX: "(max-width: 1023px)",
  XL_MAX: "(max-width: 1279px)",
  "2XL_MAX": "(max-width: 1535px)",

  // Orientation
  LANDSCAPE: "(orientation: landscape)",
  PORTRAIT: "(orientation: portrait)",

  // Touch devices
  TOUCH: "(hover: none) and (pointer: coarse)",
  HOVER: "(hover: hover)",

  // Dark mode
  DARK: "(prefers-color-scheme: dark)",
  LIGHT: "(prefers-color-scheme: light)",

  // Reduced motion
  REDUCED_MOTION: "(prefers-reduced-motion: reduce)",

  // High contrast mode
  HIGH_CONTRAST: "(prefers-contrast: more)",
};

// Mobile-First Grid System
export const GridSystem = {
  // Column definitions
  colFull: "w-full",
  col1of2: "sm:w-1/2",
  col1of3: "md:w-1/3",
  col2of3: "md:w-2/3",
  col1of4: "md:w-1/4",
  col3of4: "md:w-3/4",
  col1of5: "lg:w-1/5",
  col1of6: "lg:w-1/6",

  // Responsive padding
  padSmall: "p-2 sm:p-3 md:p-4 lg:p-6",
  padMedium: "p-4 sm:p-6 md:p-8 lg:p-10",
  padLarge: "p-6 sm:p-8 md:p-12 lg:p-16",

  // Responsive font sizes
  textSmall: "text-xs sm:text-sm md:text-base",
  textBase: "text-base sm:text-lg md:text-xl",
  textLarge: "text-lg sm:text-xl md:text-2xl lg:text-3xl",

  // Responsive layout directions
  stackMobile: "flex flex-col sm:flex-row",
  gridAuto: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

// Mobile Navigation Patterns
export const MobileNav = {
  // Bottom tab navigation (mobile) / Horizontal nav (desktop)
  tabNav: "fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:flex sm:-bottom-auto",

  // Hamburger menu (mobile) / Sidebar (desktop)
  hamburger: `
    md:hidden
    h-10 w-10 flex items-center justify-center
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600
  `,

  // Sidebar toggle
  sidebar: `
    fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out
    md:static md:inset-auto md:transform-none
    -translate-x-full md:translate-x-0
  `,
};

// Mobile Form Patterns
export const MobileForm = {
  // Full-width inputs on mobile
  input: "block w-full px-3 py-2 sm:px-4 sm:py-3",

  // Single column on mobile, multi-column on desktop
  formGrid: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",

  // Full-width buttons on mobile
  button: "w-full sm:w-auto",

  // Keyboard handling for mobile
  keyboardAdjustment: "focus:scroll-mt-16 sm:scroll-mt-0",
};

// Mobile Table Patterns
export const MobileTable = {
  // Stack table columns as rows on mobile
  responsiveTable: `
    block sm:table
    md:block md:border-collapse md:border-spacing-0
  `,

  tableRow: `
    block sm:table-row
    mb-4 sm:mb-0 border-b sm:border-b-0
  `,

  tableCell: `
    block before:content-attr(data-label) before:font-bold before:mr-2 before:inline-block
    sm:table-cell sm:before:content-none
    px-2 py-2 sm:px-4 sm:py-3
  `,
};

// Mobile Modal/Dialog Patterns
export const MobileModal = {
  // Full screen on mobile, centered on desktop
  dialog: `
    fixed inset-0 sm:inset-auto
    z-50
    w-full sm:w-auto sm:max-w-lg
    sm:rounded-lg
  `,

  // Overlay
  overlay: "fixed inset-0 bg-black/50 z-40",
};

// Touch-Friendly UI
export const TouchFriendly = {
  // Minimum touch target size (48x48px recommended by WCAG)
  buttonSize: "h-12 w-12 sm:h-10 sm:w-10",
  linkSize: "p-3 sm:p-2",

  // Spacing for touch targets
  touchSpacing: "space-y-4 sm:space-y-2",

  // Avoid hover states on touch
  hoverStateSkip: "hover:no-underline touch:no-underline",
};

// Viewport Meta Configuration
export const ViewportMeta = {
  // Essential meta tag content
  content: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
};

// Mobile-Optimized Components

/**
 * Get responsive class for grid layout
 */
export function getResponsiveGridClass(
  columns: { mobile: number; tablet: number; desktop: number }
): string {
  const mobileCol =
    columns.mobile === 1 ? "grid-cols-1" : `grid-cols-${columns.mobile}`;
  const tabletCol =
    columns.tablet === 1 ? "sm:grid-cols-1" : `sm:grid-cols-${columns.tablet}`;
  const desktopCol =
    columns.desktop === 1 ? "lg:grid-cols-1" : `lg:grid-cols-${columns.desktop}`;

  return `grid ${mobileCol} ${tabletCol} ${desktopCol}`;
}

/**
 * Get responsive padding class
 */
export function getResponsivePadding(
  mobile: string,
  tablet?: string,
  desktop?: string
): string {
  let classes = `p-${mobile}`;
  if (tablet) classes += ` sm:p-${tablet}`;
  if (desktop) classes += ` lg:p-${desktop}`;
  return classes;
}

/**
 * Get responsive font size class
 */
export function getResponsiveFontSize(
  mobile: string,
  tablet?: string,
  desktop?: string
): string {
  let classes = `text-${mobile}`;
  if (tablet) classes += ` sm:text-${tablet}`;
  if (desktop) classes += ` lg:text-${desktop}`;
  return classes;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  return mediaQuery.matches;
}

/**
 * Get animation class based on motion preference
 */
export function getAnimationClass(
  animationClass: string,
  staticClass?: string
): string {
  if (prefersReducedMotion()) {
    return staticClass || "";
  }
  return animationClass;
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  return (
    window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
    (window.ontouchstart !== undefined && navigator.maxTouchPoints > 0)
  );
}

/**
 * Get optimal viewport settings for PWA
 */
export const PWAViewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // For notch support
};

// Mobile Performance Optimizations
export const MobileOptimizations = {
  // Image optimization
  imageSizes: {
    mobile: "100vw",
    tablet: "50vw",
    desktop: "33vw",
  },

  // Lazy loading attributes
  lazyLoad: {
    loading: "lazy",
    decoding: "async",
  },

  // Critical CSS first
  criticalCss: [
    "Navigation",
    "Hero section",
    "Above-the-fold content",
    "Core styling",
  ],

  deferredCss: ["Animations", "Hover states", "Below-fold styling"],
};

// Responsive Sidebar Component Helpers
export function getSidebarClasses(isOpen: boolean): string {
  return `
    fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
    md:relative md:inset-auto md:w-auto md:shadow-none md:transform-none
    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `;
}

// Responsive Modal Component Helpers
export function getModalClasses(isOpen: boolean): string {
  return `
    fixed inset-0 z-50 flex items-center justify-center
    ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
    transition-all duration-300 ease-in-out
  `;
}

// Mobile Keyboard Handling
export const MobileKeyboard = {
  // Adjust for virtual keyboard
  adjustForKeyboard: "focus:scroll-mt-16",

  // Minimum safe area (for notched devices)
  safeArea: "safe-area-inset-left, safe-area-inset-right, safe-area-inset-top, safe-area-inset-bottom",

  // Virtual keyboard height estimation
  iPhoneKeyboardHeight: 216,
  androidKeyboardHeight: 256,
};

// Responsive Table Component Helpers
export function getResponsiveTableClasses(): {
  table: string;
  thead: string;
  tbody: string;
  tr: string;
  th: string;
  td: string;
} {
  return {
    table: "w-full border-collapse overflow-x-auto block md:table",
    thead: "hidden md:table-header-group bg-gray-50",
    tbody: "block space-y-4 md:space-y-0",
    tr: "block border md:table-row md:border-b",
    th: "block font-bold text-left p-2 md:table-cell md:p-4 bg-gray-50",
    td: "block before:content-attr(data-label) before:font-bold before:mr-2 before:inline-block p-2 md:table-cell md:before:content-none md:p-4",
  };
}

// Export responsive utility preset
export const ResponsiveUtilities = {
  // Common patterns
  patterns: {
    mobileFirst: "Start with mobile, enhance with breakpoints",
    hiddenOnMobile: "hidden sm:block",
    visibleOnMobileOnly: "block sm:hidden",
    fullWidthOnMobile: "w-full sm:w-auto",
    stackOnMobile: "flex flex-col sm:flex-row",
    gridAuto: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  },

  // Common class combinations
  containers: {
    maxWidth: "max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl xl:max-w-4xl",
    padding: "px-4 sm:px-6 md:px-8 lg:px-12",
    margin: "mx-auto my-4 sm:my-6 md:my-8",
  },
};
