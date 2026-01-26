import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tool definitions for function calling
const tools = [
  {
    type: "function",
    function: {
      name: "create_event",
      description: "Crea un evento en el calendario (llamada, reunión o recordatorio). Usa esta función cuando el usuario quiera agendar algo.",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string", description: "ID del cliente (puede ser null para recordatorios personales)", nullable: true },
          client_name: { type: "string", description: "Nombre del cliente para mostrar", nullable: true },
          title: { type: "string", description: "Título del evento" },
          type: { type: "string", enum: ["call", "meeting", "reminder"], description: "Tipo de evento" },
          start_at: { type: "string", description: "Fecha y hora de inicio en formato ISO (YYYY-MM-DDTHH:mm:ss)" },
          reminder_minutes: { type: "integer", description: "Minutos antes para recordatorio (default 15)", nullable: true },
          notes: { type: "string", description: "Notas adicionales", nullable: true }
        },
        required: ["title", "type", "start_at"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_note",
      description: "Crea una nota para el equipo o CEO. Usa esta función cuando el usuario quiera enviar instrucciones o notas.",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string", description: "ID del cliente relacionado (opcional)", nullable: true },
          client_name: { type: "string", description: "Nombre del cliente para referencia", nullable: true },
          text: { type: "string", description: "Contenido de la nota" },
          due_at: { type: "string", description: "Fecha límite en formato ISO (opcional)", nullable: true },
          visible_to: { type: "string", enum: ["team", "ceo", "both"], description: "Quién puede ver la nota" },
          target_employee: { type: "string", description: "Empleado específico destinatario (ej: 'Laura')", nullable: true }
        },
        required: ["text", "visible_to"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_today_agenda",
      description: "Obtiene la agenda del día con todos los eventos programados.",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "Fecha en formato YYYY-MM-DD (default: hoy)", nullable: true }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_ceo_notes",
      description: "Obtiene las notas del equipo dirigidas al CEO.",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "Fecha en formato YYYY-MM-DD (default: hoy)", nullable: true }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_client_context",
      description: "Obtiene información completa de un cliente: estado, historial, contacto, incidencias.",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string", description: "ID del cliente" },
          client_name: { type: "string", description: "Nombre del cliente (alternativa a ID)" }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_clients_overview",
      description: "Obtiene resumen de todos los clientes con su estado actual.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "log_history_entry",
      description: "Registra una entrada en el historial de un cliente.",
      parameters: {
        type: "object",
        properties: {
          client_id: { type: "string", description: "ID del cliente" },
          type: { type: "string", enum: ["email", "note", "incident", "event", "call", "meeting"], description: "Tipo de entrada" },
          summary: { type: "string", description: "Resumen de la actividad" },
          visible_to: { type: "string", enum: ["team", "ceo", "both"], description: "Visibilidad" }
        },
        required: ["client_id", "type", "summary", "visible_to"]
      }
    }
  }
];

