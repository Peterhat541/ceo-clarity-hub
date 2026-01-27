import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface QuickAccessItem {
  icon: ReactNode;
  label: string;
  bgClass?: string;
  onClick?: () => void;
  badge?: number;
}

interface QuickAccessGridProps {
  items: QuickAccessItem[];
}

export function QuickAccessGrid({ items }: QuickAccessGridProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          className="group flex flex-col items-center gap-2"
        >
          <div
            className={cn(
              "relative flex h-16 w-16 items-center justify-center rounded-full transition-all group-hover:scale-105 group-active:scale-95",
              item.bgClass || "bg-secondary"
            )}
          >
            {item.icon}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
