import { useState } from "react";
import { ClientCard } from "./ClientCard";
import { ClientChatModal } from "@/components/ai/ClientChatModal";
import { AgendaPopup } from "./AgendaPopup";
import { TeamNotesPopup } from "./TeamNotesPopup";
import { SendNotePopup } from "./SendNotePopup";
import { AIChat } from "@/components/ai/AIChat";
import { 
  Calendar, 
  MessageSquare, 
  AlertTriangle,
  CalendarDays,
  Search,
  Sparkles,
  Send
} from "lucide-react";
import { useEventContext } from "@/contexts/EventContext";
import { useNoteContext } from "@/contexts/NoteContext";
import { cn } from "@/lib/utils";
import processiaLogo from "@/assets/processia-logo-new.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [sendNoteOpen, setSendNoteOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { getTodayEvents } = useEventContext();
  const { getTodayCEONotes } = useNoteContext();

  const todayEvents = getTodayEvents();
  const pendingNotes = getTodayCEONotes().filter(n => n.status === "pending");

  // Sort by criticality
  const statusPriority = { red: 0, orange: 1, yellow: 2, green: 3 };
  const sortedClients = [...clientsAttention].sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
  
  // Count clients in red
  const redClients = clientsAttention.filter(c => c.status === "red").length;

  const handleClientClick = (client: ClientData) => {
    setSelectedClient(client);
  };

  return (
    <div className="h-full min-h-0 w-full flex overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4 shrink-0">
          <div className="flex items-center gap-4 mb-3">
            <img src={processiaLogo} alt="Processia" className="h-8" />
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-semibold text-foreground">Buenos días</h1>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto p-6 space-y-6">
          {/* Stats Row - 4 Cards */}
          <div className="grid grid-cols-4 gap-4">
            {/* Hoy */}
            <button
              onClick={() => setAgendaOpen(true)}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all text-left"
            >
              <Sparkles className="h-5 w-5 text-primary mb-2" />
              <p className="text-3xl font-bold text-foreground">{todayEvents.length}</p>
              <p className="text-sm font-medium text-foreground mt-1">Hoy</p>
              <p className="text-xs text-muted-foreground">
                Hoy · {recentIncidents.length} incidencias · {redClients} en rojo · {criticalDates.length} fechas
              </p>
            </button>

            {/* Incidencias */}
            <div className="p-4 rounded-xl bg-card border border-border">
              <AlertTriangle className="h-5 w-5 text-status-purple mb-2" />
              <p className="text-3xl font-bold text-foreground">{recentIncidents.length}</p>
              <p className="text-sm font-medium text-foreground mt-1">Incidencias</p>
              <p className="text-xs text-muted-foreground">
                Hoy · {recentIncidents.length} incidencias · {redClients} en rojo · {criticalDates.length} fechas
              </p>
            </div>

            {/* Clientes en rojo */}
            <div className="p-4 rounded-xl bg-card border border-border">
              <AlertTriangle className="h-5 w-5 text-status-orange mb-2" />
              <p className="text-3xl font-bold text-foreground">{redClients}</p>
              <p className="text-sm font-medium text-foreground mt-1">Clientes en rojo</p>
              <p className="text-xs text-muted-foreground">
                Hoy · {recentIncidents.length} incidencias · {redClients} en rojo · {criticalDates.length} fechas
              </p>
            </div>

            {/* Fechas críticas */}
            <div className="p-4 rounded-xl bg-card border border-border">
              <CalendarDays className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-3xl font-bold text-foreground">{criticalDates.length}</p>
              <p className="text-sm font-medium text-foreground mt-1">Fechas críticas</p>
              <p className="text-xs text-muted-foreground">
                Hoy · {recentIncidents.length} incidencias · {redClients} en rojo · {criticalDates.length} fechas
              </p>
            </div>
          </div>

          {/* Clients Section - Horizontal */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Clientes que requieren atención
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {sortedClients.map((client) => (
                <div key={client.name} className="min-w-[280px] flex-shrink-0">
                  <ClientCard
                    name={client.name}
                    status={client.status}
                    lastActivity={client.lastActivity}
                    issue={client.issue}
                    projectCount={client.projectCount}
                    onAIClick={() => handleClientClick(client)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mi Espacio Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Mi espacio
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Agenda */}
              <button
                onClick={() => setAgendaOpen(true)}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Agenda</p>
                    <p className="text-sm text-muted-foreground">{todayEvents.length} evento{todayEvents.length !== 1 ? 's' : ''} hoy</p>
                  </div>
                </div>
                {todayEvents.length > 0 && (
                  <span className="h-6 min-w-[24px] px-2 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                    {todayEvents.length}
                  </span>
                )}
              </button>

              {/* Notas del equipo */}
              <button
                onClick={() => setNotesOpen(true)}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-status-purple/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-status-purple" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Notas del equipo</p>
                    <p className="text-sm text-muted-foreground">{pendingNotes.length} pendiente{pendingNotes.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                {pendingNotes.length > 0 && (
                  <span className="h-6 min-w-[24px] px-2 rounded-full bg-status-purple text-white text-xs font-medium flex items-center justify-center">
                    {pendingNotes.length}
                  </span>
                )}
              </button>
            </div>

            {/* Send Note Button */}
            <Button
              onClick={() => setSendNoteOpen(true)}
              variant="ghost"
              className="w-full h-12 bg-primary/10 hover:bg-primary/20 text-primary font-medium gap-2"
            >
              <Send className="h-4 w-4" />
              Enviar nota al equipo
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - AI Chat */}
      <aside className="w-[400px] border-l border-border bg-card flex flex-col shrink-0 min-h-0">
        <div className="h-14 border-b border-border px-4 flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Asistente IA</h2>
            <p className="text-xs text-muted-foreground">Tu mano derecha ejecutiva</p>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <AIChat />
        </div>
      </aside>

      {/* Popups */}
      <AgendaPopup isOpen={agendaOpen} onClose={() => setAgendaOpen(false)} />
      <TeamNotesPopup isOpen={notesOpen} onClose={() => setNotesOpen(false)} />
      <SendNotePopup isOpen={sendNoteOpen} onClose={() => setSendNoteOpen(false)} />

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
