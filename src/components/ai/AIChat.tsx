import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useClientContext } from "@/contexts/ClientContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  clientContext?: string;
}

interface AIContext {
  activeClient: string | null;
  lastMentionedClient: string | null;
}

const suggestedQuestions = [
  "¿Qué tengo que hacer hoy?",
  "Ponme en contexto Nexus Tech",
  "Dame un resumen de la semana",
];

// Client database for context
const clientDatabase: Record<string, { status: string; issue: string; details: string; history: string }> = {
  "nexus tech": {
    status: "rojo",
    issue: "Incidencia de facturación sin resolver desde hace 3 días",
    details: "Cliente desde hace 8 meses con 2 proyectos activos. Volumen: €4,500/mes.",
    history: "Renovaron contrato hace 3 meses. Satisfacción previa: Alta. Han enviado 2 emails sin respuesta."
  },
  "global media": {
    status: "naranja",
    issue: "Solicitud de llamada urgente pendiente de confirmar",
    details: "Cliente con 1 proyecto activo en Barcelona.",
    history: "Pidieron ayer un cambio de alcance. Esperan confirmación de disponibilidad para una llamada."
  },
  "startup lab": {
    status: "naranja",
    issue: "Fecha límite de entrega en 48 horas",
    details: "Cliente con 3 proyectos activos. Fase 2 del desarrollo.",
    history: "El equipo dice que van bien de tiempo, pero prefieren que estés al tanto."
  },
  "coredata": {
    status: "amarillo",
    issue: "Retraso en entrega de contenidos por parte del cliente",
    details: "Cliente con 1 proyecto activo en Bilbao.",
    history: "El retraso es responsabilidad del cliente, no hay acción requerida de tu parte."
  },
  "bluesky ventures": {
    status: "verde",
    issue: "Sin incidencias",
    details: "Cliente con 2 proyectos activos en Valencia.",
    history: "Todo en orden. Reunión trimestral programada en 4 días."
  }
};

// Client contact database
const clientContacts: Record<string, { phone: string; email: string; mainContact: string }> = {
  "nexus tech": { phone: "+34 612 345 678", email: "carlos@nexustech.com", mainContact: "Carlos Rodríguez" },
  "global media": { phone: "+34 623 456 789", email: "ana@globalmedia.es", mainContact: "Ana Martínez" },
  "startup lab": { phone: "+34 634 567 890", email: "miguel@startuplab.io", mainContact: "Miguel Sánchez" },
  "coredata": { phone: "+34 645 678 901", email: "laura@coredata.com", mainContact: "Laura García" },
  "bluesky ventures": { phone: "+34 656 789 012", email: "pablo@bluesky.vc", mainContact: "Pablo Fernández" },
};

