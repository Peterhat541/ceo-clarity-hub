import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserContext } from "@/contexts/UserContext";

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
  saveMessage: (role: string, content: string, clientContext?: string) => Promise<void>;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export function AIChatProvider({ children }: { children: ReactNode }) {
  const { activeUser } = useUserContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [activeClient, setActiveClient] = useState<ActiveClient>({ id: null, name: null });
  const [input, setInput] = useState("");

  // Load messages when user changes
  useEffect(() => {
    if (!activeUser) {
      setMessages([]);
      setConversationHistory([]);
      return;
    }

    const loadMessages = async () => {
      const { data } = await supabase
        .from("user_chat_messages")
        .select("*")
        .eq("user_id", activeUser.id)
        .order("created_at", { ascending: true })
        .limit(50);

      if (data && data.length > 0) {
        setMessages(data.map((m: any) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.created_at),
          clientContext: m.client_context || undefined,
        })));
        setConversationHistory(
          data.slice(-20).map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content }))
        );
      } else {
        // Show welcome message for this user
        const welcomeMsg: Message = {
          id: "welcome",
          role: "assistant",
          content: `Hola ${activeUser.name}. Soy tu IA empresarial.\nEstoy conectada a tus datos y herramientas.\nPregúntame lo que necesites saber.`,
          timestamp: new Date(),
        };
        setMessages([welcomeMsg]);
        setConversationHistory([]);
      }
    };

    loadMessages();
  }, [activeUser?.id]);

  const saveMessage = useCallback(async (role: string, content: string, clientContext?: string) => {
    if (!activeUser) return;
    await supabase.from("user_chat_messages").insert({
      user_id: activeUser.id,
      role,
      content,
      client_context: clientContext || null,
    });
  }, [activeUser]);

  return (
    <AIChatContext.Provider
      value={{
        messages, setMessages,
        conversationHistory, setConversationHistory,
        activeClient, setActiveClient,
        input, setInput,
        saveMessage,
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
