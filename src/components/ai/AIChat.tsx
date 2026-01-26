import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useClientContext } from "@/contexts/ClientContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

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

const suggestedQuestions = [
  "¿Qué tengo que hacer hoy?",
  "Dame la agenda del día",
  "¿Qué clientes necesitan atención?",
];

export function AIChat() {
  const { selectedClient, pendingContext, clearPendingContext } = useClientContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hola, soy tu asistente ejecutivo. Puedo ayudarte a gestionar tu agenda, crear recordatorios, enviar notas al equipo y mantenerte al día con tus clientes. ¿Qué necesitas?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeClient, setActiveClient] = useState<{ id: string | null; name: string | null }>({ id: null, name: null });
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle context activation from client cards
  useEffect(() => {
    if (pendingContext) {
      const { clientName, issue } = pendingContext;
      
      // Fetch client ID from database
      const fetchClientId = async () => {
        const { data } = await supabase
          .from("clients")
          .select("id, name, status, contact_name, phone, email")
          .ilike("name", `%${clientName}%`)
          .limit(1)
          .maybeSingle();
        
        if (data) {
          setActiveClient({ id: data.id, name: data.name });
          
          const statusEmoji = data.status === "red" ? "🔴" : data.status === "orange" ? "🟠" : data.status === "yellow" ? "🟡" : "🟢";
          const statusText = data.status === "red" ? "crítico" : data.status === "orange" ? "atención" : data.status === "yellow" ? "pendiente" : "estable";
          
          const contextMessage: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: `**${data.name}** ${statusEmoji} Estado: ${statusText}

${issue ? `**Situación:** ${issue}` : ""}

📞 **Contacto:** ${data.contact_name || "No especificado"} — ${data.phone || "Sin teléfono"}
✉️ **Email:** ${data.email || "Sin email"}

¿Qué quieres hacer con este cliente?`,
            timestamp: new Date(),
            clientContext: data.name,
          };
          setMessages(prev => [...prev, contextMessage]);
        }
      };
      
      fetchClientId();
      clearPendingContext();
    }
  }, [pendingContext, clearPendingContext]);

  // Sync with external client selection
  useEffect(() => {
    if (selectedClient && selectedClient !== activeClient.name && !pendingContext) {
      const fetchClientData = async () => {
        const { data } = await supabase
          .from("clients")
          .select("id, name, status, contact_name, phone")
          .ilike("name", `%${selectedClient}%`)
          .limit(1)
          .maybeSingle();
        
        if (data) {
          setActiveClient({ id: data.id, name: data.name });
          
          const statusEmoji = data.status === "red" ? "🔴" : data.status === "orange" ? "🟠" : data.status === "yellow" ? "🟡" : "🟢";
          
          const autoMessage: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: `**${data.name}** seleccionado. ${statusEmoji}

📞 ${data.contact_name || "Contacto"}: ${data.phone || "Sin teléfono"}

¿Qué quieres saber o hacer?`,
            timestamp: new Date(),
            clientContext: data.name,
          };
          setMessages(prev => [...prev, autoMessage]);
        }
      };
      
      fetchClientData();
    }
  }, [selectedClient, pendingContext, activeClient.name]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsLoading(true);

    // Add to conversation history
    const newHistory: ConversationMessage[] = [
      ...conversationHistory,
      { role: "user", content: userInput }
    ];

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: userInput,
          activeClientId: activeClient.id,
          activeClientName: activeClient.name,
          conversationHistory: newHistory.slice(-10) // Send last 10 messages
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Error al contactar el asistente");
      }

      if (data.error) {
        if (data.error === "rate_limit") {
          toast({
            title: "Demasiadas solicitudes",
            description: "Espera un momento antes de enviar otro mensaje.",
            variant: "destructive"
          });
        } else if (data.error === "payment_required") {
          toast({
            title: "Créditos agotados",
            description: "Contacta con el administrador para agregar créditos.",
            variant: "destructive"
          });
        }
        throw new Error(data.message || "Error del asistente");
      }

      const assistantContent = data.message || "No tengo respuesta.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
        clientContext: activeClient.name || undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Update conversation history
      setConversationHistory([
        ...newHistory,
        { role: "assistant" as const, content: assistantContent }
      ].slice(-20)); // Keep last 20 messages

      // Check if any events were created and refresh UI
      if (data.actions?.some((a: any) => a.tool === "create_event" && a.result?.success)) {
        // Trigger a custom event to refresh agenda
        window.dispatchEvent(new CustomEvent("processia:eventCreated"));
      }
      
      // Check if notes were created
      if (data.actions?.some((a: any) => a.tool === "create_note" && a.result?.success)) {
        // Trigger a custom event to refresh notes
        window.dispatchEvent(new CustomEvent("processia:noteCreated"));
      }

    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (question: string) => {
    setInput(question);
  };

  const clearContext = () => {
    setActiveClient({ id: null, name: null });
    toast({
      title: "Contexto limpiado",
      description: "Ya no hay cliente activo.",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-teal flex items-center justify-center glow">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">Asistente IA</h2>
            <p className="text-xs text-muted-foreground">
              {activeClient.name 
                ? `Contexto: ${activeClient.name}`
                : "Tu mano derecha ejecutiva"
              }
            </p>
          </div>
          {activeClient.name && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearContext}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "animate-fade-in",
              message.role === "user" ? "flex justify-end" : ""
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="animate-fade-in">
            <div className="bg-secondary rounded-2xl px-4 py-3 inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Pensando...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                onClick={() => handleSuggestion(question)}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={activeClient.name 
              ? `Pregunta sobre ${activeClient.name}...` 
              : "Pregunta sobre cualquier cliente..."
            }
            disabled={isLoading}
            className="flex-1 bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-xl"
            title="Entrada de voz (próximamente)"
            disabled={isLoading}
          >
            <Mic className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
