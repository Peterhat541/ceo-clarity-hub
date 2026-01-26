import { createContext, useContext, useState, ReactNode } from "react";

export type NoteVisibility = "team" | "ceo" | "both";
export type NoteStatus = "pending" | "seen" | "resolved";

export interface TeamNote {
  id: string;
  title: string;
  content: string;
  clientName?: string;
  author: string;
  visibility: NoteVisibility;
  targetDate: Date;
  status: NoteStatus;
  createdAt: Date;
}

interface NoteContextType {
  notes: TeamNote[];
  addNote: (note: Omit<TeamNote, "id" | "createdAt">) => TeamNote;
  getCEONotes: () => TeamNote[];
  getTodayCEONotes: () => TeamNote[];
  updateNoteStatus: (id: string, status: NoteStatus) => void;
  getClientNotes: (clientName: string) => TeamNote[];
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<TeamNote[]>([
    // Sample notes for demo
    {
      id: "note-1",
      title: "Llamar a cliente antes de la reunión",
      content: "Nexus Tech quiere confirmar agenda antes del viernes. Importante mencionar el tema de facturación.",
      clientName: "Nexus Tech",
      author: "María López",
      visibility: "ceo",
      targetDate: new Date(),
      status: "pending",
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: "note-2",
      title: "Propuesta enviada a Global Media",
      content: "Se envió la propuesta del nuevo alcance. Esperan respuesta en 48h.",
      clientName: "Global Media",
      author: "Carlos Ruiz",
      visibility: "both",
      targetDate: new Date(),
      status: "pending",
      createdAt: new Date(Date.now() - 7200000),
    },
    {
      id: "note-3",
      title: "Entrega Startup Lab confirmada",
      content: "El equipo de desarrollo confirma que la fase 2 estará lista a tiempo.",
      clientName: "Startup Lab",
      author: "Ana García",
      visibility: "ceo",
      targetDate: new Date(),
      status: "seen",
      createdAt: new Date(Date.now() - 10800000),
    },
  ]);

  const addNote = (noteData: Omit<TeamNote, "id" | "createdAt">): TeamNote => {
    const newNote: TeamNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: new Date(),
    };
    setNotes((prev) => [...prev, newNote]);
    return newNote;
  };

  const getCEONotes = () => {
    return notes.filter((note) => note.visibility === "ceo" || note.visibility === "both");
  };

  const getTodayCEONotes = () => {
    const today = new Date();
    return getCEONotes().filter((note) => {
      const noteDate = new Date(note.targetDate);
      return (
        noteDate.getDate() === today.getDate() &&
        noteDate.getMonth() === today.getMonth() &&
        noteDate.getFullYear() === today.getFullYear()
      );
    });
  };

  const updateNoteStatus = (id: string, status: NoteStatus) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, status } : note))
    );
  };

  const getClientNotes = (clientName: string) => {
    return notes.filter(
      (note) => note.clientName?.toLowerCase() === clientName.toLowerCase()
    );
  };

  return (
    <NoteContext.Provider
      value={{ notes, addNote, getCEONotes, getTodayCEONotes, updateNoteStatus, getClientNotes }}
    >
      {children}
    </NoteContext.Provider>
  );
}

export function useNoteContext() {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error("useNoteContext must be used within a NoteProvider");
  }
  return context;
}
