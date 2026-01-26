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
}

export function ClientCard({
  name,
  status,
  lastActivity,
  issue,
  projectCount = 1,
  onClick,
}: ClientCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer card-shadow",
        status === "red" && "border-status-red/30 bg-status-red/5"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
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
