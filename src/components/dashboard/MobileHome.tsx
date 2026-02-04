import { useState } from "react";
import { QuickAccessGrid } from "./QuickAccessGrid";
import { AgendaPopup } from "./AgendaPopup";
import { TeamNotesPopup } from "./TeamNotesPopup";
import { SendNotePopup } from "./SendNotePopup";
import { ClientCard } from "./ClientCard";
import { ClientChatModal } from "@/components/ai/ClientChatModal";
import { AIChat } from "@/components/ai/AIChat";
import { 
  Calendar, 
  MessageSquare, 
  AlertTriangle,
  CalendarDays,
  Sparkles
} from "lucide-react";
import { useEventContext } from "@/contexts/EventContext";
import { useNoteContext } from "@/contexts/NoteContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

export function MobileHome() {
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [sendNoteOpen, setSendNoteOpen] = useState(false);
  const [clientsOpen, setClientsOpen] = useState(false);
  const [incidentsOpen, setIncidentsOpen] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<typeof clientsAttention[0] | null>(null);

  const { getTodayEvents } = useEventContext();
  const { getTodayCEONotes } = useNoteContext();

  const todayEvents = getTodayEvents();
  const pendingNotes = getTodayCEONotes().filter(n => n.status === "pending");

  const handleClientClick = (client: typeof clientsAttention[0]) => {
    setSelectedClient(client);
    setClientsOpen(false);
  };

  const quickAccessItems = [
    {
      icon: <Calendar className="h-5 w-5 text-primary" />,
      label: "Agenda",
      bgClass: "bg-primary/10",
      onClick: () => setAgendaOpen(true),
      badge: todayEvents.length,
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-status-purple" />,
      label: "Notas",
      bgClass: "bg-status-purple/10",
      onClick: () => setNotesOpen(true),
      badge: pendingNotes.length,
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-status-orange" />,
      label: "Incidencias",
      bgClass: "bg-status-orange/10",
      onClick: () => setIncidentsOpen(true),
      badge: recentIncidents.length,
    },
    {
      icon: <CalendarDays className="h-5 w-5 text-status-red" />,
      label: "Fechas",
      bgClass: "bg-status-red/10",
      onClick: () => setDatesOpen(true),
      badge: criticalDates.length,
    },
  ];

  // Sort by criticality and show first 2
  const statusPriority = { red: 0, orange: 1, yellow: 2, green: 3 };
  const sortedClients = [...clientsAttention].sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
  const visibleClients = sortedClients.slice(0, 2);
  const hasMoreClients = sortedClients.length > 2;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background bg-grid overflow-hidden">
      {/* Compact Header */}
      <header className="shrink-0 px-4 py-3 border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <h1 className="text-lg font-bold text-foreground">{getGreeting()}, Juan!</h1>
      </header>

      {/* AI Chat Section - Main content area */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* AI Header */}
        <div className="shrink-0 px-4 py-3 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-teal flex items-center justify-center glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Asistente IA</h2>
              <p className="text-xs text-muted-foreground">Tu mano derecha ejecutiva</p>
            </div>
          </div>
        </div>
        
        {/* AI Chat Content - Takes available space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <AIChat />
        </div>
      </div>

      {/* Critical Clients Section - Compact */}
      <div className="shrink-0 h-[140px] border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="h-full flex flex-col p-3">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Clientes críticos
            </h2>
            {hasMoreClients && (
              <button 
                onClick={() => setClientsOpen(true)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Ver todos ({clientsAttention.length})
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-auto space-y-2 min-h-0">
            {visibleClients.map((client) => (
              <ClientCard
                key={client.name}
                variant="compact"
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
      </div>

      {/* Quick Access Footer */}
      <div className="shrink-0 border-t border-border/50 bg-card/50 backdrop-blur-sm px-4 py-2">
        <QuickAccessGrid items={quickAccessItems} />
      </div>

      {/* Popups */}
      <AgendaPopup isOpen={agendaOpen} onClose={() => setAgendaOpen(false)} />
      <TeamNotesPopup isOpen={notesOpen} onClose={() => setNotesOpen(false)} />
      <SendNotePopup isOpen={sendNoteOpen} onClose={() => setSendNoteOpen(false)} />

      {/* Clients Modal */}
      <Dialog open={clientsOpen} onOpenChange={setClientsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto bg-card border-border">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Clientes que requieren atención</h2>
          <div className="space-y-3">
            {clientsAttention.map((client) => (
              <button
                key={client.name}
                onClick={() => handleClientClick(client)}
                className="flex w-full items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
              >
                <div className={`h-3 w-3 rounded-full ${
                  client.status === "red" ? "bg-status-red" :
                  client.status === "orange" ? "bg-status-orange" :
                  client.status === "yellow" ? "bg-status-yellow" : "bg-status-green"
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.issue}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Incidents Modal */}
      <Dialog open={incidentsOpen} onOpenChange={setIncidentsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto bg-card border-border">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Incidencias activas</h2>
          <div className="space-y-3">
            {recentIncidents.map((incident, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary"
              >
                <div className={`h-3 w-3 rounded-full ${
                  incident.status === "red" ? "bg-status-red" :
                  incident.status === "orange" ? "bg-status-orange" : "bg-status-yellow"
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{incident.clientName}</p>
                  <p className="text-sm text-muted-foreground">{incident.description}</p>
                </div>
                <span className="text-xs text-muted-foreground">{incident.daysOpen}d</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dates Modal */}
      <Dialog open={datesOpen} onOpenChange={setDatesOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto bg-card border-border">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Fechas críticas</h2>
          <div className="space-y-3">
            {criticalDates.map((date, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary"
              >
                <CalendarDays className="h-5 w-5 text-status-orange" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{date.title}</p>
                  <p className="text-sm text-muted-foreground">{date.subtitle}</p>
                </div>
                <span className="rounded-full bg-status-orange/20 px-2 py-1 text-xs font-medium text-status-orange">
                  {date.days}d
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

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
