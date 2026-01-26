import { StatusDot, Status } from "./StatusBadge";
import { Building2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientCardProps {
  name: string;
  status: Status;
  lastActivity: string;
  issue?: string;
  projectCount?: number;
  onClick?: () => void;
  highlighted?: boolean;
}

export function ClientCard({
  name,
  status,
  lastActivity,
  issue,
  projectCount = 1,
  onClick,
  highlighted = false,
}: ClientCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer card-shadow",
        status === "red" && "border-status-red/30 bg-status-red/5",
        highlighted && "ring-2 ring-primary ring-offset-2 ring-offset-background border-primary"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg bg-secondary flex items-center justify-center",
            highlighted && "bg-primary/20"
          )}>
            <Building2 className={cn(
              "w-5 h-5 text-muted-foreground",
              highlighted && "text-primary"
            )} />
          </div>
          <div>
            <h3 className={cn(
              "font-semibold text-foreground group-hover:text-primary transition-colors",
              highlighted && "text-primary"
            )}>
              {name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {projectCount} proyecto{projectCount > 1 ? "s" : ""} activo{projectCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <StatusDot status={status} pulse={status === "red"} />
      </div>

      {issue && (
        <div className="flex items-start gap-2 mb-3 p-2 rounded-lg bg-secondary/50">
          <AlertCircle className="w-4 h-4 text-status-orange mt-0.5 flex-shrink-0" />
          <p className="text-xs text-secondary-foreground leading-relaxed">{issue}</p>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span>{lastActivity}</span>
      </div>
    </div>
  );
}
