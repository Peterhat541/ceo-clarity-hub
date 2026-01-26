import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: "default" | "warning" | "danger" | "success";
  onClick?: () => void;
}

const variantStyles = {
  default: "bg-card border-border",
  warning: "bg-status-orange/10 border-status-orange/30",
  danger: "bg-status-red/10 border-status-red/30",
  success: "bg-status-green/10 border-status-green/30",
};

const iconStyles = {
  default: "bg-secondary text-muted-foreground",
  warning: "bg-status-orange/20 text-status-orange",
  danger: "bg-status-red/20 text-status-red",
  success: "bg-status-green/20 text-status-green",
};

export function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
  onClick,
}: SummaryCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-5 rounded-xl border transition-all",
        variantStyles[variant],
        onClick && "cursor-pointer hover:scale-[1.02] hover:shadow-lg"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            iconStyles[variant]
          )}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
