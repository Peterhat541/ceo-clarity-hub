import { useState } from "react";
import { Bell, X, User, Building2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCEONoteContext, CEONote } from "@/contexts/CEONoteContext";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function NoteItem({ note, onMarkRead }: { note: CEONote; onMarkRead: () => void }) {
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
              <div className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>{note.clientName}</span>
              </div>
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

export function CEONotificationBell() {
  const { ceoNotes, getUnreadCount, markAsRead, markAllAsRead } = useCEONoteContext();
  const [open, setOpen] = useState(false);
  
  const unreadCount = getUnreadCount();

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
          {ceoNotes.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No hay notas del CEO</p>
            </div>
          ) : (
            ceoNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onMarkRead={() => markAsRead(note.id)}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
