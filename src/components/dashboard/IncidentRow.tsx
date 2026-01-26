import { StatusDot, Status } from "./StatusBadge";
import { Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncidentRowProps {
  clientName: string;
  description: string;
  status: Status;
  daysOpen: number;
  onClick?: () => void;
}

export function IncidentRow({
  clientName,
  description,
  status,
  daysOpen,
  onClick,
}: IncidentRowProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer",
        status === "red" && "border-status-red/30"
      )}
    >
      <StatusDot status={status} pulse={status === "red"} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-foreground">{clientName}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {daysOpen} día{daysOpen !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-sm text-secondary-foreground truncate">{description}</p>
      </div>

      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </div>
  );
}
