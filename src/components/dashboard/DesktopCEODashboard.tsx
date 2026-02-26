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
  MessageSquare, 
  Sparkles,
  Send,
  CalendarDays
} from "lucide-react";
import { useEventContext } from "@/contexts/EventContext";
import { useNoteContext } from "@/contexts/NoteContext";
import { useReminderContext } from "@/contexts/ReminderContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Status } from "./StatusBadge";

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
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [clientsAttention, setClientsAttention] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);

  const { events } = useEventContext();
  const { getTodayCEONotes } = useNoteContext();
  const { activeReminders } = useReminderContext();

  const pendingNotes = getTodayCEONotes().filter(n => n.status === "pending");
  const visibleReminders = activeReminders.filter((r) => !r.dismissed);

  // Fetch clients that need attention (red, orange, yellow status)
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
          // Filter out clients without any project data
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

  // Sort by criticality
  const statusPriority = { red: 0, orange: 1, yellow: 2, green: 3 };
  const sortedClients = [...clientsAttention].sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

  const handleClientClick = (client: ClientData) => {
    setSelectedClient(client);
  };

  const handleMarkReviewed = async (client: ClientData) => {
    try {
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")} – Revisado por CEO`;
      
      // Update client last_contact
      const { error: clientError } = await supabase
        .from("clients")
        .update({ 
          last_contact: formattedDate,
          status: "green" as const,
          updated_at: now.toISOString()
        })
        .eq("id", client.id);

      if (clientError) throw clientError;

      // Create note for the team about CEO review
      const noteText = client.issue 
        ? `✅ El CEO (Juan) ha revisado el cliente "${client.name}". Incidencia/tarea: "${client.issue}". Marcado como revisado.`
        : `✅ El CEO (Juan) ha revisado el cliente "${client.name}" y lo ha marcado como atendido.`;

      const { error: noteError } = await supabase
        .from("notes")
        .insert({
          text: noteText,
          visible_to: "team",
          target_employee: null,
          created_by: "Juan",
          status: "pending",
          client_id: client.id
        });

      if (noteError) {
        console.error("Error creating note:", noteError);
      }

      // Emit event for notification bell refresh
      window.dispatchEvent(new CustomEvent("prossium:noteCreated"));

      // Remove from attention list
      setClientsAttention(prev => prev.filter(c => c.id !== client.id));
      
      toast({
        title: "Cliente revisado",
        description: `${client.name} ha sido marcado como revisado. El equipo ha sido notificado.`,
      });
    } catch (err) {
      console.error("Error marking client as reviewed:", err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (client: ClientData, newStatus: Status) => {
    try {
      const oldStatus = client.status;
      
      const { error: clientError } = await supabase
        .from("clients")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", client.id);

      if (clientError) throw clientError;

      const statusLabels: Record<Status, string> = {
        green: "Estable",
        yellow: "Pendiente",
        orange: "Atención",
        red: "Crítico",
      };

      // Create note for the team about status change
      const statusEmoji = newStatus === "green" ? "🟢" : newStatus === "yellow" ? "🟡" : newStatus === "orange" ? "🟠" : "🔴";
      const noteText = `${statusEmoji} El CEO (Juan) ha cambiado el estado del cliente "${client.name}" de "${statusLabels[oldStatus]}" a "${statusLabels[newStatus]}".${client.issue ? ` Motivo original: "${client.issue}".` : ""}`;

      const { error: noteError } = await supabase
        .from("notes")
        .insert({
          text: noteText,
          visible_to: "team",
          target_employee: null,
          created_by: "Juan",
          status: "pending",
          client_id: client.id
        });

      if (noteError) {
        console.error("Error creating note:", noteError);
      }

      // Emit event for notification bell refresh
      window.dispatchEvent(new CustomEvent("prossium:noteCreated"));

      // Update local state
      if (newStatus === "green") {
        setClientsAttention(prev => prev.filter(c => c.id !== client.id));
      } else {
        setClientsAttention(prev => prev.map(c => 
          c.id === client.id ? { ...c, status: newStatus } : c
        ));
      }
      
      toast({
        title: "Estado actualizado",
        description: `${client.name} ahora está en estado "${statusLabels[newStatus]}". El equipo ha sido notificado.`,
      });
    } catch (err) {
      console.error("Error changing client status:", err);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del cliente.",
        variant: "destructive",
      });
    }
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
    <div className="h-screen w-screen flex flex-col bg-background bg-grid overflow-hidden">
      {/* Header with Navigation */}
      <HeaderNavigation />

      {/* Main Content - Two Giant Cards */}
      <main className="flex-1 flex gap-6 p-6 min-h-0">
        {/* Left Card: Clients + Reminders */}
        <div className="flex-1 glass-card card-giant flex flex-col overflow-hidden animate-fade-up">
          {/* Active Reminders Section - Only shows when there are reminders */}
          {visibleReminders.length > 0 && (
            <div className="mb-4 shrink-0">
              <ReminderAlert />
            </div>
          )}
          
          <h2 className="text-lg font-semibold text-foreground mb-4 shrink-0">
            Seguimientos activos
          </h2>
          
          {/* Client List - Scrollable */}
          <div className="flex-1 overflow-auto space-y-3 min-h-0 pr-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando clientes...
              </div>
            ) : sortedClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No hay clientes que requieran atención</p>
                <p className="text-xs mt-1">¡Excelente trabajo!</p>
              </div>
            ) : (
              sortedClients.map((client, index) => (
                <div 
                  key={client.id}
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
                    onMarkReviewed={() => handleMarkReviewed(client)}
                    onStatusChange={(newStatus) => handleStatusChange(client, newStatus)}
                  />
                </div>
              ))
            )}
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
                <span className="font-medium">{events.length} eventos</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCalendarOpen(true)}
                className="h-12 w-12 bg-primary/10 hover:bg-primary/20 text-primary"
                title="Ver calendario"
              >
                <CalendarDays className="h-5 w-5" />
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
                <h2 className="font-semibold text-foreground">Tu IA empresarial</h2>
                <p className="text-sm text-muted-foreground">Conectada a tus datos y herramientas</p>
              </div>
            </div>
          </div>
          
          {/* AI Chat Content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <AIChat />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 py-2 text-center">
        <span className="text-[0.65rem] text-muted-foreground/40 tracking-wider">Infrastructure by Prossium</span>
      </footer>

      {/* Popups */}
      <AgendaPopup isOpen={agendaOpen} onClose={() => setAgendaOpen(false)} />
      <CalendarView isOpen={calendarOpen} onClose={() => setCalendarOpen(false)} />
      <TeamNotesPopup isOpen={notesOpen} onClose={() => setNotesOpen(false)} />
      <SendNotePopup isOpen={sendNoteOpen} onClose={() => setSendNoteOpen(false)} />

      {/* Client Chat Modal */}
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
