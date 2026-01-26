import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Mic } from "lucide-react";
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

// Extensive response library for instant responses
const responseLibrary: Record<string, string> = {
  "¿Qué tengo que hacer hoy?": `Hoy tienes **3 puntos de atención**:

1. 🔴 **Nexus Tech** — Incidencia de facturación sin resolver desde hace 3 días. El cliente ha enviado 2 emails sin respuesta.

2. 🟠 **Global Media** — Llamada urgente pendiente de confirmar.

3. 🟠 **Startup Lab** — Fecha límite de entrega en 48 horas.

¿Quieres que te dé más contexto de alguno?`,

  "¿Qué clientes necesitan atención?": `Ahora mismo tienes:

🔴 **1 cliente en rojo**: Nexus Tech
🟠 **2 clientes en naranja**: Global Media, Startup Lab  
🟡 **3 clientes en amarillo**: sin urgencia inmediata

El resto de clientes (12) están en verde y no requieren tu intervención.`,

  "Dame un resumen de la semana": `Esta semana:

• **4 incidencias resueltas** por el equipo
• **1 incidencia pendiente** (Nexus Tech) que requiere tu decisión
• **2 nuevos proyectos** iniciados
• **Satisfacción general**: Alta

El único punto crítico es Nexus Tech. Todo lo demás está bajo control.`,

  "Ponme en contexto Nexus Tech": `**Nexus Tech** es un cliente desde hace 8 meses con 2 proyectos activos.

**Situación actual:**
El 23 de enero reportaron un error en su factura de enero. Han enviado 2 emails (el último hace 2 días) y no hemos respondido.

**Historial reciente:**
- Renovaron contrato hace 3 meses
- Satisfacción previa: Alta
- Volumen: €4,500/mes

**Mi recomendación:**
Necesitas intervenir hoy. Una llamada personal resolvería la situación antes de que escale.`,

  "¿Por qué Nexus Tech está en rojo?": `Nexus Tech está en rojo porque:

1. **Incidencia sin resolver** — 3 días abierta
2. **Sin respuesta** — 2 emails del cliente ignorados
3. **Riesgo de escalada** — Cliente importante que puede enfadarse

El equipo marcó esta incidencia como "bloqueada" porque requiere tu aprobación para un ajuste de facturación.`,
};

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Buenos días. Tienes **1 cliente en rojo** que requiere tu intervención hoy. ¿Quieres que te ponga en contexto?",
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

  const getResponse = (userInput: string): string => {
    // Check for exact matches first
    if (responseLibrary[userInput]) {
      return responseLibrary[userInput];
    }

    // Check for partial matches
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes("nexus")) {
      return responseLibrary["Ponme en contexto Nexus Tech"];
    }
    if (lowerInput.includes("rojo") || lowerInput.includes("intervención")) {
      return responseLibrary["¿Qué clientes necesitan atención?"];
    }
    if (lowerInput.includes("hacer") || lowerInput.includes("pendiente") || lowerInput.includes("urgente")) {
      return responseLibrary["¿Qué tengo que hacer hoy?"];
    }
    if (lowerInput.includes("semana") || lowerInput.includes("resumen")) {
      return responseLibrary["Dame un resumen de la semana"];
    }
    if (lowerInput.includes("global media")) {
      return `**Global Media** solicitó una llamada urgente ayer para discutir un cambio de alcance en su proyecto actual. 

El equipo está esperando que confirmes disponibilidad. ¿Quieres que les envíe un mensaje con tu horario disponible?`;
    }
    if (lowerInput.includes("startup lab")) {
      return `**Startup Lab** tiene una entrega de proyecto en 48 horas (Fase 2 del desarrollo).

El equipo dice que van bien de tiempo, pero prefieren que estés al tanto por si hay preguntas del cliente.`;
    }

    // Default intelligent response
    return `Entendido. He analizado tu pregunta sobre "${userInput}".

Ahora mismo no tengo información específica sobre esto, pero puedo ayudarte con:
- Estado de clientes
- Incidencias activas
- Fechas críticas
- Resúmenes de actividad

¿En qué puedo ayudarte?`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsTyping(true);

    // Fast simulated response (300-600ms)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getResponse(userInput),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 300 + Math.random() * 300);
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
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-xl"
            title="Entrada de voz (próximamente)"
          >
            <Mic className="w-5 h-5" />
          </Button>
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
