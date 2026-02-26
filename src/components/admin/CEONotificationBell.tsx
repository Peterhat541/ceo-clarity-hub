import { useState, useEffect } from "react";
import { Bell, User, Building2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DBNote {
  id: string;
  text: string;
  target_employee: string | null;
  client_id: string | null;
  visible_to: string;
  status: string;
  created_at: string;
  created_by: string;
  clients?: { name: string } | null;
}

interface NoteDisplay {
  id: string;
  content: string;
  targetEmployee: string | null;
  clientName: string | null;
  clientId: string | null;
  createdAt: Date;
  read: boolean;
}

function NoteItem({ note, onMarkRead, onOpenClientChat }: { note: NoteDisplay; onMarkRead: () => void; onOpenClientChat?: (clientId: string, clientName: string) => void }) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-colors cursor-pointer",
        note.read
          ? "bg-secondary/30 border-border/50"
          : "bg-primary/10 border-primary/30 hover:bg-primary/20"
      )}
      onClick={onMarkRead}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          note.read ? "bg-secondary" : "bg-primary/20"
        )}>
          <User className={cn(
            "w-4 h-4",
            note.read ? "text-muted-foreground" : "text-primary"
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          {note.targetEmployee && (
            <p className="text-xs font-semibold text-primary mb-1">
              Para: {note.targetEmployee}
            </p>
          )}
          <p className={cn(
            "text-sm leading-relaxed",
            note.read ? "text-muted-foreground" : "text-foreground"
          )}>
            {note.content}
          </p>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {note.clientName && (
              <button 
                className="flex items-center gap-1 hover:text-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (note.clientId && onOpenClientChat) onOpenClientChat(note.clientId, note.clientName!);
                }}
              >
                <Building2 className="w-3 h-3" />
                <span className="underline">{note.clientName}</span>
              </button>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {new Date(note.createdAt).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
        
        {!note.read && (
          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
        )}
      </div>
    </div>
  );
}

interface CEONotificationBellProps {
  onOpenClientChat?: (clientId: string, clientName: string) => void;
  selectedEmployee?: string;
}

export function CEONotificationBell({ onOpenClientChat, selectedEmployee }: CEONotificationBellProps) {
  const [notes, setNotes] = useState<NoteDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  const fetchNotes = async () => {
    try {
      // Get notes visible to team (sent by CEO to employees)
      let query = supabase
        .from("notes")
        .select("*, clients(name)")
        .eq("visible_to", "team")
        .order("created_at", { ascending: false })
        .limit(20);

      // Filter by selected employee if one is chosen
      if (selectedEmployee && selectedEmployee !== "all") {
        query = query.eq("target_employee", selectedEmployee);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching notes:", error);
        return;
      }

      const formattedNotes: NoteDisplay[] = (data as DBNote[]).map(note => ({
        id: note.id,
        content: note.text,
        targetEmployee: note.target_employee,
        clientName: note.clients?.name || null,
        clientId: note.client_id,
        createdAt: new Date(note.created_at),
        read: note.status === "seen" || note.status === "done"
      }));

      // Sort: targeted notes first, then general
      formattedNotes.sort((a, b) => {
        if (a.targetEmployee && !b.targetEmployee) return -1;
        if (!a.targetEmployee && b.targetEmployee) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      setNotes(formattedNotes);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();

    // Listen for new notes
    const handleNoteCreated = () => {
      fetchNotes();
    };
    window.addEventListener("prossium:noteCreated", handleNoteCreated);
    
    return () => {
      window.removeEventListener("prossium:noteCreated", handleNoteCreated);
    };
  }, [selectedEmployee]);

  const markAsRead = async (noteId: string) => {
    try {
      await supabase
        .from("notes")
        .update({ status: "seen" })
        .eq("id", noteId);
      
      setNotes(prev => 
        prev.map(note => 
          note.id === noteId ? { ...note, read: true } : note
        )
      );
    } catch (error) {
      console.error("Error marking note as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notes.filter(n => !n.read).map(n => n.id);
      
      await supabase
        .from("notes")
        .update({ status: "seen" })
        .in("id", unreadIds);
      
      setNotes(prev => prev.map(note => ({ ...note, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const unreadCount = notes.filter(n => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-status-red text-white text-xs font-bold flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0 bg-card border-border" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground">Notas del CEO</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 
                ? `${unreadCount} sin leer`
                : "Todas leídas"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Marcar todo como leído
            </Button>
          )}
        </div>
        
        {/* Notes list */}
        <div className="max-h-[400px] overflow-y-auto p-2 space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Cargando...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No hay notas del CEO</p>
            </div>
          ) : (
            notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onMarkRead={() => markAsRead(note.id)}
                onOpenClientChat={onOpenClientChat}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
