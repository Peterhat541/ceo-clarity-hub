import { useState } from "react";
import { StatusDot, Status } from "./StatusBadge";
import { Building2, Sparkles, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ClientCardProps {
  name: string;
  status: Status;
  lastActivity: string;
  issue?: string;
  projectCount?: number;
  onClick?: () => void;
  onAIClick?: () => void;
  onMarkReviewed?: () => void;
  onStatusChange?: (status: Status) => void;
  highlighted?: boolean;
  variant?: "default" | "compact";
}

const statusOptions: { value: Status; label: string; color: string }[] = [
  { value: "green", label: "Estable", color: "bg-status-green" },
  { value: "yellow", label: "Pendiente", color: "bg-status-yellow" },
  { value: "orange", label: "Atención", color: "bg-status-orange" },
  { value: "red", label: "Crítico", color: "bg-status-red" },
];

export function ClientCard({
  name,
  status,
  lastActivity,
  issue,
  projectCount = 1,
  onClick,
  onAIClick,
  onMarkReviewed,
  onStatusChange,
  highlighted = false,
  variant = "default",
}: ClientCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleAIClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAIClick?.();
  };

  const handleMarkReviewed = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkReviewed?.();
  };

  const handleStatusChange = (newStatus: Status) => {
    onStatusChange?.(newStatus);
    setMenuOpen(false);
  };

  // Compact variant - single line row
  if (variant === "compact") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "client-row cursor-pointer group",
          status === "red" && "bg-status-red/5 border border-status-red/20",
          highlighted && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
      >
        {/* Status Dropdown */}
        {onStatusChange ? (
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                <StatusDot status={status} pulse={status === "red"} />
                <ChevronDown className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40 bg-card border-border z-50">
              {statusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    status === option.value && "bg-secondary"
                  )}
                >
                  <span className={cn("w-2.5 h-2.5 rounded-full", option.color)} />
                  {option.label}
                  {status === option.value && <Check className="w-3 h-3 ml-auto text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <StatusDot status={status} pulse={status === "red"} />
        )}
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate",
            highlighted && "text-primary"
          )}>
            {name}
          </p>
          {issue && (
            <p className="text-xs text-muted-foreground truncate">{issue}</p>
          )}
        </div>
        
        <span className="text-[10px] text-muted-foreground shrink-0">{lastActivity}</span>
        
        {/* Mark as reviewed button */}
        {onMarkReviewed && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleMarkReviewed}
            className="h-8 px-2 gap-1 text-xs font-medium text-green-400 hover:text-green-300 hover:bg-green-500/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Marcar como revisado"
          >
            <Check className="w-3.5 h-3.5" />
          </Button>
        )}
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleAIClick}
          className="h-8 px-3 gap-1.5 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          IA
        </Button>
      </div>
    );
  }

  // Default variant - card style
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
            {onStatusChange ? (
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                    <StatusDot status={status} pulse={status === "red"} />
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40 bg-card border-border z-50">
                  {statusOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        status === option.value && "bg-secondary"
                      )}
                    >
                      <span className={cn("w-2.5 h-2.5 rounded-full", option.color)} />
                      {option.label}
                      {status === option.value && <Check className="w-3 h-3 ml-auto text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <StatusDot status={status} pulse={status === "red"} />
            )}
          </div>
          {issue && (
            <p className="text-xs text-muted-foreground truncate">{issue}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-muted-foreground">{lastActivity}</span>
          {onMarkReviewed && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMarkReviewed}
              className="h-7 px-2 gap-1 text-xs font-medium text-green-400 hover:text-green-300 hover:bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Marcar como revisado"
            >
              <Check className="w-3 h-3" />
            </Button>
          )}
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
