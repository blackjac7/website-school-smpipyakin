import React from "react";

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

/**
 * SkipLink Component
 * Provides keyboard users with a quick way to skip to main content
 * This is an important accessibility feature for screen readers and keyboard navigation
 */
export function SkipLink({ href = "#main-content", children = "Lewati ke konten utama" }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all"
    >
      {children}
    </a>
  );
}

/**
 * VisuallyHidden Component
 * Hides content visually but keeps it accessible to screen readers
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

/**
 * FocusTrap Component
 * Traps focus within a container (useful for modals/dialogs)
 */
interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
}

export function FocusTrap({ children, active = true }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [active]);

  return <div ref={containerRef}>{children}</div>;
}

/**
 * LiveRegion Component
 * Announces dynamic content changes to screen readers
 */
interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: "polite" | "assertive" | "off";
  atomic?: boolean;
  relevant?: "additions" | "removals" | "text" | "all";
}

export function LiveRegion({
  children,
  politeness = "polite",
  atomic = true,
  relevant = "additions",
}: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className="sr-only"
    >
      {children}
    </div>
  );
}

/**
 * AccessibleIcon Component
 * Wraps icons with proper accessibility attributes
 */
interface AccessibleIconProps {
  label: string;
  children: React.ReactNode;
  decorative?: boolean;
}

export function AccessibleIcon({ label, children, decorative = false }: AccessibleIconProps) {
  if (decorative) {
    return (
      <span aria-hidden="true" role="presentation">
        {children}
      </span>
    );
  }

  return (
    <span role="img" aria-label={label}>
      {children}
    </span>
  );
}

/**
 * LoadingSpinner Component
 * Accessible loading indicator
 */
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingSpinner({ size = "md", label = "Memuat..." }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div role="status" aria-label={label}>
      <svg
        className={`animate-spin ${sizeClasses[size]} text-blue-600`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <VisuallyHidden>{label}</VisuallyHidden>
    </div>
  );
}

/**
 * Heading Component
 * Ensures proper heading hierarchy
 */
interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Heading({ level, children, className = "", id }: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag className={className} id={id}>
      {children}
    </Tag>
  );
}

/**
 * useReducedMotion Hook
 * Detects user preference for reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * useFocusReturn Hook
 * Returns focus to the trigger element when a modal/dialog closes
 */
export function useFocusReturn() {
  const triggerRef = React.useRef<HTMLElement | null>(null);

  const saveTrigger = React.useCallback(() => {
    triggerRef.current = document.activeElement as HTMLElement;
  }, []);

  const returnFocus = React.useCallback(() => {
    triggerRef.current?.focus();
  }, []);

  return { saveTrigger, returnFocus };
}

/**
 * Announcer Hook
 * For programmatically announcing messages to screen readers
 */
export function useAnnouncer() {
  const [message, setMessage] = React.useState("");
  const [politeness, setPoliteness] = React.useState<"polite" | "assertive">("polite");

  const announce = React.useCallback(
    (text: string, level: "polite" | "assertive" = "polite") => {
      setPoliteness(level);
      setMessage("");
      // Small delay to ensure the message is announced
      setTimeout(() => setMessage(text), 100);
    },
    []
  );

  const Announcer = React.useCallback(
    () => (
      <LiveRegion politeness={politeness}>
        {message}
      </LiveRegion>
    ),
    [message, politeness]
  );

  return { announce, Announcer };
}
