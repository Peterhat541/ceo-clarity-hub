import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail, Building2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientInfo {
  name: string;
  status: "red" | "orange" | "yellow" | "green";
  lastActivity?: string;
  issue?: string;
  projectCount?: number;
  email?: string;
  phone?: string;
}

interface ClientPopupProps {
  client: ClientInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAIClick: (clientName: string, issue?: string) => void;
}

const statusLabels = {
  red: "Crítico",
  orange: "Atención",
  yellow: "Pendiente",
  green: "Estable",
};

const statusColors = {
  red: "bg-status-red",
  orange: "bg-status-orange",
  yellow: "bg-status-yellow",
  green: "bg-status-green",
};

export function ClientPopup({ client, open, onOpenChange, onAIClick }: ClientPopupProps) {
  if (!client) return null;

  const handleAIClick = () => {
    onOpenChange(false);
    onAIClick(client.name, client.issue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className={cn("w-3 h-3 rounded-full", statusColors[client.status])} />
            {client.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              client.status === "red" && "bg-status-red/20 text-status-red",
              client.status === "orange" && "bg-status-orange/20 text-status-orange",
              client.status === "yellow" && "bg-status-yellow/20 text-status-yellow",
              client.status === "green" && "bg-status-green/20 text-status-green",
            )}>
              {statusLabels[client.status]}
            </span>
            {client.lastActivity && (
              <span className="text-xs text-muted-foreground">{client.lastActivity}</span>
            )}
          </div>

          {/* Issue Alert */}
          {client.issue && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-status-red/10 border border-status-red/20">
              <AlertTriangle className="w-4 h-4 text-status-red shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{client.issue}</p>
            </div>
          )}

          {/* Client Details */}
          <div className="space-y-2">
            {client.projectCount !== undefined && (
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{client.projectCount} proyecto{client.projectCount !== 1 ? "s" : ""} activo{client.projectCount !== 1 ? "s" : ""}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{client.phone}</span>
              </div>
            )}
          </div>

          {/* AI Button */}
          <Button 
            onClick={handleAIClick}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
          >
            <MessageSquare className="w-4 h-4" />
            Consultar con IA
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
