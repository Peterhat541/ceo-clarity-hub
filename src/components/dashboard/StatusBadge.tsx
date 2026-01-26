import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type Status = "green" | "yellow" | "orange" | "red";

interface StatusBadgeProps {
  status: Status;
  label?: string;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

const statusConfig: Record<Status, { bg: string; text: string; label: string }> = {
  green: { bg: "bg-status-green", text: "text-status-green", label: "Todo bien" },
  yellow: { bg: "bg-status-yellow", text: "text-status-yellow", label: "Atención" },
  orange: { bg: "bg-status-orange", text: "text-status-orange", label: "Riesgo" },
  red: { bg: "bg-status-red", text: "text-status-red", label: "Intervención" },
};

export function StatusBadge({ status, label, size = "md", pulse = false }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "rounded-full",
          sizeClasses[size],
          config.bg,
          pulse && "animate-pulse-glow"
        )}
      />
      {label !== undefined && (
        <span className={cn("text-sm font-medium", config.text)}>
          {label || config.label}
        </span>
      )}
    </div>
  );
}

interface StatusDotProps {
  status: Status;
  pulse?: boolean;
}

export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(
  function StatusDot({ status, pulse = false }, ref) {
    const config = statusConfig[status];
    
    return (
      <span
        ref={ref}
        className={cn(
          "w-2.5 h-2.5 rounded-full inline-block",
          config.bg,
          pulse && "animate-pulse-glow"
        )}
      />
    );
  }
);
