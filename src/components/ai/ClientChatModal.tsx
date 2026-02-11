import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, Trash2, Mic, Square } from "lucide-react";
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
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

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
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedHistory = useRef(false);

  const { isRecording, isSupported, error: recorderError, startRecording, stopRecording } = useAudioRecorder();

  // Show recorder errors
  useEffect(() => {
    if (recorderError) {
      toast({
        title: "Error de micrófono",
        description: recorderError,
        variant: "destructive",
      });
    }
  }, [recorderError]);

  const status = statusConfig[clientStatus];

  // Load conversation history from database when modal opens
  useEffect(() => {
    if (open && clientName && !hasLoadedHistory.current) {
      loadConversationHistory();
    }
    if (!open) {
      hasLoadedHistory.current = false;
    }
  }, [open, clientName]);

  const loadConversationHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("client_conversations")
        .select("*")
        .eq("client_name", clientName)
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) {
        console.error("Error loading conversation history:", error);
        return;
      }

      if (data && data.length > 0) {
        // Convert DB records to messages
        const loadedMessages: Message[] = data.map((record) => ({
          id: record.id,
          role: record.role as "user" | "assistant",
          content: record.content,
          timestamp: new Date(record.created_at),
        }));

        // Build conversation history for AI context
        const history: ConversationMessage[] = data.map((record) => ({
          role: record.role as "user" | "assistant",
          content: record.content,
        }));

        setMessages(loadedMessages);
        setConversationHistory(history);
      } else {
        // No history, show welcome message
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
      
      hasLoadedHistory.current = true;
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveMessageToDb = async (role: "user" | "assistant", content: string) => {
    try {
      await supabase.from("client_conversations").insert({
        client_id: clientId,
        client_name: clientName,
        role,
        content,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const clearConversation = async () => {
    try {
      await supabase
        .from("client_conversations")
        .delete()
        .eq("client_name", clientName);

      // Reset to welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: `**${clientName}** — ${status.label}

${issue ? `**Situación actual:** ${issue}` : ""}

¿Qué quieres saber o hacer con este cliente?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setConversationHistory([]);

      toast({
        title: "Conversación borrada",
        description: `Se ha limpiado el historial de ${clientName}.`,
      });
    } catch (error) {
      console.error("Error clearing conversation:", error);
      toast({
        title: "Error",
        description: "No se pudo borrar la conversación.",
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording and transcribe
      const audioBlob = await stopRecording();
      if (audioBlob && audioBlob.size > 0) {
        setIsTranscribing(true);
        try {
          // Convert blob to base64
          const arrayBuffer = await audioBlob.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
          );

          const { data, error } = await supabase.functions.invoke("transcribe", {
            body: { 
              audio: base64,
              mimeType: audioBlob.type 
            },
          });

          if (error) {
            throw new Error(error.message);
          }

          if (data?.text) {
            setInput(prev => prev ? `${prev} ${data.text}` : data.text);
            toast({
              title: "Transcripción completada",
              description: "Texto añadido al input.",
            });
          } else if (data?.error) {
            throw new Error(data.error);
          }
        } catch (err) {
          console.error("Transcription error:", err);
          toast({
            title: "Error de transcripción",
            description: err instanceof Error ? err.message : "No se pudo transcribir el audio.",
            variant: "destructive",
          });
        } finally {
          setIsTranscribing(false);
        }
      }
    } else {
      // Start recording
      await startRecording();
    }
  };

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

    // Save user message to DB
    saveMessageToDb("user", userInput);

    const newHistory: ConversationMessage[] = [
      ...conversationHistory,
      { role: "user", content: userInput }
    ];

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          message: userInput,
          activeClientId: clientId,
          activeClientName: clientName,
          conversationHistory: newHistory.slice(-10),
          uiSnapshot: {},
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast({ title: "Demasiadas solicitudes", description: "Espera un momento.", variant: "destructive" });
          throw new Error("rate_limit");
        }
        if (resp.status === 402) {
          toast({ title: "Créditos agotados", description: "Contacta con el administrador.", variant: "destructive" });
          throw new Error("payment_required");
        }
        throw new Error("Error al contactar el asistente");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";
      let streamDone = false;
      const assistantId = (Date.now() + 1).toString();
      let executedActions: any[] = [];

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.actions) { executedActions = parsed.actions; continue; }
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const currentContent = assistantSoFar;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last.id === assistantId) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: currentContent } : m);
                }
                return [...prev, { id: assistantId, role: "assistant" as const, content: currentContent, timestamp: new Date() }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const currentContent = assistantSoFar;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last.id === assistantId) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: currentContent } : m);
                }
                return [...prev, { id: assistantId, role: "assistant" as const, content: currentContent, timestamp: new Date() }];
              });
            }
          } catch { /* ignore */ }
        }
      }

      if (!assistantSoFar) {
        assistantSoFar = "No pude obtener información. Inténtalo de nuevo.";
        setMessages(prev => [...prev, { id: assistantId, role: "assistant" as const, content: assistantSoFar, timestamp: new Date() }]);
      }

      // Save assistant message to DB
      saveMessageToDb("assistant", assistantSoFar);

      setConversationHistory([
        ...newHistory,
        { role: "assistant" as const, content: assistantSoFar }
      ].slice(-20));

      // Trigger events if actions were created
      if (executedActions.some((a: any) => a.tool === "create_event" && a.result?.success)) {
        window.dispatchEvent(new CustomEvent("processia:eventCreated"));
      }
      if (executedActions.some((a: any) => a.tool === "create_note" && a.result?.success)) {
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

  const isMicDisabled = isLoading || isTranscribing || !isSupported || isLoadingHistory;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0 bg-card border-border">
        {/* Header */}
        <DialogHeader className="p-4 pr-12 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-teal flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className={cn(
              "w-3 h-3 rounded-full shrink-0",
              status.color
            )} />
            <DialogTitle className="flex-1 text-left">
              <span className="font-semibold text-foreground">{clientName}</span>
              <span className={cn("ml-2 text-sm font-normal", status.textColor)}>
                {status.label}
              </span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearConversation}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Limpiar conversación"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Cargando historial...</span>
              </div>
            ) : (
              <>
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
              </>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border shrink-0">
          {/* Recording indicator */}
          {isRecording && (
            <div className="mb-2 flex items-center gap-2 text-destructive animate-pulse">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-sm font-medium">Escuchando... (pulsa para detener)</span>
            </div>
          )}
          {isTranscribing && (
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Transcribiendo...</span>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={`Pregunta sobre ${clientName}...`}
              disabled={isLoading || isLoadingHistory || isRecording}
              className="flex-1 bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
            />
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              className={cn(
                "h-12 w-12 rounded-xl transition-all",
                isRecording && "animate-pulse"
              )}
              onClick={handleMicClick}
              disabled={isMicDisabled}
              title={!isSupported ? "Tu navegador no soporta grabación de audio" : isRecording ? "Detener grabación" : "Iniciar grabación de voz"}
            >
              {isTranscribing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isRecording ? (
                <Square className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isLoadingHistory}
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
