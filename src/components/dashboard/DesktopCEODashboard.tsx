import { useState, useEffect } from "react";
import { ClientCard } from "./ClientCard";
import { ClientChatModal } from "@/components/ai/ClientChatModal";
import { AgendaPopup } from "./AgendaPopup";
import { CalendarView } from "./CalendarView";
import { TeamNotesPopup } from "./TeamNotesPopup";
import { SendNotePopup } from "./SendNotePopup";
import { ReminderAlert } from "./ReminderAlert";
import { AIChat } from "@/components/ai/AIChat";
import { HeaderNavigation } from "@/components/layout/HeaderNavigation";
import { 
  Calendar, 
  Sparkles,
  Send,
  FolderOpen,
  Users,
  ClipboardList,
  MessageSquare,
  Plus,
  Bot,
  CheckCircle,
} from "lucide-react";
import { useEventContext } from "@/contexts/EventContext";
import { useNoteContext } from "@/contexts/NoteContext";
import { useReminderContext } from "@/contexts/ReminderContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Status } from "./StatusBadge";
import { useAIChatContext } from "@/contexts/AIChatContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ClientData {
  id: string;
  name: string;
  status: Status;
  lastActivity: string;
  issue?: string;
  projectCount: number;
}

export function DesktopCEODashboard() {
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [sendNoteOpen, setSendNoteOpen] = useState(false);
  const [clientsOpen, setClientsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [clientsAttention, setClientsAttention] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);

  const { events } = useEventContext();
  const { getTodayCEONotes } = useNoteContext();
  const { activeReminders } = useReminderContext();
  const { messages, conversationsList, activeConversationId, switchConversation, createNewConversation } = useAIChatContext();

  const pendingNotes = getTodayCEONotes().filter(n => n.status === "pending");
  const visibleReminders = activeReminders.filter((r) => !r.dismissed);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from("clients")
          .select("id, name, status, incidents, pending_tasks, last_contact, updated_at, project_type, work_description")
          .in("status", ["red", "orange", "yellow"])
          .order("updated_at", { ascending: false })
          .limit(10);

        if (error) throw error;

        if (data) {
          const completeClients = data.filter((client) =>
            client.project_type || client.work_description || client.incidents || client.pending_tasks
          );
          const mapped: ClientData[] = completeClients.map((client) => {
            const updatedAt = new Date(client.updated_at);
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
            
            let lastActivity = "Hoy";
            if (diffDays === 1) lastActivity = "Hace 1 día";
            else if (diffDays > 1) lastActivity = `Hace ${diffDays} días`;

            return {
              id: client.id,
              name: client.name,
              status: client.status as Status,
              lastActivity,
              issue: client.incidents || client.pending_tasks || undefined,
              projectCount: 1,
            };
          });
          setClientsAttention(mapped);
        }
      } catch (err) {
        console.error("Error fetching clients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const statusPriority = { red: 0, orange: 1, yellow: 2, green: 3 };
  const sortedClients = [...clientsAttention].sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

  const handleClientClick = (client: ClientData) => {
    setSelectedClient(client);
    setClientsOpen(false);
  };

  const handleMarkReviewed = async (client: ClientData) => {
    try {
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")} – Revisado por CEO`;
      
      const { error: clientError } = await supabase
        .from("clients")
        .update({ last_contact: formattedDate, status: "green" as const, updated_at: now.toISOString() })
        .eq("id", client.id);

      if (clientError) throw clientError;

      const noteText = client.issue 
        ? `✅ El CEO (Juan) ha revisado el cliente "${client.name}". Incidencia/tarea: "${client.issue}". Marcado como revisado.`
        : `✅ El CEO (Juan) ha revisado el cliente "${client.name}" y lo ha marcado como atendido.`;

      await supabase.from("notes").insert({ text: noteText, visible_to: "team", target_employee: null, created_by: "Juan", status: "pending", client_id: client.id });

      window.dispatchEvent(new CustomEvent("prossium:noteCreated"));
      setClientsAttention(prev => prev.filter(c => c.id !== client.id));
      
      toast({ title: "Cliente revisado", description: `${client.name} ha sido marcado como revisado.` });
    } catch (err) {
      console.error("Error marking client as reviewed:", err);
      toast({ title: "Error", description: "No se pudo actualizar el cliente.", variant: "destructive" });
    }
  };

  const handleStatusChange = async (client: ClientData, newStatus: Status) => {
    try {
      const oldStatus = client.status;
      
      const { error: clientError } = await supabase
        .from("clients")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", client.id);

      if (clientError) throw clientError;

      const statusLabels: Record<Status, string> = { green: "Estable", yellow: "Pendiente", orange: "Atención", red: "Crítico" };
      const statusEmoji = newStatus === "green" ? "🟢" : newStatus === "yellow" ? "🟡" : newStatus === "orange" ? "🟠" : "🔴";
      const noteText = `${statusEmoji} El CEO (Juan) ha cambiado el estado del cliente "${client.name}" de "${statusLabels[oldStatus]}" a "${statusLabels[newStatus]}".`;

      await supabase.from("notes").insert({ text: noteText, visible_to: "team", target_employee: null, created_by: "Juan", status: "pending", client_id: client.id });

      window.dispatchEvent(new CustomEvent("prossium:noteCreated"));

      if (newStatus === "green") {
        setClientsAttention(prev => prev.filter(c => c.id !== client.id));
      } else {
        setClientsAttention(prev => prev.map(c => c.id === client.id ? { ...c, status: newStatus } : c));
      }
      
      toast({ title: "Estado actualizado", description: `${client.name} ahora está en "${statusLabels[newStatus]}".` });
    } catch (err) {
      console.error("Error changing client status:", err);
      toast({ title: "Error", description: "No se pudo cambiar el estado.", variant: "destructive" });
    }
  };

  const clientCount = clientsAttention.length;
  const weekEvents = events.length;

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <HeaderNavigation />

      <div className="flex-1 flex min-h-0">
        {/* LEFT SIDEBAR */}
        <aside className="w-[260px] shrink-0 border-r border-border/50 bg-sidebar-background flex flex-col">
          <div className="p-4 flex-1 overflow-auto">
            <p className="text-[0.65rem] uppercase tracking-[0.15em] text-primary/60 font-semibold mb-4">Contexto activo</p>
            
            <div className="space-y-1.5">
              <button onClick={() => setAgendaOpen(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors text-left">
                <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <FolderOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Proyectos activos</p>
                  <p className="text-xs text-muted-foreground">{sortedClients.length} en seguimiento</p>
                </div>
              </button>

              <button onClick={() => setClientsOpen(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors text-left">
                <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Clientes</p>
                  {clientCount > 0 && (
                    <p className="text-xs text-accent">{clientCount} requieren atención</p>
                  )}
                </div>
              </button>

              <button onClick={() => setCalendarOpen(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors text-left">
                <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Reuniones</p>
                  <p className="text-xs text-muted-foreground">Esta semana: {weekEvents}</p>
                </div>
              </button>

              <button onClick={() => setNotesOpen(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors text-left">
                <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <ClipboardList className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Seguimientos</p>
                  {pendingNotes.length > 0 && (
                    <p className="text-xs text-accent">{pendingNotes.length} pendientes</p>
                  )}
                </div>
              </button>
            </div>

            {/* Historial */}
            <div className="mt-6">
              <p className="text-[0.65rem] uppercase tracking-[0.15em] text-primary/60 font-semibold mb-3">Historial</p>
              <div className="space-y-1">
                {conversationsList.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => switchConversation(conv.id)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary/40 transition-colors cursor-pointer",
                      activeConversationId === conv.id && "bg-secondary/60 border border-primary/20"
                    )}
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{conv.title}</p>
                      <p className="text-[0.6rem] text-muted-foreground/60">{new Date(conv.updated_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</p>
                    </div>
                  </div>
                ))}
                {conversationsList.length === 0 && (
                  <p className="text-xs text-muted-foreground/50 px-3">Sin conversaciones recientes</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border/30">
            <Button onClick={() => setSendNoteOpen(true)} variant="ghost" className="w-full h-10 bg-secondary/60 hover:bg-secondary text-foreground font-medium gap-2 text-sm">
              <Send className="h-3.5 w-3.5" />
              Enviar nota al equipo
            </Button>
          </div>
        </aside>

        {/* CENTER - Chat Area */}
        <main className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="shrink-0 px-6 py-3 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-mint flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground text-sm">Nexus IA</h2>
                <p className="text-xs text-muted-foreground">Especializada en tu agencia · Conectada a tu CRM</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-primary/70 px-2.5 py-1 rounded-full bg-primary/10">
                <CheckCircle className="h-3 w-3" />
                Datos actualizados
              </span>
              <button
                onClick={createNewConversation}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Nueva conversación
              </button>
            </div>
          </div>

          {visibleReminders.length > 0 && (
            <div className="px-6 pt-3 shrink-0">
              <ReminderAlert />
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-hidden">
            <AIChat />
          </div>

          <div className="shrink-0 py-2 text-center border-t border-border/20">
            <span className="text-[0.6rem] text-muted-foreground/40 tracking-wider">Nexus IA · Powered by Prossium</span>
          </div>
        </main>
      </div>

      {/* Clients Dialog */}
      <Dialog open={clientsOpen} onOpenChange={setClientsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto bg-card border-border">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Clientes que requieren atención</h2>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Cargando...</p>
            ) : sortedClients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay clientes que requieran atención</p>
            ) : (
              sortedClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleClientClick(client)}
                  className="flex w-full items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
                >
                  <div className={`h-3 w-3 rounded-full shrink-0 ${
                    client.status === "red" ? "bg-destructive" :
                    client.status === "orange" ? "bg-accent" :
                    client.status === "yellow" ? "bg-accent" : "bg-primary"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{client.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{client.issue}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{client.lastActivity}</span>
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Popups */}
      <AgendaPopup isOpen={agendaOpen} onClose={() => setAgendaOpen(false)} />
      <CalendarView isOpen={calendarOpen} onClose={() => setCalendarOpen(false)} />
      <TeamNotesPopup isOpen={notesOpen} onClose={() => setNotesOpen(false)} />
      <SendNotePopup isOpen={sendNoteOpen} onClose={() => setSendNoteOpen(false)} />

      {selectedClient && (
        <ClientChatModal
          open={!!selectedClient}
          onOpenChange={(open) => !open && setSelectedClient(null)}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          clientStatus={selectedClient.status}
          issue={selectedClient.issue}
        />
      )}
    </div>
  );
}
