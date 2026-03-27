import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive?: boolean };
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "info";
  subtitle?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function StatsCard({ title, value, icon: Icon, trend, color = "primary", subtitle, className = "", style }: StatsCardProps) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    info: "bg-info/10 text-info",
  };

  return (
    <div 
      className={`card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-all duration-200 ${className}`}
      style={style}
    >
      <div className="card-body p-3 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-sm font-medium text-base-content/60 uppercase tracking-wider">{title}</p>
            <p className="text-lg sm:text-2xl font-bold text-base-content mt-0.5 sm:mt-1 whitespace-nowrap tracking-tight">{value}</p>
            {subtitle && <p className="text-[10px] sm:text-xs text-base-content/50 mt-0.5 sm:mt-1">{subtitle}</p>}
            {trend && (
              <div className={`flex items-center gap-1 mt-1 sm:mt-2 text-[10px] sm:text-xs font-semibold ${trend.positive ? "text-success" : "text-error"}`}>
                <span>{trend.positive ? "▲" : "▼"}</span>
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
            <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
