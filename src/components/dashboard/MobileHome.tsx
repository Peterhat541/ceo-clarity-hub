import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Users,
  CalendarDays,
  Sparkles,
  Settings,
  LogOut,
  Bot,
} from "lucide-react";
import { useEventContext } from "@/contexts/EventContext";
import { useNoteContext } from "@/contexts/NoteContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ssIcon from "@/assets/ss-icon.png";

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

const criticalDates = [
  { title: "Entrega Startup Lab", subtitle: "Fase 2", days: 2 },
  { title: "Reunión BlueSky", subtitle: "Seguimiento", days: 4 },
];

export function MobileHome() {
  const navigate = useNavigate();
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [sendNoteOpen, setSendNoteOpen] = useState(false);
  const [clientsOpen, setClientsOpen] = useState(false);
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
    { icon: <Calendar className="h-5 w-5 text-primary" />, label: "Agenda", bgClass: "bg-primary/10", onClick: () => setAgendaOpen(true), badge: todayEvents.length },
    { icon: <MessageSquare className="h-5 w-5 text-status-purple" />, label: "Notas", bgClass: "bg-status-purple/10", onClick: () => setNotesOpen(true), badge: pendingNotes.length },
    { icon: <Users className="h-5 w-5 text-status-orange" />, label: "Clientes", bgClass: "bg-status-orange/10", onClick: () => setClientsOpen(true), badge: clientsAttention.length },
    { icon: <CalendarDays className="h-5 w-5 text-status-red" />, label: "Fechas", bgClass: "bg-status-red/10", onClick: () => setDatesOpen(true), badge: criticalDates.length },
  ];

  const statusPriority = { red: 0, orange: 1, yellow: 2, green: 3 };
  const sortedClients = [...clientsAttention].sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
      {/* Compact Header */}
      <header className="shrink-0 px-4 py-2.5 border-b border-border/50 bg-sidebar-background/80 backdrop-blur-sm safe-area-top flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={ssIcon} alt="Prossium" className="h-6 w-6 rounded-lg" />
          <span className="font-semibold text-sm text-foreground">Prossium</span>
          <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full border border-border/50 bg-card/50">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[0.6rem] text-muted-foreground">IA activa</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            title="Configuración"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => { sessionStorage.removeItem("demo_access"); navigate("/landing"); }}
            className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            title="Salir"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* AI Chat Section */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* AI Header */}
        <div className="shrink-0 px-5 py-3 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-mint flex items-center justify-center glow">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">Nexus IA</h2>
              <p className="text-xs text-muted-foreground">Conectada a tus datos y herramientas</p>
            </div>
          </div>
        </div>
        
        {/* AI Chat Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <AIChat />
        </div>
      </div>

      {/* Quick Access Footer */}
      <div className="shrink-0 border-t border-border/50 bg-sidebar-background/80 backdrop-blur-sm px-5 py-2.5 safe-area-bottom">
        <QuickAccessGrid items={quickAccessItems} />
        <p className="text-center mt-1.5 text-[0.55rem] text-muted-foreground/30 tracking-wider">Nexus IA · Powered by Prossium</p>
      </div>

      {/* Popups */}
      <AgendaPopup isOpen={agendaOpen} onClose={() => setAgendaOpen(false)} />
      <TeamNotesPopup isOpen={notesOpen} onClose={() => setNotesOpen(false)} />
      <SendNotePopup isOpen={sendNoteOpen} onClose={() => setSendNoteOpen(false)} />

      {/* Clients Modal */}
      <Dialog open={clientsOpen} onOpenChange={setClientsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto bg-card border-border">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Seguimientos activos</h2>
          <div className="space-y-3">
            {clientsAttention.map((client) => (
              <button
                key={client.name}
                onClick={() => handleClientClick(client)}
                className="flex w-full items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
              >
                <div className={`h-3 w-3 rounded-full shrink-0 ${
                  client.status === "red" ? "bg-status-red" :
                  client.status === "orange" ? "bg-status-orange" :
                  client.status === "yellow" ? "bg-status-yellow" : "bg-status-green"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{client.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{client.issue}</p>
                </div>
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
              </button>
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
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                <CalendarDays className="h-5 w-5 text-status-orange" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{date.title}</p>
                  <p className="text-sm text-muted-foreground">{date.subtitle}</p>
                </div>
                <span className="rounded-full bg-status-orange/20 px-2 py-1 text-xs font-medium text-status-orange">{date.days}d</span>
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
