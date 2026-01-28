import { createContext, useContext, useState, ReactNode } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  clientContext?: string;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface ActiveClient {
  id: string | null;
  name: string | null;
}

interface AIChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  conversationHistory: ConversationMessage[];
  setConversationHistory: React.Dispatch<React.SetStateAction<ConversationMessage[]>>;
  activeClient: ActiveClient;
  setActiveClient: React.Dispatch<React.SetStateAction<ActiveClient>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

const initialMessage: Message = {
  id: "1",
  role: "assistant",
  content: "Hola, soy tu asistente ejecutivo. Puedo ayudarte a gestionar tu agenda, crear recordatorios, enviar notas al equipo y mantenerte al día con tus clientes. ¿Qué necesitas?",
  timestamp: new Date(),
};

export function AIChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [activeClient, setActiveClient] = useState<ActiveClient>({ id: null, name: null });
  const [input, setInput] = useState("");

  return (
    <AIChatContext.Provider
      value={{
        messages,
        setMessages,
        conversationHistory,
        setConversationHistory,
        activeClient,
        setActiveClient,
        input,
        setInput,
      }}
    >
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChatContext() {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error("useAIChatContext must be used within an AIChatProvider");
  }
  return context;
}
