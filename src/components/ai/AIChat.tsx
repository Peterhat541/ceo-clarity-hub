import { useState, useRef, useEffect } from "react";
import { Send, Mic, Loader2, Square, Users, FolderOpen, CalendarDays, TrendingUp } from "lucide-react";
import AIBrainSphere from "@/components/ai/AIBrainSphere";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useClientContext } from "@/contexts/ClientContext";
import { useEventContext } from "@/contexts/EventContext";
import { useNoteContext } from "@/contexts/NoteContext";
import { useAIChatContext } from "@/contexts/AIChatContext";
import { useUserContext } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

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

const suggestionCards = [
  { icon: Users, text: "¿Qué clientes necesitan atención urgente?" },
  { icon: FolderOpen, text: "Resumen de proyectos activos" },
  { icon: CalendarDays, text: "Reuniones de seguimiento pendientes" },
  { icon: TrendingUp, text: "Oportunidades de venta abiertas" },
];

export function AIChat() {
  const { selectedClient, pendingContext, clearPendingContext } = useClientContext();
  const { getTodayEvents } = useEventContext();
  const { getTodayCEONotes } = useNoteContext();
  const {
    messages, setMessages, conversationHistory, setConversationHistory,
    activeClient, setActiveClient, input, setInput, saveMessage,
  } = useAIChatContext();
  const { activeUser } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isRecording, isSupported, error: recorderError, startRecording, stopRecording } = useAudioRecorder();

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { if (recorderError) toast({ title: "Error de micrófono", description: recorderError, variant: "destructive" }); }, [recorderError]);

  // Handle context activation from client cards
  useEffect(() => {
    if (pendingContext) {
      const { clientName, issue } = pendingContext;
      const fetchClientId = async () => {
        const { data } = await supabase.from("clients").select("id, name, status, contact_name, phone, email").ilike("name", `%${clientName}%`).limit(1).maybeSingle();
        if (data) {
          setActiveClient({ id: data.id, name: data.name });
          const statusEmoji = data.status === "red" ? "🔴" : data.status === "orange" ? "🟠" : data.status === "yellow" ? "🟡" : "🟢";
          const statusText = data.status === "red" ? "crítico" : data.status === "orange" ? "atención" : data.status === "yellow" ? "pendiente" : "estable";
          setMessages(prev => [...prev, {
            id: Date.now().toString(), role: "assistant",
            content: `**${data.name}** ${statusEmoji} Estado: ${statusText}\n\n${issue ? `**Situación:** ${issue}` : ""}\n\n📞 **Contacto:** ${data.contact_name || "No especificado"} — ${data.phone || "Sin teléfono"}\n✉️ **Email:** ${data.email || "Sin email"}\n\n¿Qué quieres hacer con este cliente?`,
            timestamp: new Date(), clientContext: data.name,
          }]);
        }
      };
      fetchClientId();
      clearPendingContext();
    }
  }, [pendingContext, clearPendingContext]);

  useEffect(() => {
    if (selectedClient && selectedClient !== activeClient.name && !pendingContext) {
      const fetchClientData = async () => {
        const { data } = await supabase.from("clients").select("id, name, status, contact_name, phone").ilike("name", `%${selectedClient}%`).limit(1).maybeSingle();
        if (data) {
          setActiveClient({ id: data.id, name: data.name });
          const statusEmoji = data.status === "red" ? "🔴" : data.status === "orange" ? "🟠" : data.status === "yellow" ? "🟡" : "🟢";
          setMessages(prev => [...prev, {
            id: Date.now().toString(), role: "assistant",
            content: `**${data.name}** seleccionado. ${statusEmoji}\n\n📞 ${data.contact_name || "Contacto"}: ${data.phone || "Sin teléfono"}\n\n¿Qué quieres saber o hacer?`,
            timestamp: new Date(), clientContext: data.name,
          }]);
        }
      };
      fetchClientData();
    }
  }, [selectedClient, pendingContext, activeClient.name]);

  const handleMicClick = async () => {
    if (isRecording) {
      const audioBlob = await stopRecording();
      if (audioBlob && audioBlob.size > 0) {
        setIsTranscribing(true);
        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""));
          const { data, error } = await supabase.functions.invoke("transcribe", { body: { audio: base64, mimeType: audioBlob.type } });
          if (error) throw new Error(error.message);
          if (data?.text) { setInput(prev => prev ? `${prev} ${data.text}` : data.text); toast({ title: "Transcripción completada" }); }
          else if (data?.error) throw new Error(data.error);
        } catch (err) {
          console.error("Transcription error:", err);
          toast({ title: "Error de transcripción", description: err instanceof Error ? err.message : "No se pudo transcribir.", variant: "destructive" });
        } finally { setIsTranscribing(false); }
      }
    } else { await startRecording(); }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsLoading(true);
    saveMessage("user", userInput, activeClient.name || undefined);

    const newHistory: ConversationMessage[] = [...conversationHistory, { role: "user", content: userInput }];
    const todayEvents = getTodayEvents();
    const todayNotes = getTodayCEONotes();
    const uiSnapshot = {
      todayEvents: todayEvents.map(e => ({ title: e.title, type: e.type, time: e.time, clientName: e.clientName })),
      pendingNotes: todayNotes.filter(n => n.status === "pending").map(n => ({ content: n.content, clientName: n.clientName, author: n.author })),
      incidentCounts: { total: 3 }
    };

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ message: userInput, activeClientId: activeClient.id, activeClientName: activeClient.name, conversationHistory: newHistory.slice(-10), uiSnapshot, userId: activeUser?.id, userName: activeUser?.name, userRole: activeUser?.role, aiInstructions: activeUser?.ai_instructions }),
      });

      if (!resp.ok) {
        if (resp.status === 429) { toast({ title: "Demasiadas solicitudes", variant: "destructive" }); throw new Error("rate_limit"); }
        if (resp.status === 402) { toast({ title: "Créditos agotados", variant: "destructive" }); throw new Error("payment_required"); }
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
                if (last?.role === "assistant" && last.id === assistantId) return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: currentContent } : m);
                return [...prev, { id: assistantId, role: "assistant" as const, content: currentContent, timestamp: new Date(), clientContext: activeClient.name || undefined }];
              });
            }
          } catch { textBuffer = line + "\n" + textBuffer; break; }
        }
      }

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
                if (last?.role === "assistant" && last.id === assistantId) return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: currentContent } : m);
                return [...prev, { id: assistantId, role: "assistant" as const, content: currentContent, timestamp: new Date(), clientContext: activeClient.name || undefined }];
              });
            }
          } catch { /* ignore */ }
        }
      }

      if (!assistantSoFar) {
        assistantSoFar = "No tengo respuesta.";
        setMessages(prev => [...prev, { id: assistantId, role: "assistant" as const, content: assistantSoFar, timestamp: new Date() }]);
      }

      setConversationHistory([...newHistory, { role: "assistant" as const, content: assistantSoFar }].slice(-20));
      saveMessage("assistant", assistantSoFar, activeClient.name || undefined);
      if (executedActions.some((a: any) => a.tool === "create_event" && a.result?.success)) window.dispatchEvent(new CustomEvent("prossium:eventCreated"));
      if (executedActions.some((a: any) => a.tool === "create_note" && a.result?.success)) window.dispatchEvent(new CustomEvent("prossium:noteCreated"));
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Lo siento, ha ocurrido un error. Inténtalo de nuevo.", timestamp: new Date() }]);
    } finally { setIsLoading(false); }
  };

  const handleSuggestion = (question: string) => { setInput(question); };
  const clearContext = () => { setActiveClient({ id: null, name: null }); toast({ title: "Contexto limpiado" }); };
  const isMicDisabled = isLoading || isTranscribing || !isSupported;
  const showWelcome = messages.length <= 1;

  return (
    <div className="flex flex-col h-full">
      {activeClient.name && (
        <div className="px-4 py-2 border-b border-border bg-primary/5 flex items-center justify-between">
          <p className="text-xs text-primary">Contexto: <span className="font-medium">{activeClient.name}</span></p>
          <Button variant="ghost" size="sm" onClick={clearContext} className="text-xs text-muted-foreground hover:text-foreground h-6 px-2">Limpiar</Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showWelcome && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <AIBrainSphere size={140} isThinking={false} />
            <h1 className="text-2xl font-semibold text-foreground mb-2 mt-2">
              Hola {activeUser?.name || ""}. Soy tu <span className="text-gradient">IA de empresa</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mb-8">
              Estoy conectada a tus datos, clientes, proyectos y herramientas. Pregúntame lo que necesites.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {suggestionCards.map((card) => (
                <button
                  key={card.text}
                  onClick={() => handleSuggestion(card.text)}
                  className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-secondary/60 hover:border-primary/30 transition-all text-left group"
                >
                  <card.icon className="h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">{card.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {!showWelcome && (
          <>
            {messages.map((message) => (
              <div key={message.id} className={cn("animate-fade-in", message.role === "user" ? "flex justify-end" : "flex items-start gap-3")}>
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 mt-1">
                    <AIBrainSphere size={36} isThinking={false} />
                  </div>
                )}
                <div className={cn("max-w-[80%] rounded-2xl px-4 py-3", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
                  <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="animate-fade-in flex items-start gap-3 py-2">
                <div className="flex-shrink-0">
                  <AIBrainSphere size={36} isThinking={true} />
                </div>
                <span className="text-sm text-muted-foreground mt-2">Pensando...</span>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border/30">
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
            placeholder="Pregunta sobre tus clientes, proyectos, reuniones..."
            disabled={isLoading || isRecording}
            className="flex-1 bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
          />
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            className={cn("h-12 w-12 rounded-xl transition-all", isRecording && "animate-pulse")}
            onClick={handleMicClick}
            disabled={isMicDisabled}
            title={!isSupported ? "Tu navegador no soporta grabación de audio" : isRecording ? "Detener grabación" : "Grabación de voz"}
          >
            {isTranscribing ? <Loader2 className="w-5 h-5 animate-spin" /> : isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon" className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
