import { ReactNode, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CollapsibleSectionProps {
  title: string;
  icon?: ReactNode;
  count?: number;
  children: ReactNode;
  defaultOpen?: boolean;
  variant?: "default" | "warning" | "danger";
}

export function CollapsibleSection({
  title,
  icon,
  count,
  children,
  defaultOpen = false,
  variant = "default",
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const variantStyles = {
    default: "text-foreground",
    warning: "text-status-orange",
    danger: "text-status-red",
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={cn(
          "flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-all cursor-pointer",
          isOpen && "border-primary/30"
        )}>
          <div className="flex items-center gap-3">
            {icon}
            <span className={cn("font-semibold", variantStyles[variant])}>
              {title}
            </span>
            {count !== undefined && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                variant === "danger" && "bg-status-red/20 text-status-red",
                variant === "warning" && "bg-status-orange/20 text-status-orange",
                variant === "default" && "bg-secondary text-secondary-foreground"
              )}>
                {count}
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-3 animate-fade-in">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
