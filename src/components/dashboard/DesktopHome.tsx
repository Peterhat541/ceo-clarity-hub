import { useState } from "react";
import { ClientCard } from "./ClientCard";
import { ClientChatModal } from "@/components/ai/ClientChatModal";
import { AgendaPopup } from "./AgendaPopup";
import { TeamNotesPopup } from "./TeamNotesPopup";
import { 
  Calendar, 
  MessageSquare, 
  AlertTriangle,
  CalendarDays,
  Building2,
  Clock
} from "lucide-react";
import { useEventContext } from "@/contexts/EventContext";
import { useNoteContext } from "@/contexts/NoteContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock data
interface ClientData {
  name: string;
  status: "red" | "orange" | "yellow" | "green";
  lastActivity: string;
  issue?: string;
  projectCount: number;
}

const clientsAttention: ClientData[] = [
  { name: "Nexus Tech", status: "red", lastActivity: "Hace 3 días", issue: "Incidencia de facturación sin resolver.", projectCount: 2 },
  { name: "Global Media", status: "orange", lastActivity: "Hace 1 día", issue: "Solicitud de llamada urgente.", projectCount: 1 },
  { name: "Startup Lab", status: "orange", lastActivity: "Hace 2 días", issue: "Fecha límite en 48 horas.", projectCount: 3 },
];

const recentIncidents = [
  { clientName: "Nexus Tech", description: "Error en facturación", status: "red" as const, daysOpen: 3 },
  { clientName: "Global Media", description: "Cambio de alcance", status: "orange" as const, daysOpen: 1 },
];

const criticalDates = [
  { title: "Entrega Startup Lab", subtitle: "Fase 2", days: 2 },
  { title: "Reunión BlueSky", subtitle: "Seguimiento", days: 4 },
];

export function DesktopHome() {
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

  const { getTodayEvents } = useEventContext();
  const { getTodayCEONotes } = useNoteContext();

  const todayEvents = getTodayEvents();
  const pendingNotes = getTodayCEONotes().filter(n => n.status === "pending");

  // Sort by criticality
  const statusPriority = { red: 0, orange: 1, yellow: 2, green: 3 };
  const sortedClients = [...clientsAttention].sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

  const handleClientClick = (client: ClientData) => {
    setSelectedClient(client);
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-foreground">Buenos días, Juan</h1>
          <p className="text-muted-foreground">Aquí tienes el resumen de hoy</p>
        </header>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setAgendaOpen(true)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayEvents.length}</p>
                <p className="text-xs text-muted-foreground">Eventos hoy</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setNotesOpen(true)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-status-purple/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-status-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingNotes.length}</p>
                <p className="text-xs text-muted-foreground">Notas pendientes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-status-orange/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-status-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recentIncidents.length}</p>
                <p className="text-xs text-muted-foreground">Incidencias</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-status-red/10 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-status-red" />
              </div>
              <div>
                <p className="text-2xl font-bold">{criticalDates.length}</p>
                <p className="text-xs text-muted-foreground">Fechas críticas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Clients Needing Attention */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Clientes que requieren atención
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedClients.map((client) => (
                <ClientCard
                  key={client.name}
                  name={client.name}
                  status={client.status}
                  lastActivity={client.lastActivity}
                  issue={client.issue}
                  projectCount={client.projectCount}
                  onAIClick={() => handleClientClick(client)}
                />
              ))}
            </CardContent>
          </Card>

          {/* Right Column - Incidents & Dates */}
          <div className="space-y-6">
            {/* Recent Incidents */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Incidencias activas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentIncidents.map((incident, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <div className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      incident.status === "red" ? "bg-status-red" : "bg-status-orange"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{incident.clientName}</p>
                      <p className="text-xs text-muted-foreground truncate">{incident.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{incident.daysOpen}d</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Critical Dates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Fechas críticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {criticalDates.map((date, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <CalendarDays className="h-4 w-4 text-status-orange shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{date.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{date.subtitle}</p>
                    </div>
                    <span className="rounded-full bg-status-orange/20 px-2 py-0.5 text-xs font-medium text-status-orange shrink-0">
                      {date.days}d
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Popups */}
      <AgendaPopup isOpen={agendaOpen} onClose={() => setAgendaOpen(false)} />
      <TeamNotesPopup isOpen={notesOpen} onClose={() => setNotesOpen(false)} />

      {/* Client Chat Modal */}
      {selectedClient && (
        <ClientChatModal
          open={!!selectedClient}
          onOpenChange={(open) => !open && setSelectedClient(null)}
          clientId={null}
          clientName={selectedClient.name}
          clientStatus={selectedClient.status}
          issue={selectedClient.issue}
        />
      )}
    </div>
  );
}
