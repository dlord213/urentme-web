import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive?: boolean };
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "info";
  subtitle?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, color = "primary", subtitle }: StatsCardProps) {
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
    <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow duration-200">
      <div className="card-body p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-base-content/60 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-base-content mt-1">{value}</p>
            {subtitle && <p className="text-xs text-base-content/50 mt-1">{subtitle}</p>}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend.positive ? "text-success" : "text-error"}`}>
                <span>{trend.positive ? "▲" : "▼"}</span>
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
