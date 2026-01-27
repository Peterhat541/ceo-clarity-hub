import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  iconBgClass?: string;
  title: string;
  subtitle: string;
  badge?: string | number;
  badgeClass?: string;
  onClick?: () => void;
}

export function FeatureCard({
  icon,
  iconBgClass = "bg-primary/10",
  title,
  subtitle,
  badge,
  badgeClass = "bg-primary/10 text-primary",
  onClick,
}: FeatureCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-soft transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
    >
      {/* Icon */}
      <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl", iconBgClass)}>
        {icon}
      </div>
      
      {/* Content */}
      <div className="flex-1 text-left">
        <p className="font-semibold text-card-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      
      {/* Badge or Arrow */}
      {badge !== undefined ? (
        <span className={cn("rounded-full px-3 py-1 text-sm font-medium", badgeClass)}>
          {badge}
        </span>
      ) : (
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  );
}
