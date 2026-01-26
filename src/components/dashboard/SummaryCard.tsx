import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: "default" | "warning" | "danger" | "success";
  onClick?: () => void;
  active?: boolean;
}

const variantStyles = {
  default: "bg-card border-border hover:border-primary/30",
  warning: "bg-status-orange/10 border-status-orange/30 hover:border-status-orange/50",
  danger: "bg-status-red/10 border-status-red/30 hover:border-status-red/50",
  success: "bg-status-green/10 border-status-green/30 hover:border-status-green/50",
};

const iconStyles = {
  default: "text-primary",
  warning: "text-status-orange",
  danger: "text-status-red",
  success: "text-status-green",
};

const valueStyles = {
  default: "text-foreground",
  warning: "text-status-orange",
  danger: "text-status-red",
  success: "text-status-green",
};

export function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
  onClick,
  active = false,
}: SummaryCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border transition-all text-left w-full group cursor-pointer",
        variantStyles[variant],
        active && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={cn("transition-transform group-hover:scale-110", iconStyles[variant])}>
          {icon}
        </span>
      </div>
      <p className={cn("text-3xl font-bold mb-1", valueStyles[variant])}>{value}</p>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      )}
    </button>
  );
}
