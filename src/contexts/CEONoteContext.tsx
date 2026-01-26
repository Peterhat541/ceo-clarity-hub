import { createContext, useContext, useState, ReactNode } from "react";

export interface CEONote {
  id: string;
  content: string;
  targetEmployee?: string;
  clientName?: string;
  createdAt: Date;
  read: boolean;
}

interface CEONoteContextType {
  ceoNotes: CEONote[];
  addCEONote: (note: Omit<CEONote, "id" | "createdAt" | "read">) => CEONote;
  getUnreadCount: () => number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const CEONoteContext = createContext<CEONoteContextType | undefined>(undefined);

export function CEONoteProvider({ children }: { children: ReactNode }) {
  const [ceoNotes, setCeoNotes] = useState<CEONote[]>([]);

  const addCEONote = (noteData: Omit<CEONote, "id" | "createdAt" | "read">): CEONote => {
    const newNote: CEONote = {
      ...noteData,
      id: `ceo-note-${Date.now()}`,
      createdAt: new Date(),
      read: false,
    };
    setCeoNotes((prev) => [newNote, ...prev]);
    return newNote;
  };

  const getUnreadCount = () => {
    return ceoNotes.filter((note) => !note.read).length;
  };

  const markAsRead = (id: string) => {
    setCeoNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, read: true } : note))
    );
  };

  const markAllAsRead = () => {
    setCeoNotes((prev) => prev.map((note) => ({ ...note, read: true })));
  };

  return (
    <CEONoteContext.Provider
      value={{ ceoNotes, addCEONote, getUnreadCount, markAsRead, markAllAsRead }}
    >
      {children}
    </CEONoteContext.Provider>
  );
}

export function useCEONoteContext() {
  const context = useContext(CEONoteContext);
  if (context === undefined) {
    throw new Error("useCEONoteContext must be used within a CEONoteProvider");
  }
  return context;
}
