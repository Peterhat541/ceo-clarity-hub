import { StatusDot, Status } from "./StatusBadge";
import { Building2, AlertCircle, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ClientCardProps {
  name: string;
  status: Status;
  lastActivity: string;
  issue?: string;
  projectCount?: number;
  onClick?: () => void;
  onAIClick?: () => void;
  highlighted?: boolean;
}

export function ClientCard({
  name,
  status,
  lastActivity,
  issue,
  projectCount = 1,
  onClick,
  onAIClick,
  highlighted = false,
}: ClientCardProps) {
  const handleAIClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAIClick?.();
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer card-shadow",
        status === "red" && "border-status-red/30 bg-status-red/5",
        highlighted && "ring-2 ring-primary ring-offset-2 ring-offset-background border-primary"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0",
          highlighted && "bg-primary/20"
        )}>
          <Building2 className={cn(
            "w-4 h-4 text-muted-foreground",
            highlighted && "text-primary"
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate",
              highlighted && "text-primary"
            )}>
              {name}
            </h3>
            <StatusDot status={status} pulse={status === "red"} />
          </div>
          {issue && (
            <p className="text-xs text-muted-foreground truncate">{issue}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-muted-foreground">{lastActivity}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAIClick}
            className="h-7 px-2 gap-1 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10"
          >
            <Sparkles className="w-3 h-3" />
            IA
          </Button>
        </div>
      </div>
    </div>
  );
}
