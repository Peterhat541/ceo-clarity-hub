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
    <div className="grid grid-cols-4 gap-2">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          className="group flex flex-col items-center gap-1"
        >
          <div
            className={cn(
              "relative flex h-12 w-12 items-center justify-center rounded-full transition-all group-hover:scale-105 group-active:scale-95",
              item.bgClass || "bg-secondary"
            )}
          >
            {item.icon}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
