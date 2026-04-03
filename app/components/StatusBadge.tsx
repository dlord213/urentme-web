/**
 * Centralized status badge component.
 * Use this everywhere to ensure consistent badge styling across the app.
 */

const STATUS_COLORS: Record<string, string> = {
  // Unit statuses
  occupied: "badge-success",
  vacant: "badge-warning",
  reserved: "badge-info",
  maintenance: "badge-error",

  // Lease statuses
  active: "badge-success",
  draft: "badge-ghost",
  terminated: "badge-error",
  expired: "badge-warning",

  // People statuses
  flagged: "badge-warning",
  inactive: "badge-error",

  // Announcement statuses
  sent: "badge-success",
  published: "badge-success",
  unpublished: "badge-ghost",

  // Property types
  residential: "badge-primary badge-outline",
  commercial: "badge-secondary badge-outline",

  // Payment statuses
  "fully paid": "badge-success",
  partial: "badge-warning",
  unpaid: "badge-error",
  overdue: "badge-error",

  // Flags
  "under repair": "badge-warning badge-outline",
  "under renovation": "badge-info badge-outline",

  // Maintenance request statuses
  open: "badge-warning",
  "in-progress": "badge-info",
  resolved: "badge-success",

  // Generic
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
  info: "badge-info",
};

interface StatusBadgeProps {
  status: string;
  /** Override the display text (defaults to capitalized status) */
  label?: string;
  /** Badge size: "xs", "sm" (default), or "md" */
  size?: "xs" | "sm" | "md";
  /** Add a pulse animation */
  pulse?: boolean;
  /** Additional class names */
  className?: string;
  /** Optional children (e.g. icons) */
  children?: React.ReactNode;
}

export function StatusBadge({
  status,
  label,
  size = "sm",
  pulse = false,
  className = "",
  children,
}: StatusBadgeProps) {
  const key = status.toLowerCase();
  const colorClass = STATUS_COLORS[key] ?? "badge-ghost";
  const sizeClass = size === "xs" ? "badge-xs" : size === "md" ? "badge-md" : "badge-sm";
  const displayText = label ?? status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`badge ${sizeClass} font-semibold capitalize ${colorClass} ${pulse ? "animate-pulse" : ""} ${className}`}
    >
      {children || displayText}
    </span>
  );
}

/**
 * Helper to get the color class for a status (useful when you need it as a string).
 */
export function getStatusColor(status: string): string {
  return STATUS_COLORS[status.toLowerCase()] ?? "badge-ghost";
}
