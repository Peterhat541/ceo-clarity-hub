import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "¿Qué tengo que hacer hoy?",
  "¿Qué clientes necesitan atención?",
  "Dame un resumen de la semana",
];

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Buenos días. Tienes 2 clientes que requieren tu atención hoy. Nexus Tech está en rojo por una incidencia sin resolver desde hace 3 días. ¿Quieres que te ponga en contexto?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        "¿Qué tengo que hacer hoy?": "Hoy tienes 3 puntos de atención:\n\n1. **Nexus Tech** está en rojo. Llevan 3 días sin respuesta a una incidencia crítica de facturación.\n\n2. **Global Media** tiene una llamada pendiente que solicitaron ayer.\n\n3. **Startup Lab** tiene fecha límite de entrega en 2 días.\n\n¿Quieres que profundice en alguno?",
        "¿Qué clientes necesitan atención?": "Ahora mismo tienes:\n\n🔴 **1 cliente en rojo**: Nexus Tech\n🟠 **2 clientes en naranja**: Global Media, Startup Lab\n🟡 **3 clientes en amarillo**: sin urgencia inmediata\n\nEl resto de clientes (12) están en verde.",
        "Dame un resumen de la semana": "Esta semana:\n\n• **4 incidencias resueltas** por el equipo\n• **1 incidencia pendiente** que requiere tu decisión\n• **2 nuevos proyectos** iniciados\n• **Satisfacción general**: Alta\n\nEl único punto crítico es Nexus Tech. Todo lo demás está bajo control.",
      };

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[input] || "Entendido. Dame un momento para analizar la información y darte una respuesta precisa sobre eso.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-teal flex items-center justify-center glow">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Asistente IA</h2>
            <p className="text-xs text-muted-foreground">Tu mano derecha ejecutiva</p>
          </div>
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
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="animate-fade-in">
            <div className="bg-secondary rounded-2xl px-4 py-3 inline-block">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-glow" />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-glow delay-75" />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-glow delay-150" />
              </div>
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
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Pregunta lo que necesites..."
            className="flex-1 bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            size="icon"
            className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
