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

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
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
  activeConversationId: string | null;
  conversationsList: Conversation[];
  createNewConversation: () => Promise<void>;
  switchConversation: (id: string) => Promise<void>;
  ensureConversation: (firstMessage?: string) => Promise<string>;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export function AIChatProvider({ children }: { children: ReactNode }) {
  const { activeUser } = useUserContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [activeClient, setActiveClient] = useState<ActiveClient>({ id: null, name: null });
  const [input, setInput] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversationsList, setConversationsList] = useState<Conversation[]>([]);

  // Load conversations list when user changes
  useEffect(() => {
    if (!activeUser) {
      setMessages([]);
      setConversationHistory([]);
      setConversationsList([]);
      setActiveConversationId(null);
      return;
    }

    const loadConversations = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("id, title, updated_at")
        .eq("user_id", activeUser.id)
        .order("updated_at", { ascending: false });

      if (data && data.length > 0) {
        setConversationsList(data);
        // Auto-select most recent conversation
        await loadConversationMessages(data[0].id);
        setActiveConversationId(data[0].id);
      } else {
        setConversationsList([]);
        setActiveConversationId(null);
        showWelcomeMessage();
      }
    };

    loadConversations();
  }, [activeUser?.id]);

  const showWelcomeMessage = () => {
    const welcomeMsg: Message = {
      id: "welcome",
      role: "assistant",
      content: `Hola ${activeUser?.name || ""}. Soy tu IA empresarial.\nEstoy conectada a tus datos y herramientas.\nPregúntame lo que necesites saber.`,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
    setConversationHistory([]);
  };

  const loadConversationMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from("user_chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
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
      showWelcomeMessage();
    }
  };

  const refreshConversationsList = async () => {
    if (!activeUser) return;
    const { data } = await supabase
      .from("conversations")
      .select("id, title, updated_at")
      .eq("user_id", activeUser.id)
      .order("updated_at", { ascending: false });
    if (data) setConversationsList(data);
  };

  const createNewConversation = useCallback(async () => {
    if (!activeUser) return;
    setActiveConversationId(null);
    showWelcomeMessage();
    setConversationHistory([]);
  }, [activeUser]);

  const switchConversation = useCallback(async (id: string) => {
    if (id === activeConversationId) return;
    setActiveConversationId(id);
    await loadConversationMessages(id);
  }, [activeConversationId]);

  // Ensure a conversation exists (create if needed), returns conversation id
  const ensureConversation = useCallback(async (firstMessage?: string): Promise<string> => {
    if (activeConversationId) return activeConversationId;
    if (!activeUser) throw new Error("No active user");

    const title = firstMessage ? firstMessage.slice(0, 40) + (firstMessage.length > 40 ? "..." : "") : "Nueva conversación";
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: activeUser.id, title })
      .select("id")
      .single();

    if (error || !data) throw new Error("Failed to create conversation");
    setActiveConversationId(data.id);
    await refreshConversationsList();
    return data.id;
  }, [activeConversationId, activeUser]);

  const saveMessage = useCallback(async (role: string, content: string, clientContext?: string) => {
    if (!activeUser) return;
    // ensureConversation should have been called before this
    const convId = activeConversationId;
    if (!convId) return;

    await supabase.from("user_chat_messages").insert({
      user_id: activeUser.id,
      role,
      content,
      client_context: clientContext || null,
      conversation_id: convId,
    } as any);

    // Update conversation's updated_at
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() } as any).eq("id", convId);
    await refreshConversationsList();
  }, [activeUser, activeConversationId]);

  return (
    <AIChatContext.Provider
      value={{
        messages, setMessages,
        conversationHistory, setConversationHistory,
        activeClient, setActiveClient,
        input, setInput,
        saveMessage,
        activeConversationId,
        conversationsList,
        createNewConversation,
        switchConversation,
        ensureConversation,
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
