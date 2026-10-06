import React, { ReactNode, useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Accessibility Utilities Component
 * Provides helpers for WCAG AA compliance
 */

// Focus Management
export function useFocusManagement() {
  const containerRef = useRef<HTMLDivElement>(null);

  const setFocus = (querySelector: string) => {
    const element = containerRef.current?.querySelector(querySelector) as HTMLElement;
    if (element) {
      element.focus();
    }
  };

  return { containerRef, setFocus };
}

// Keyboard Navigation Hook
export function useKeyboardNavigation(
  items: React.RefObject<HTMLElement>[],
  onSelect?: (index: number) => void,
  isOpen?: boolean
) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % items.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case "Enter":
          e.preventDefault();
          onSelect?.(selectedIndex);
          break;
        case "Escape":
          e.preventDefault();
          setSelectedIndex(0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, selectedIndex, isOpen, onSelect]);

  // Focus selected item
  React.useEffect(() => {
    items[selectedIndex]?.current?.focus();
  }, [selectedIndex, items]);

  return { selectedIndex, setSelectedIndex };
}

// Announce to screen readers
export function useAnnouncement() {
  const announcerRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
    if (!announcerRef.current) return;

    const announcer = announcerRef.current;
    announcer.setAttribute("aria-live", priority);
    announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = "";
    }, 1000);
  };

  return { announcerRef, announce };
}

// Skip to main content link
export function SkipToMainLink() {
  return (
    <a
      href="#main-content"
      className="absolute top-0 left-0 -translate-x-full focus:translate-x-0 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded-b text-sm font-medium transition-transform"
    >
      Skip to main content
    </a>
  );
}

// Accessible Form Field
interface AccessibleFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function AccessibleField({
  id,
  label,
  required = false,
  error,
  hint,
  children,
  className,
}: AccessibleFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block font-medium text-gray-700">
        {label}
        {required && <span className="text-red-600 ml-1" aria-label="required">*</span>}
      </label>

      <div>
        {/* Inject aria-describedby to children */}
        {typeof children === "object" && children !== null
          ? setAriaDescribedBy(children as React.ReactElement, errorId, hintId)
          : children}
      </div>

      {hint && (
        <p id={hintId} className="text-xs text-gray-600">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// Helper to set aria-describedby on child element
function setAriaDescribedBy(
  element: React.ReactElement,
  errorId: string,
  hintId: string
): React.ReactElement {
  const describedBy = [errorId, hintId].filter(Boolean).join(" ");
  if (!describedBy) return element;

  return React.cloneElement(element, {
    "aria-describedby": [
      element.props["aria-describedby"],
      describedBy,
    ]
      .filter(Boolean)
      .join(" "),
  });
}

// Accessible Alert
interface AccessibleAlertProps {
  type: "error" | "warning" | "success" | "info";
  title: string;
  message: string;
  onDismiss?: () => void;
  role?: "alert" | "status";
}

export function AccessibleAlert({
  type,
  title,
  message,
  onDismiss,
  role = "alert",
}: AccessibleAlertProps) {
  const bgColors = {
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    success: "bg-green-50 border-green-200",
    info: "bg-blue-50 border-blue-200",
  };

  const textColors = {
    error: "text-red-800",
    warning: "text-yellow-800",
    success: "text-green-800",
    info: "text-blue-800",
  };

  const icons = {
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    success: <AlertCircle className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />,
  };

  return (
    <div
      role={role}
      className={cn("rounded-lg border p-4 flex gap-3", bgColors[type])}
    >
      <div className={cn("flex-shrink-0", textColors[type])}>{icons[type]}</div>
      <div className="flex-1">
        <h3 className={cn("font-semibold text-sm", textColors[type])}>
          {title}
        </h3>
        <p className={cn("text-sm mt-1", textColors[type])}>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn("flex-shrink-0 text-sm font-medium", textColors[type])}
          aria-label={`Dismiss ${type} alert`}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// Accessible Button with Tooltip
interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  tooltip?: string;
  loading?: boolean;
  icon?: ReactNode;
}

export function AccessibleButton({
  children,
  tooltip,
  loading = false,
  icon,
  disabled,
  className,
  ...props
}: AccessibleButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={buttonRef}
      disabled={disabled || loading}
      className={cn(
        "px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      aria-busy={loading}
      aria-label={tooltip || (typeof children === "string" ? children : undefined)}
      aria-disabled={disabled || loading}
      {...props}
    >
      <span className="flex items-center gap-2">
        {loading && <span className="animate-spin">⌛</span>}
        {icon && !loading && icon}
        {children}
      </span>
    </button>
  );
}

// Screen Reader Only Text
interface ScreenReaderOnlyProps {
  children: ReactNode;
}

export function ScreenReaderOnly({ children }: ScreenReaderOnlyProps) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

// Headings with proper hierarchy
interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function AccessibleHeading({
  level,
  children,
  className,
  id,
}: AccessibleHeadingProps) {
  const Heading = `h${level}` as keyof JSX.IntrinsicElements;
  const sizeClasses = {
    1: "text-3xl font-bold",
    2: "text-2xl font-bold",
    3: "text-xl font-semibold",
    4: "text-lg font-semibold",
    5: "text-base font-semibold",
    6: "text-sm font-semibold",
  };

  return (
    <Heading id={id} className={cn(sizeClasses[level], className)}>
      {children}
    </Heading>
  );
}

// Accessible Loading State
interface AccessibleLoadingProps {
  loading: boolean;
  message?: string;
  children: ReactNode;
}

export function AccessibleLoading({
  loading,
  message = "Loading...",
  children,
}: AccessibleLoadingProps) {
  if (!loading) return <>{children}</>;

  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2">
      <span className="animate-spin">⏳</span>
      <span>{message}</span>
    </div>
  );
}

// Accessible Landmark Regions
export function Main({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main id="main-content" className={className}>
      {children}
    </main>
  );
}

export function Sidebar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <aside role="complementary" className={className}>
      {children}
    </aside>
  );
}

export function Navigation({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <nav className={className}>
      {children}
    </nav>
  );
}

export default {
  useFocusManagement,
  useKeyboardNavigation,
  useAnnouncement,
  SkipToMainLink,
  AccessibleField,
  AccessibleAlert,
  AccessibleButton,
  ScreenReaderOnly,
  AccessibleHeading,
  AccessibleLoading,
  Main,
  Sidebar,
  Navigation,
};