// Response library with context awareness
const getContextualResponse = (userInput: string, context: AIContext): { response: string; newContext: Partial<AIContext> } => {
  const lowerInput = userInput.toLowerCase().trim();
  
  // Handle phone/contact requests
  if ((lowerInput.includes("teléfono") || lowerInput.includes("telefono") || lowerInput.includes("número") || lowerInput.includes("numero") || lowerInput.includes("llamar") || lowerInput.includes("contacto")) && context.activeClient) {
    const clientKey = context.activeClient.toLowerCase();
    const contact = clientContacts[clientKey];
    if (contact) {
      // Check if also asking for scheduling
      if (lowerInput.includes("agenda") || lowerInput.includes("llamada") || lowerInput.includes("recordatorio") || lowerInput.includes("cita")) {
        return {
          response: `**Datos de contacto de ${context.activeClient}:**
          
📞 **Teléfono:** ${contact.phone}
👤 **Contacto principal:** ${contact.mainContact}
✉️ **Email:** ${contact.email}

⚠️ **Sobre agendar llamadas y recordatorios:**
Actualmente no tengo integración con calendarios. Te recomiendo:
1. Llamar directamente al ${contact.phone}
2. Crear el recordatorio manualmente en tu calendario

¿Hay algo más que pueda ayudarte con ${context.activeClient}?`,
          newContext: {}
        };
      }
      return {
        response: `**Datos de contacto de ${context.activeClient}:**

📞 **Teléfono:** ${contact.phone}
👤 **Contacto principal:** ${contact.mainContact}
✉️ **Email:** ${contact.email}

¿Quieres que te ponga más en contexto antes de llamar?`,
        newContext: {}
      };
    }
  }

  // Handle scheduling/agenda requests without active client
  if (lowerInput.includes("agenda") || lowerInput.includes("recordatorio") || lowerInput.includes("cita")) {
    if (context.activeClient) {
      const contact = clientContacts[context.activeClient.toLowerCase()];
      if (contact) {
        return {
          response: `Para **${context.activeClient}** el contacto principal es **${contact.mainContact}** (${contact.phone}).

⚠️ Actualmente no tengo integración con calendarios para agendar automáticamente. Te sugiero:
1. Llamar directamente
2. Crear el evento en tu calendario manualmente

¿Necesitas más contexto sobre este cliente antes de contactar?`,
          newContext: {}
        };
      }
    }
    return {
      response: `No tengo integración con calendarios todavía. ¿Sobre qué cliente necesitas información para agendar una llamada?`,
      newContext: {}
    };
  }
  
  // Handle affirmative responses with context
  if ((lowerInput === "sí" || lowerInput === "si" || lowerInput === "vale" || lowerInput === "ok" || lowerInput === "claro") && context.lastMentionedClient) {
    const client = clientDatabase[context.lastMentionedClient.toLowerCase()];
    if (client) {
      return {
        response: `**${context.lastMentionedClient}** está en ${client.status} por: ${client.issue}.

**Contexto:**
${client.details}

**Historial reciente:**
${client.history}

**Mi recomendación:**
${client.status === "rojo" ? "Necesitas intervenir hoy. Una llamada personal resolvería la situación antes de que escale." : client.status === "naranja" ? "Requiere atención esta semana para evitar que escale." : "No requiere acción inmediata."}`,
        newContext: { activeClient: context.lastMentionedClient }
      };
    }
  }

  // Detect client mentions
  for (const clientName of Object.keys(clientDatabase)) {
    if (lowerInput.includes(clientName)) {
      const client = clientDatabase[clientName];
      const formattedName = clientName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      return {
        response: `**${formattedName}** está en ${client.status}.

**Situación actual:**
${client.issue}

**Detalles:**
${client.details}

**Historial reciente:**
${client.history}

**Mi recomendación:**
${client.status === "rojo" ? "Necesitas intervenir hoy. Una llamada personal resolvería la situación." : client.status === "naranja" ? "Requiere tu atención esta semana." : "No requiere acción inmediata de tu parte."}`,
        newContext: { activeClient: formattedName, lastMentionedClient: formattedName }
      };
    }
  }

  // Handle "today" questions
  if (lowerInput.includes("hacer") || lowerInput.includes("hoy") || lowerInput.includes("pendiente") || lowerInput.includes("urgente")) {
    return {
      response: `Hoy tienes **3 puntos de atención**:

1. 🔴 **Nexus Tech** — Incidencia de facturación sin resolver desde hace 3 días. El cliente ha enviado 2 emails sin respuesta.

2. 🟠 **Global Media** — Llamada urgente pendiente de confirmar.

3. 🟠 **Startup Lab** — Fecha límite de entrega en 48 horas.

¿Quieres que te ponga en contexto de alguno?`,
      newContext: { lastMentionedClient: "Nexus Tech" }
    };
  }

  // Handle "attention needed" questions
  if (lowerInput.includes("atención") || lowerInput.includes("rojo") || lowerInput.includes("intervención")) {
    return {
      response: `Ahora mismo tienes:

🔴 **1 cliente en rojo**: Nexus Tech — requiere tu intervención directa
🟠 **2 clientes en naranja**: Global Media, Startup Lab — en riesgo esta semana
🟡 **1 cliente en amarillo**: CoreData — atención menor
🟢 **2 clientes en verde**: Todo en orden

El foco principal es **Nexus Tech**. ¿Quieres que te ponga en contexto?`,
      newContext: { lastMentionedClient: "Nexus Tech" }
    };
  }

  // Handle weekly summary
  if (lowerInput.includes("semana") || lowerInput.includes("resumen")) {
    return {
      response: `Esta semana:

• **4 incidencias resueltas** por el equipo
• **1 incidencia pendiente** (Nexus Tech) que requiere tu decisión
• **2 nuevos proyectos** iniciados
• **Satisfacción general**: Alta

El único punto crítico es **Nexus Tech**. Todo lo demás está bajo control.`,
      newContext: { lastMentionedClient: "Nexus Tech" }
    };
  }

  // Handle "why red" questions
  if (lowerInput.includes("por qué") && (lowerInput.includes("rojo") || lowerInput.includes("intervención"))) {
    if (context.activeClient) {
      const client = clientDatabase[context.activeClient.toLowerCase()];
      if (client && client.status === "rojo") {
        return {
          response: `**${context.activeClient}** está en rojo porque:

1. **Incidencia sin resolver** — ${client.issue}
2. **Sin respuesta** — 2 emails del cliente ignorados
3. **Riesgo de escalada** — Cliente importante que puede enfadarse

El equipo marcó esta incidencia como "bloqueada" porque requiere tu aprobación.`,
          newContext: {}
        };
      }
    }
    return {
      response: `**Nexus Tech** está en rojo porque:

1. **Incidencia sin resolver** — 3 días abierta
2. **Sin respuesta** — 2 emails del cliente ignorados
3. **Riesgo de escalada** — Cliente importante que puede enfadarse

El equipo marcó esta incidencia como "bloqueada" porque requiere tu aprobación para un ajuste de facturación.`,
      newContext: { activeClient: "Nexus Tech", lastMentionedClient: "Nexus Tech" }
    };
  }

  // Handle follow-up about current client
  if (context.activeClient && (lowerInput.includes("más") || lowerInput.includes("detalle") || lowerInput.includes("historia"))) {
    const client = clientDatabase[context.activeClient.toLowerCase()];
    if (client) {
      return {
        response: `**Historial completo de ${context.activeClient}:**

${client.details}

**Timeline reciente:**
${client.history}

**Estado actual:** ${client.status}
**Acción requerida:** ${client.status === "rojo" ? "Intervención directa hoy" : client.status === "naranja" ? "Seguimiento esta semana" : "Ninguna"}`,
        newContext: {}
      };
    }
  }

  // Handle unrecognized requests with active client context
  if (context.activeClient) {
    const contact = clientContacts[context.activeClient.toLowerCase()];
    const client = clientDatabase[context.activeClient.toLowerCase()];
    if (contact && client) {
      return {
        response: `Sobre **${context.activeClient}**:

📞 **Teléfono:** ${contact.phone}
👤 **Contacto:** ${contact.mainContact}
📊 **Estado:** ${client.status}

**Situación:** ${client.issue}

¿Qué necesitas? Puedo darte más contexto, historial o datos de contacto.`,
        newContext: {}
      };
    }
  }

  // Default response - avoid generic text
  return {
    response: `Tienes **1 cliente en rojo** (Nexus Tech) y **2 en naranja** (Global Media, Startup Lab) que requieren atención.

¿Sobre cuál quieres que te ponga en contexto?`,
    newContext: { lastMentionedClient: "Nexus Tech" }
  };
};

