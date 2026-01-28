import { useState } from "react";
import { X, MessageSquare, User, Building2, Check, Eye, Clock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNoteContext, TeamNote, NoteStatus } from "@/contexts/NoteContext";
import { CreateReminderFromNoteModal } from "./CreateReminderFromNoteModal";
import { cn } from "@/lib/utils";

interface TeamNotesPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig: Record<NoteStatus, { label: string; icon: typeof Check; color: string; bgColor: string }> = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
  },
  seen: {
    label: "Visto",
    icon: Eye,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  resolved: {
    label: "Resuelto",
    icon: Check,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
};

interface NoteItemProps {
  note: TeamNote;
  onStatusChange: (status: NoteStatus) => void;
  onCreateReminder: (note: TeamNote) => void;
}

function NoteItem({ note, onStatusChange, onCreateReminder }: NoteItemProps) {
  const config = statusConfig[note.status];
  const StatusIcon = config.icon;

  const handleStatusClick = () => {
    const statusOrder: NoteStatus[] = ["pending", "seen", "resolved"];
    const currentIndex = statusOrder.indexOf(note.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onStatusChange(nextStatus);
  };

  return (
    <div className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors border border-border/50">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-sm font-medium text-foreground flex-1">{note.title}</h4>
        <button
          onClick={handleStatusClick}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors",
            config.bgColor,
            config.color,
            "hover:opacity-80"
          )}
        >
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </button>
      </div>
      
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{note.content}</p>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {note.clientName && (
          <div className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            <span>{note.clientName}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span>{note.author}</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Clock className="w-3 h-3" />
          <span>
            {new Date(note.createdAt).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCreateReminder(note)}
          className="h-7 px-2 text-xs gap-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
        >
          <Bell className="w-3 h-3" />
          Crear recordatorio
        </Button>
      </div>
    </div>
  );
}

export function TeamNotesPopup({ isOpen, onClose }: TeamNotesPopupProps) {
  const { getTodayCEONotes, updateNoteStatus } = useNoteContext();
  const [reminderNote, setReminderNote] = useState<TeamNote | null>(null);
  const todayNotes = getTodayCEONotes();

  if (!isOpen) return null;

  const pendingNotes = todayNotes.filter((n) => n.status === "pending");
  const seenNotes = todayNotes.filter((n) => n.status === "seen");
  const resolvedNotes = todayNotes.filter((n) => n.status === "resolved");

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

        {/* Popup */}
        <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Notas del equipo</h2>
                <p className="text-xs text-muted-foreground">
                  {todayNotes.length} nota{todayNotes.length !== 1 ? "s" : ""} para hoy
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
            {todayNotes.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No hay notas para hoy</p>
                <p className="text-xs text-muted-foreground mt-1">
                  El equipo puede dejarte notas desde Administración
                </p>
              </div>
            ) : (
              <>
                {/* Pending Notes */}
                {pendingNotes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Pendientes ({pendingNotes.length})
                    </h3>
                    <div className="space-y-2">
                      {pendingNotes.map((note) => (
                        <NoteItem
                          key={note.id}
                          note={note}
                          onStatusChange={(status) => updateNoteStatus(note.id, status)}
                          onCreateReminder={setReminderNote}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Seen Notes */}
                {seenNotes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      Vistos ({seenNotes.length})
                    </h3>
                    <div className="space-y-2">
                      {seenNotes.map((note) => (
                        <NoteItem
                          key={note.id}
                          note={note}
                          onStatusChange={(status) => updateNoteStatus(note.id, status)}
                          onCreateReminder={setReminderNote}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolved Notes */}
                {resolvedNotes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      Resueltos ({resolvedNotes.length})
                    </h3>
                    <div className="space-y-2">
                      {resolvedNotes.map((note) => (
                        <NoteItem
                          key={note.id}
                          note={note}
                          onStatusChange={(status) => updateNoteStatus(note.id, status)}
                          onCreateReminder={setReminderNote}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Reminder Modal */}
      {reminderNote && (
        <CreateReminderFromNoteModal
          open={!!reminderNote}
          onOpenChange={(open) => !open && setReminderNote(null)}
          noteTitle={reminderNote.title}
          noteContent={reminderNote.content}
          clientName={reminderNote.clientName}
        />
      )}
    </>
  );
}