// System prompt for the AI
const systemPrompt = `Eres el asistente ejecutivo de Processia, una plataforma para CEOs.

REGLAS CRÍTICAS:
1. INTENCIÓN > CONTEXTO: Si el usuario pide un recordatorio personal (ej: "créame un recordatorio para enviar email"), NO asumas cliente activo. Solo asocia cliente si lo menciona explícitamente o la acción lo requiere.

2. TIEMPOS RELATIVOS: Resuelve automáticamente expresiones como:
   - "dentro de X minutos/horas" = ahora + X minutos/horas
   - "en media hora" = ahora + 30 min
   - "mañana a las 10" = mañana a las 10:00
   NO repreguntes la hora si ya está en el mensaje.

3. EJECUCIÓN DIRECTA: Si tienes la información necesaria, ejecuta la acción. Solo pregunta si falta un dato crítico imposible de inferir.

4. RESPUESTAS BREVES: Confirma acciones en 1-2 líneas. Ejemplo: "Listo. Recordatorio en 2 minutos para enviar email a Laura."

5. CONTEXTO DE CLIENTE: Cuando hay un cliente activo (se te pasará en el mensaje), úsalo para llamadas/reuniones. Pero no lo forces para recordatorios personales.

6. NOTAS AL EQUIPO: Cuando el CEO quiere dejar instrucciones (ej: "dile a Laura que llame a Global Media"), usa create_note con target_employee y visible_to="team".

Hora actual: {current_time}
Fecha actual: {current_date}

Cuando ejecutes una acción, confirma brevemente qué hiciste.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, activeClientId, activeClientName, conversationHistory } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const currentTime = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    const currentDate = now.toISOString().split("T")[0];

    // Build messages with context
    const contextInfo = activeClientName 
      ? `\n[CONTEXTO ACTIVO: Cliente "${activeClientName}" (ID: ${activeClientId || "desconocido"})]`
      : "";
    
    const messages = [
      { 
        role: "system", 
        content: systemPrompt
          .replace("{current_time}", currentTime)
          .replace("{current_date}", currentDate)
      },
      ...(conversationHistory || []).slice(-10), // Last 10 messages for context
      { 
        role: "user", 
        content: message + contextInfo
      }
    ];

    console.log("Sending request to AI gateway with message:", message);

    // First API call with tools
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        tools,
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "rate_limit",
          message: "Demasiadas solicitudes. Espera un momento." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "payment_required",
          message: "Se requiere agregar créditos." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI response:", JSON.stringify(aiResponse, null, 2));

    const choice = aiResponse.choices?.[0];
    if (!choice) {
      throw new Error("No response from AI");
    }

    const toolCalls = choice.message?.tool_calls;
    const executedActions: Array<{ tool: string; result: any }> = [];

    // Execute tool calls if any
    if (toolCalls && toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        
        console.log(`Executing tool: ${functionName}`, args);

        let result: any;

        switch (functionName) {
          case "create_event": {
            const { data, error } = await supabase.from("events").insert({
              client_id: args.client_id || null,
              title: args.title,
              type: args.type,
              start_at: args.start_at,
              reminder_minutes: args.reminder_minutes || 15,
              notes: args.notes || null,
              created_by: "CEO"
            }).select().single();

            if (error) {
              console.error("Error creating event:", error);
              result = { success: false, error: error.message };
            } else {
              // Log to history if client exists
              if (args.client_id) {
                await supabase.from("client_history").insert({
                  client_id: args.client_id,
                  type: args.type === "call" ? "call" : args.type === "meeting" ? "meeting" : "event",
                  summary: `Evento creado: ${args.title}`,
                  created_by: "CEO",
                  visible_to: "both"
                });
              }
              result = { 
                success: true, 
                event_id: data.id, 
                start_at: args.start_at,
                reminder_at: args.reminder_minutes 
                  ? new Date(new Date(args.start_at).getTime() - args.reminder_minutes * 60000).toISOString()
                  : null
              };
            }
            break;
          }

          case "create_note": {
            const { data, error } = await supabase.from("notes").insert({
              client_id: args.client_id || null,
              text: args.text,
              due_at: args.due_at || null,
              visible_to: args.visible_to,
              target_employee: args.target_employee || null,
              created_by: "CEO",
              status: "pending"
            }).select().single();

            if (error) {
              console.error("Error creating note:", error);
              result = { success: false, error: error.message };
            } else {
              result = { success: true, note_id: data.id };
            }
            break;
          }

          case "get_today_agenda": {
            const targetDate = args.date || currentDate;
            const startOfDay = `${targetDate}T00:00:00`;
            const endOfDay = `${targetDate}T23:59:59`;

            const { data, error } = await supabase
              .from("events")
              .select("*, clients(name)")
              .gte("start_at", startOfDay)
              .lte("start_at", endOfDay)
              .order("start_at", { ascending: true });

            if (error) {
              result = { success: false, error: error.message };
            } else {
              result = { 
                success: true, 
                events: data?.map(e => ({
                  id: e.id,
                  title: e.title,
                  type: e.type,
                  time: new Date(e.start_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
                  client: e.clients?.name || null
                })) || []
              };
            }
            break;
          }

          case "get_ceo_notes": {
            const { data, error } = await supabase
              .from("notes")
              .select("*, clients(name)")
              .in("visible_to", ["ceo", "both"])
              .eq("status", "pending")
              .order("created_at", { ascending: false })
              .limit(10);

            if (error) {
              result = { success: false, error: error.message };
            } else {
              result = { 
                success: true, 
                notes: data?.map(n => ({
                  id: n.id,
                  text: n.text,
                  client: n.clients?.name || null,
                  created_by: n.created_by,
                  due_at: n.due_at
                })) || []
              };
            }
            break;
          }

          case "get_client_context": {
            let clientData = null;
            
            if (args.client_id) {
              const { data } = await supabase
                .from("clients")
                .select("*")
                .eq("id", args.client_id)
                .single();
              clientData = data;
            } else if (args.client_name) {
              const { data } = await supabase
                .from("clients")
                .select("*")
                .ilike("name", `%${args.client_name}%`)
                .limit(1)
                .maybeSingle();
              clientData = data;
            }

            if (!clientData) {
              result = { success: false, error: "Cliente no encontrado" };
            } else {
              // Get recent history
              const { data: history } = await supabase
                .from("client_history")
                .select("*")
                .eq("client_id", clientData.id)
                .order("created_at", { ascending: false })
                .limit(5);

              result = {
                success: true,
                client: {
                  id: clientData.id,
                  name: clientData.name,
                  status: clientData.status,
                  contact_name: clientData.contact_name,
                  email: clientData.email,
                  phone: clientData.phone,
                  updated_at: clientData.updated_at
                },
                history: history || []
              };
            }
            break;
          }

          case "get_clients_overview": {
            const { data, error } = await supabase
              .from("clients")
              .select("id, name, status, contact_name, updated_at")
              .order("status", { ascending: true });

            if (error) {
              result = { success: false, error: error.message };
            } else {
              const statusOrder = { red: 1, orange: 2, yellow: 3, green: 4 };
              const sorted = data?.sort((a, b) => 
                (statusOrder[a.status as keyof typeof statusOrder] || 5) - 
                (statusOrder[b.status as keyof typeof statusOrder] || 5)
              );
              
              result = { 
                success: true, 
                clients: sorted?.map(c => ({
                  id: c.id,
                  name: c.name,
                  status: c.status,
                  contact: c.contact_name
                })) || []
              };
            }
            break;
          }

          case "log_history_entry": {
            const { data, error } = await supabase.from("client_history").insert({
              client_id: args.client_id,
              type: args.type,
              summary: args.summary,
              created_by: "CEO",
              visible_to: args.visible_to
            }).select().single();

            if (error) {
              result = { success: false, error: error.message };
            } else {
              result = { success: true, entry_id: data.id };
            }
            break;
          }

          default:
            result = { success: false, error: `Unknown tool: ${functionName}` };
        }

        executedActions.push({ tool: functionName, result });
      }

      // Second API call to generate final response with tool results
      const toolResultMessages = toolCalls.map((tc: any, index: number) => ({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(executedActions[index].result)
      }));

      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            ...messages,
            choice.message,
            ...toolResultMessages
          ],
        }),
      });

      if (!followUpResponse.ok) {
        throw new Error("Failed to get follow-up response");
      }

      const followUpData = await followUpResponse.json();
      const finalContent = followUpData.choices?.[0]?.message?.content || "Acción completada.";

      return new Response(JSON.stringify({
        message: finalContent,
        actions: executedActions
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No tool calls, return direct response
    return new Response(JSON.stringify({
      message: choice.message?.content || "No tengo respuesta.",
      actions: []
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(JSON.stringify({ 
      error: "internal_error",
      message: error instanceof Error ? error.message : "Error desconocido" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
