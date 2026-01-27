import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClientChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
  clientName: string;
  clientStatus: "red" | "orange" | "yellow" | "green";
  issue?: string;
}

const statusConfig = {
  red: { label: "Crítico", color: "bg-status-red", textColor: "text-status-red" },
  orange: { label: "Atención", color: "bg-status-orange", textColor: "text-status-orange" },
  yellow: { label: "Pendiente", color: "bg-status-yellow", textColor: "text-status-yellow" },
  green: { label: "Estable", color: "bg-status-green", textColor: "text-status-green" },
};

export function ClientChatModal({
  open,
  onOpenChange,
  clientId,
  clientName,
  clientStatus,
  issue,
}: ClientChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const status = statusConfig[clientStatus];

  // Initialize chat with welcome message when modal opens
  useEffect(() => {
    if (open && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: `**${clientName}** — ${status.label}

${issue ? `**Situación actual:** ${issue}` : ""}

¿Qué quieres saber o hacer con este cliente?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [open, clientName, issue, status.label, messages.length]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      // Keep messages for session, but could reset here if preferred
    }
  }, [open]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    const newHistory: ConversationMessage[] = [
      ...conversationHistory,
      { role: "user", content: userInput }
    ];

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: userInput,
          activeClientId: clientId,
          activeClientName: clientName,
          conversationHistory: newHistory.slice(-10),
          uiSnapshot: {} // Modal doesn't need full UI snapshot
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
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      setConversationHistory([
        ...newHistory,
        { role: "assistant" as const, content: assistantContent }
      ].slice(-20));

      // Trigger events if actions were created
      if (data.actions?.some((a: any) => a.tool === "create_event" && a.result?.success)) {
        window.dispatchEvent(new CustomEvent("processia:eventCreated"));
      }
      
      if (data.actions?.some((a: any) => a.tool === "create_note" && a.result?.success)) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0 bg-card border-border">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full",
              status.color
            )} />
            <DialogTitle className="flex-1 text-left">
              <span className="font-semibold text-foreground">{clientName}</span>
              <span className={cn("ml-2 text-sm font-normal", status.textColor)}>
                {status.label}
              </span>
            </DialogTitle>
            <div className="w-8 h-8 rounded-lg bg-gradient-teal flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
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
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={`Pregunta sobre ${clientName}...`}
              disabled={isLoading}
              className="flex-1 bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
            />
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
      </DialogContent>
    </Dialog>
  );
}
