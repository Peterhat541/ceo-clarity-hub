import { useState } from "react";
import { CEOLayout } from "@/components/layout/CEOLayout";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ClientCard } from "@/components/dashboard/ClientCard";
import { IncidentRow } from "@/components/dashboard/IncidentRow";
import { AgendaPopup } from "@/components/dashboard/AgendaPopup";
import { ClientPopup } from "@/components/dashboard/ClientPopup";
import { TeamNotesPopup } from "@/components/dashboard/TeamNotesPopup";
import { ReminderAlert } from "@/components/dashboard/ReminderAlert";
import { SendNotePopup } from "@/components/dashboard/SendNotePopup";
import { ClientChatModal } from "@/components/ai/ClientChatModal";
import { Search, Clock, MessageSquare, AlertTriangle, Calendar, AlertOctagon, Sun, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useClientContext } from "@/contexts/ClientContext";
import { useEventContext } from "@/contexts/EventContext";
import { useNoteContext } from "@/contexts/NoteContext";

// Mock data
const clientsAttention = [
  {
    name: "Nexus Tech",
    status: "red" as const,
    lastActivity: "Hace 3 días",
    issue: "Incidencia de facturación sin resolver. El cliente ha enviado 2 emails sin respuesta.",
    projectCount: 2,
  },
  {
    name: "Global Media",
    status: "orange" as const,
    lastActivity: "Hace 1 día",
    issue: "Solicitud de llamada urgente pendiente de confirmar.",
    projectCount: 1,
  },
  {
    name: "Startup Lab",
    status: "orange" as const,
    lastActivity: "Hace 2 días",
    issue: "Fecha límite de entrega del proyecto en 48 horas.",
    projectCount: 3,
  },
];

const recentIncidents = [
  {
    clientName: "Nexus Tech",
    description: "Error en la facturación del mes de enero - cliente esperando resolución",
    status: "red" as const,
    daysOpen: 3,
  },
  {
    clientName: "Global Media",
    description: "Cambio de alcance solicitado por el cliente - pendiente de valorar",
    status: "orange" as const,
    daysOpen: 1,
  },
  {
    clientName: "CoreData",
    description: "Retraso en entrega de contenidos por parte del cliente",
    status: "yellow" as const,
    daysOpen: 5,
  },
];

const criticalDates = [
  {
    title: "Entrega proyecto Startup Lab",
    subtitle: "Fase 2 del desarrollo",
    days: 2,
  },
  {
    title: "Reunión trimestral BlueSky",
    subtitle: "Seguimiento de objetivos",
    days: 4,
  },
];

const allClients = [
  { name: "Nexus Tech", status: "red" as const, lastActivity: "Hace 3 días", issue: "Incidencia de facturación sin resolver. El cliente ha enviado 2 emails sin respuesta.", projectCount: 2 },
  { name: "Global Media", status: "orange" as const, lastActivity: "Hace 1 día", issue: "Solicitud de llamada urgente pendiente de confirmar.", projectCount: 1 },
  { name: "Startup Lab", status: "orange" as const, lastActivity: "Hace 2 días", issue: "Fecha límite de entrega del proyecto en 48 horas.", projectCount: 3 },
  { name: "CoreData", status: "yellow" as const, lastActivity: "Hace 5 días", projectCount: 2 },
  { name: "BlueSky Ventures", status: "green" as const, lastActivity: "Hoy", projectCount: 1 },
  { name: "TechFlow Solutions", status: "green" as const, lastActivity: "Ayer", projectCount: 4 },
];

