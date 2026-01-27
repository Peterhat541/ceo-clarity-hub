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
  Sparkles,
  Send
} from "lucide-react";
import { useEventContext } from "@/contexts/EventContext";
import { useNoteContext } from "@/contexts/NoteContext";
import processiaLogo from "@/assets/processia-logo-new.png";
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

export function DesktopCEODashboard() {
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [sendNoteOpen, setSendNoteOpen] = useState(false);
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

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  // Format date
  const formatDate = () => {
    const now = new Date();
    const day = now.getDate();
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${day} ${months[now.getMonth()]}`;
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Minimal Header */}
      <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-border bg-card/50 backdrop-blur-sm">
        <img src={processiaLogo} alt="Processia" className="h-7" />
        <span className="text-sm text-muted-foreground">
          {getGreeting()} · {formatDate()}
        </span>
      </header>

      {/* Main Content - Two Giant Cards */}
      <main className="flex-1 flex gap-6 p-6 min-h-0">
        {/* Left Card: Clients */}
        <div className="flex-1 glass-card card-giant flex flex-col overflow-hidden animate-fade-up">
          <h2 className="text-lg font-semibold text-foreground mb-4 shrink-0">
            Clientes que requieren atención
          </h2>
          
          {/* Client List - Scrollable */}
          <div className="flex-1 overflow-auto space-y-3 min-h-0 pr-2">
            {sortedClients.map((client, index) => (
              <div 
                key={client.name}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ClientCard
                  variant="compact"
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

          {/* Footer with Quick Access */}
          <div className="pt-4 mt-4 border-t border-border shrink-0 space-y-3">
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setAgendaOpen(true)}
                className="flex-1 h-12 gap-2 bg-primary/10 hover:bg-primary/20 text-primary justify-start"
              >
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{todayEvents.length} eventos</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setNotesOpen(true)}
                className="flex-1 h-12 gap-2 bg-status-purple/10 hover:bg-status-purple/20 text-status-purple justify-start"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">{pendingNotes.length} notas</span>
              </Button>
            </div>
            <Button
              onClick={() => setSendNoteOpen(true)}
              variant="ghost"
              className="w-full h-11 bg-secondary hover:bg-secondary/80 text-foreground font-medium gap-2"
            >
              <Send className="h-4 w-4" />
              Enviar nota al equipo
            </Button>
          </div>
        </div>

        {/* Right Card: AI Chat */}
        <div className="w-[500px] glass-card rounded-3xl flex flex-col overflow-hidden shrink-0 animate-fade-up-delay-1">
          {/* AI Header */}
          <div className="p-5 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-teal flex items-center justify-center glow">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Asistente IA</h2>
                <p className="text-sm text-muted-foreground">Tu mano derecha ejecutiva</p>
              </div>
            </div>
          </div>
          
          {/* AI Chat Content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <AIChat />
          </div>
        </div>
      </main>

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