export function AIChat() {
  const { selectedClient, setSelectedClient, pendingContext, clearPendingContext } = useClientContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Tienes **1 cliente en rojo** que requiere tu intervención hoy: **Nexus Tech**, con una incidencia de facturación abierta hace 3 días.\n\n¿Quieres que te ponga en contexto?",
      timestamp: new Date(),
      clientContext: "Nexus Tech",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<AIContext>({
    activeClient: null,
    lastMentionedClient: "Nexus Tech"
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle context activation from client cards (IA button)
  useEffect(() => {
    if (pendingContext) {
      const { clientName, issue } = pendingContext;
      const clientKey = clientName.toLowerCase();
      const client = clientDatabase[clientKey];
      const contact = clientContacts[clientKey];
      
      // Update internal context
      setContext(prev => ({ 
        ...prev, 
        activeClient: clientName, 
        lastMentionedClient: clientName 
      }));
      
      if (client && contact) {
        // Build contextual auto-message
        const statusEmoji = client.status === "rojo" ? "🔴" : client.status === "naranja" ? "🟠" : client.status === "amarillo" ? "🟡" : "🟢";
        const recommendation = client.status === "rojo" 
          ? "**Acción recomendada:** Llamada hoy para resolver antes de que escale."
          : client.status === "naranja"
          ? "**Acción recomendada:** Seguimiento esta semana."
          : "No requiere acción inmediata.";
        
        const contextMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: `Estamos hablando de **${clientName}**. ${statusEmoji} Está en ${client.status} por ${issue || client.issue}.

${client.history}

📞 **Contacto:** ${contact.mainContact} — ${contact.phone}

${recommendation}`,
          timestamp: new Date(),
          clientContext: clientName,
        };
        setMessages(prev => [...prev, contextMessage]);
      }
      
      // Clear the pending context
      clearPendingContext();
    }
  }, [pendingContext, clearPendingContext]);

  // Sync with external client selection from search (only if not from pending context)
  useEffect(() => {
    if (selectedClient && selectedClient !== context.activeClient && !pendingContext) {
      setContext(prev => ({ 
        ...prev, 
        activeClient: selectedClient, 
        lastMentionedClient: selectedClient 
      }));
      
      // Auto-respond when client is selected from search
      const clientKey = selectedClient.toLowerCase();
      const client = clientDatabase[clientKey];
      const contact = clientContacts[clientKey];
      
      if (client && contact) {
        const autoMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: `**${selectedClient}** seleccionado.

**Estado:** ${client.status === "rojo" ? "🔴" : client.status === "naranja" ? "🟠" : client.status === "amarillo" ? "🟡" : "🟢"} ${client.status}

**Situación actual:**
${client.issue}

📞 **Teléfono:** ${contact.phone}
👤 **Contacto:** ${contact.mainContact}

¿Qué quieres saber sobre este cliente?`,
          timestamp: new Date(),
          clientContext: selectedClient,
        };
        setMessages(prev => [...prev, autoMessage]);
      }
    }
  }, [selectedClient, pendingContext]);

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

    // Fast simulated response (200-400ms for snappiness)
    setTimeout(() => {
      const { response, newContext } = getContextualResponse(userInput, context);
      
      // Update context
      setContext(prev => ({ ...prev, ...newContext }));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        clientContext: newContext.activeClient || context.activeClient || undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 200 + Math.random() * 200);
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
            <p className="text-xs text-muted-foreground">
              {context.activeClient 
                ? `Contexto: ${context.activeClient}`
                : "Tu mano derecha ejecutiva"
              }
            </p>
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
            placeholder="Pregunta sobre cualquier cliente..."
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