export default function Index() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [clientPopupOpen, setClientPopupOpen] = useState(false);
  const [selectedClientData, setSelectedClientData] = useState<typeof allClients[0] | null>(null);
  const [sendNoteOpen, setSendNoteOpen] = useState(false);
  const [openChatClients, setOpenChatClients] = useState<typeof allClients>([]);
  const { selectedClient, setSelectedClient, activateClientWithContext } = useClientContext();
  const { getTodayEvents } = useEventContext();
  const { getTodayCEONotes } = useNoteContext();

  const todayEvents = getTodayEvents();
  const todayNotes = getTodayCEONotes();
  const todayCount = clientsAttention.length;
  const incidentsCount = recentIncidents.length;
  const redClientsCount = clientsAttention.filter((c) => c.status === "red").length;
  const criticalDatesCount = criticalDates.length;
  const pendingNotesCount = todayNotes.filter(n => n.status === "pending").length;

  const filteredClients = allClients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardClick = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const openClientChat = (clientName: string) => {
    const clientData = allClients.find(c => c.name === clientName);
    if (clientData && !openChatClients.some(c => c.name === clientName)) {
      setOpenChatClients(prev => [...prev, clientData]);
    }
  };

  const closeClientChat = (clientName: string) => {
    setOpenChatClients(prev => prev.filter(c => c.name !== clientName));
  };

  const handleClientClick = (clientName: string) => {
    openClientChat(clientName);
  };

  const handleAIClick = (clientName: string, issue?: string) => {
    openClientChat(clientName);
  };

  const handleIncidentClick = (clientName: string, description?: string) => {
    // Activate IA chat with incident context
    activateClientWithContext(clientName, description);
  };

  const handleClientSelect = (clientName: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    const clientData = allClients.find(c => c.name === clientName);
    if (clientData) {
      setSelectedClientData(clientData);
      setClientPopupOpen(true);
    }
  };

  const isClientHighlighted = (clientName: string) => {
    return selectedClient?.toLowerCase() === clientName.toLowerCase();
  };

  return (
    <CEOLayout>
      <div className="w-full animate-fade-in h-full flex flex-col px-6 py-4">
        {/* Header with Search */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-foreground mb-2">
            Buenos días
          </h1>
          
          {/* Search Bar */}
          <button 
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-left"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Buscar cliente...</span>
          </button>
        </div>

        {/* Summary Cards - Main Navigation Hub */}
        <div className="flex items-center gap-3 mb-4">
          <div className="grid grid-cols-4 gap-3 flex-1">
            <SummaryCard
              title="Hoy"
              value={todayCount}
              subtitle={`Hoy · ${incidentsCount} incidencias · ${redClientsCount} en rojo · ${criticalDatesCount} fechas`}
              icon={<Sun className="w-4 h-4" />}
              onClick={() => handleCardClick("today")}
              active={activeSection === "today"}
            />
            <SummaryCard
              title="Incidencias"
              value={incidentsCount}
              subtitle={`Hoy · ${incidentsCount} incidencias · ${redClientsCount} en rojo · ${criticalDatesCount} fechas`}
              icon={<AlertOctagon className="w-4 h-4" />}
              variant="warning"
              onClick={() => handleCardClick("incidents")}
              active={activeSection === "incidents"}
            />
            <SummaryCard
              title="Clientes en rojo"
              value={redClientsCount}
              subtitle={`Hoy · ${incidentsCount} incidencias · ${redClientsCount} en rojo · ${criticalDatesCount} fechas`}
              icon={<AlertTriangle className="w-4 h-4" />}
              variant="danger"
              onClick={() => handleCardClick("red")}
              active={activeSection === "red"}
            />
            <SummaryCard
              title="Fechas críticas"
              value={criticalDatesCount}
              subtitle={`Hoy · ${incidentsCount} incidencias · ${redClientsCount} en rojo · ${criticalDatesCount} fechas`}
              icon={<Calendar className="w-4 h-4" />}
              onClick={() => handleCardClick("dates")}
              active={activeSection === "dates"}
            />
          </div>
          {activeSection && (
            <button
              onClick={() => setActiveSection(null)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0"
            >
              <X className="w-4 h-4" />
              Limpiar: {activeSection === "today" ? "Hoy" : activeSection === "incidents" ? "Incidencias" : activeSection === "red" ? "Clientes en rojo" : "Fechas críticas"}
            </button>
          )}
        </div>

        {/* Filtered Content based on card selection */}
        {activeSection === "today" && (
          <div className="mb-6 animate-fade-in">
            {/* Clients needing attention - Always visible */}
            <section className="mb-4">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Clientes que requieren atención
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {clientsAttention.map((client) => (
                  <ClientCard
                    key={client.name}
                    {...client}
                    onClick={() => handleClientClick(client.name)}
                    onAIClick={() => handleAIClick(client.name, client.issue)}
                    highlighted={isClientHighlighted(client.name)}
                  />
                ))}
              </div>
            </section>

            {/* Action Buttons - Agenda & Notes */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAgendaOpen(true)}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-card/80 transition-all cursor-pointer group"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  todayEvents.length > 0 
                    ? "bg-primary/20 group-hover:bg-primary/30" 
                    : "bg-secondary group-hover:bg-secondary/80"
                )}>
                  <Clock className={cn(
                    "w-6 h-6",
                    todayEvents.length > 0 ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">Agenda</p>
                  <p className="text-sm text-muted-foreground">
                    {todayEvents.length} evento{todayEvents.length !== 1 ? "s" : ""} hoy
                  </p>
                </div>
                {todayEvents.length > 0 && (
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                    {todayEvents.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setNotesOpen(true)}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-purple-500/50 hover:bg-card/80 transition-all cursor-pointer group"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  pendingNotesCount > 0 
                    ? "bg-purple-500/20 group-hover:bg-purple-500/30" 
                    : "bg-secondary group-hover:bg-secondary/80"
                )}>
                  <MessageSquare className={cn(
                    "w-6 h-6",
                    pendingNotesCount > 0 ? "text-purple-400" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">Notas del equipo</p>
                  <p className="text-sm text-muted-foreground">
                    {pendingNotesCount > 0 
                      ? `${pendingNotesCount} pendiente${pendingNotesCount !== 1 ? "s" : ""}` 
                      : "Sin notas pendientes"}
                  </p>
                </div>
                {pendingNotesCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium">
                    {pendingNotesCount}
                  </span>
                )}
              </button>
            </div>

            {/* Send Note Button */}
            <button
              onClick={() => setSendNoteOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all cursor-pointer text-primary font-medium"
            >
              <Send className="w-4 h-4" />
              Enviar nota al equipo
            </button>

            {/* Reminders Section */}
            <ReminderAlert />
          </div>
        )}

        {activeSection === "incidents" && (
          <div className="mb-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-foreground mb-3">Incidencias activas</h2>
            <div className="space-y-3">
              {recentIncidents.map((incident, index) => (
                <IncidentRow
                  key={index}
                  {...incident}
                  onClick={() => handleIncidentClick(incident.clientName, incident.description)}
                />
              ))}
            </div>
          </div>
        )}

        {activeSection === "red" && (
          <div className="mb-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-foreground mb-3">Clientes en rojo</h2>
            <div className="space-y-3">
              {clientsAttention
                .filter((c) => c.status === "red")
                .map((client) => (
                  <ClientCard
                    key={client.name}
                    {...client}
                    onClick={() => handleClientClick(client.name)}
                    onAIClick={() => handleAIClick(client.name, client.issue)}
                    highlighted={isClientHighlighted(client.name)}
                  />
                ))}
            </div>
          </div>
        )}

        {activeSection === "dates" && (
          <div className="mb-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-foreground mb-3">Próximas fechas críticas</h2>
            <div className="space-y-2">
              {criticalDates.map((date, index) => (
                <div
                  key={index}
                  onClick={() => console.log("Navigate to date:", date.title)}
                  className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-status-orange/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-status-orange" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{date.title}</p>
                    <p className="text-xs text-muted-foreground">{date.subtitle}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-status-orange/20 text-status-orange text-xs font-medium">
                    {date.days}d
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Default view when no card is selected */}
        {!activeSection && (
          <>
            {/* Clients needing attention - Always visible */}
            <section className="mb-4">
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Clientes que requieren atención
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {clientsAttention.map((client) => (
                  <ClientCard 
                    key={client.name} 
                    {...client} 
                    onClick={() => handleClientClick(client.name)}
                    onAIClick={() => handleAIClick(client.name, client.issue)}
                    highlighted={isClientHighlighted(client.name)}
                  />
                ))}
              </div>
            </section>

            {/* Action Buttons - Agenda & Notes */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAgendaOpen(true)}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-card/80 transition-all cursor-pointer group"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  todayEvents.length > 0 
                    ? "bg-primary/20 group-hover:bg-primary/30" 
                    : "bg-secondary group-hover:bg-secondary/80"
                )}>
                  <Clock className={cn(
                    "w-6 h-6",
                    todayEvents.length > 0 ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">Agenda</p>
                  <p className="text-sm text-muted-foreground">
                    {todayEvents.length} evento{todayEvents.length !== 1 ? "s" : ""} hoy
                  </p>
                </div>
                {todayEvents.length > 0 && (
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                    {todayEvents.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setNotesOpen(true)}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-purple-500/50 hover:bg-card/80 transition-all cursor-pointer group"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  pendingNotesCount > 0 
                    ? "bg-purple-500/20 group-hover:bg-purple-500/30" 
                    : "bg-secondary group-hover:bg-secondary/80"
                )}>
                  <MessageSquare className={cn(
                    "w-6 h-6",
                    pendingNotesCount > 0 ? "text-purple-400" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">Notas del equipo</p>
                  <p className="text-sm text-muted-foreground">
                    {pendingNotesCount > 0 
                      ? `${pendingNotesCount} pendiente${pendingNotesCount !== 1 ? "s" : ""}` 
                      : "Sin notas pendientes"}
                  </p>
                </div>
                {pendingNotesCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium">
                    {pendingNotesCount}
                  </span>
                )}
              </button>
            </div>

            {/* Send Note Button */}
            <button
              onClick={() => setSendNoteOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all cursor-pointer text-primary font-medium"
            >
              <Send className="w-4 h-4" />
              Enviar nota al equipo
            </button>

            {/* Reminders Section */}
            <ReminderAlert />
          </>
        )}

        {/* Search Dialog */}
        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Buscar cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nombre del cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {(searchQuery ? filteredClients : allClients).map((client) => (
                  <button
                    key={client.name}
                    onClick={() => handleClientSelect(client.name)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <span className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      client.status === "red" && "bg-status-red",
                      client.status === "orange" && "bg-status-orange",
                      client.status === "yellow" && "bg-status-yellow",
                      client.status === "green" && "bg-status-green",
                    )} />
                    <span className="font-medium text-foreground">{client.name}</span>
                  </button>
                ))}
                {searchQuery && filteredClients.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No se encontraron clientes
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Agenda Popup */}
        <AgendaPopup isOpen={agendaOpen} onClose={() => setAgendaOpen(false)} />

        {/* Team Notes Popup */}
        <TeamNotesPopup isOpen={notesOpen} onClose={() => setNotesOpen(false)} />

        {/* Send Note Popup */}
        <SendNotePopup isOpen={sendNoteOpen} onClose={() => setSendNoteOpen(false)} />

        {/* Client Popup */}
        <ClientPopup 
          client={selectedClientData}
          open={clientPopupOpen}
          onOpenChange={setClientPopupOpen}
          onAIClick={(name, issue) => {
            setClientPopupOpen(false);
            openClientChat(name);
          }}
        />

        {/* Client Chat Modals - Multiple simultaneous */}
        {openChatClients.map((client, index) => (
          <ClientChatModal
            key={client.name}
            open={true}
            onOpenChange={(open) => !open && closeClientChat(client.name)}
            clientId={null}
            clientName={client.name}
            clientStatus={client.status}
            issue={client.issue}
          />
        ))}
      </div>
    </CEOLayout>
  );
}
