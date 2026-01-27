import { useState } from "react";
import { ClientCard } from "./ClientCard";
import { ClientChatModal } from "@/components/ai/ClientChatModal";
import { AgendaPopup } from "./AgendaPopup";
import { TeamNotesPopup } from "./TeamNotesPopup";
import { AIChat } from "@/components/ai/AIChat";
import { 
  Calendar, 
  MessageSquare, 
  AlertTriangle,
  CalendarDays,
  Building2,
  Clock,
  Sparkles
} from "lucide-react";
import { useEventContext } from "@/contexts/EventContext";
import { useNoteContext } from "@/contexts/NoteContext";
import { cn } from "@/lib/utils";
import processiaLogo from "@/assets/processia-logo-new.png";

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

export function DesktopCEODashboard() {
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
    <div className="h-full min-h-0 w-full flex overflow-hidden">
      {/* Main Content Area - Full width, no constraints */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden">
        {/* Header - Full width */}
        <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <img src={processiaLogo} alt="Processia" className="h-8" />
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">Buenos días, Juan</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </header>

        {/* Content Grid - Full width with padding */}
        <div className="flex-1 min-h-0 overflow-auto p-6">
          {/* Stats Row - Full width grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setAgendaOpen(true)}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all text-left"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{todayEvents.length}</p>
                <p className="text-sm text-muted-foreground">Eventos hoy</p>
              </div>
            </button>

            <button
              onClick={() => setNotesOpen(true)}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all text-left"
            >
              <div className="h-12 w-12 rounded-xl bg-status-purple/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-status-purple" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{pendingNotes.length}</p>
                <p className="text-sm text-muted-foreground">Notas pendientes</p>
              </div>
            </button>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
              <div className="h-12 w-12 rounded-xl bg-status-orange/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-status-orange" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{recentIncidents.length}</p>
                <p className="text-sm text-muted-foreground">Incidencias</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
              <div className="h-12 w-12 rounded-xl bg-status-red/10 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-status-red" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{criticalDates.length}</p>
                <p className="text-sm text-muted-foreground">Fechas críticas</p>
              </div>
            </div>
          </div>

          {/* Main Content - 3 Column Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Column 1: Clients */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Clientes que requieren atención
                </h2>
              </div>
              <div className="space-y-3">
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
              </div>
            </div>

            {/* Column 2: Incidents */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Incidencias activas
                </h2>
              </div>
              <div className="space-y-3">
                {recentIncidents.map((incident, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <div className={cn(
                      "h-3 w-3 rounded-full shrink-0",
                      incident.status === "red" ? "bg-status-red" : "bg-status-orange"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{incident.clientName}</p>
                      <p className="text-sm text-muted-foreground truncate">{incident.description}</p>
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0">{incident.daysOpen}d</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Critical Dates */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Fechas críticas
                </h2>
              </div>
              <div className="space-y-3">
                {criticalDates.map((date, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <CalendarDays className="h-5 w-5 text-status-orange shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{date.title}</p>
                      <p className="text-sm text-muted-foreground">{date.subtitle}</p>
                    </div>
                    <span className="rounded-full bg-status-orange/20 px-3 py-1 text-sm font-medium text-status-orange shrink-0">
                      {date.days}d
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - AI Chat (fixed width) */}
      <aside className="w-[400px] border-l border-border bg-card flex flex-col shrink-0 min-h-0">
        <div className="h-14 border-b border-border px-4 flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Asistente IA</h2>
            <p className="text-xs text-muted-foreground">Pregúntame lo que necesites</p>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <AIChat />
        </div>
      </aside>

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
