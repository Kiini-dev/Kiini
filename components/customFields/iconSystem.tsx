/**
 * Icon System for Custom Fields
 * Provides a consistent icon component with support for lucide-react and fallbacks
 */

import React from 'react';

export type IconName =
  | 'check'
  | 'x'
  | 'edit'
  | 'delete'
  | 'plus'
  | 'search'
  | 'chevron-down'
  | 'chevron-up'
  | 'alert'
  | 'info'
  | 'help'
  | 'loading'
  | 'checkmark'
  | 'close'
  | 'settings'
  | 'copy'
  | 'download'
  | 'upload'
  | 'trash'
  | 'eye'
  | 'eye-off';

export interface IconProps {
  name: IconName;
  size?: number | string;
  color?: string;
  className?: string;
  aria-label?: string;
  role?: string;
}

/**
 * SVG Icon Component - Uses inline SVGs for better performance
 * Can be replaced with lucide-react if needed
 */
const SVGIcon: React.FC<IconProps> = ({ name, size = 20, color = 'currentColor', className, ...rest }) => {
  const sizeStr = typeof size === 'number' ? `${size}px` : size;

  const iconMap: Record<IconName, { svg: React.ReactNode }> = {
    check: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    x: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
    },
    edit: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
    },
    delete: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      ),
    },
    plus: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ),
    },
    search: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      ),
    },
    'chevron-down': {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      ),
    },
    'chevron-up': {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      ),
    },
    alert: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.14h16.94a2 2 0 0 0 1.71-3.14L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    info: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    },
    help: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4m0-4h.01" />
        </svg>
      ),
    },
    loading: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      ),
    },
    checkmark: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    close: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
    },
    settings: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h6m-4.22 4.22l4.24-4.24m2.12-2.12l4.24-4.24" />
        </svg>
      ),
    },
    copy: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
      ),
    },
    download: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
    upload: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
    trash: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      ),
    },
    eye: {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    'eye-off': {
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ),
    },
  };

  const icon = iconMap[name];
  if (!icon) {
    return null;
  }

  return (
    <span
      className={`icon-wrapper ${className || ''}`}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      role={rest.role}
      aria-label={rest['aria-label']}
    >
      <svg
        width={sizeStr}
        height={sizeStr}
        viewBox="0 0 24 24"
        style={{ display: 'block', width: sizeStr, height: sizeStr }}
      >
        {icon.svg}
      </svg>
    </span>
  );
};

/**
 * Icon Button Component
 * Combines icon with button behavior
 */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  iconSize?: number;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  tooltip?: string;
  loading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, iconSize = 20, variant = 'ghost', tooltip, loading, className, ...buttonProps }, ref) => {
    const variantClass = `icon-button-${variant}`;

    return (
      <button
        ref={ref}
        className={`icon-button ${variantClass} ${className || ''}`}
        title={tooltip}
        disabled={loading || buttonProps.disabled}
        {...buttonProps}
      >
        <SVGIcon name={loading ? 'loading' : icon} size={iconSize} />
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default SVGIcon;
