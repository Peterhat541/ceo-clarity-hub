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
      name: "get_dashboard_summary",
      description: "Obtiene un resumen completo del estado actual: clientes que necesitan atención, incidencias abiertas, eventos del día y notas pendientes. USA ESTA FUNCIÓN SIEMPRE que el usuario pregunte '¿Qué tengo que hacer?' o '¿Cómo está todo?' o 'Dame un resumen'.",
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
const baseSystemPrompt = `Eres el asistente ejecutivo de {user_name} ({user_role}) en Processia.

{user_ai_instructions}

CONSULTA DE DATOS:
- SIEMPRE usa las herramientas para consultar datos. NUNCA respondas de memoria.
- Si preguntan por un cliente, usa get_client_context.
- Si preguntan por estado general o "cómo está todo", usa get_dashboard_summary.
- Si preguntan por la agenda o eventos, usa get_today_agenda.
- Si preguntan por notas, usa get_ceo_notes.
- Si preguntan qué clientes están críticos o necesitan atención, usa get_clients_overview.
- NUNCA digas "No tengo respuesta". Siempre consulta primero.

RESPUESTAS:
- Responde de forma concisa con los datos obtenidos.
- Si preguntan un dato concreto (presupuesto, estado, teléfono), da ese dato.
- Si hay algo crítico, añade 1 línea con emoji de estado (🔴🟠🟡🟢).
- Máximo 3-5 líneas salvo que pidan detalle completo.
- Confirmaciones de acciones: 1 línea con ✅.
- Dato no registrado en la base de datos: "No registrado".

FORMATO:
- Usa viñetas para listas.
- Emojis de estado: 🔴 crítico, 🟠 atención, 🟡 pendiente, 🟢 ok.

PROHIBIDO:
- No sugieras "llamar" ni acciones que no existan en la plataforma.
- No inventes datos. Solo usa lo que devuelven las herramientas.

EJECUCIÓN:
- Si tienes la info para ejecutar una acción (crear evento, nota), ejecuta directamente.
- Tiempos relativos: "en media hora" = ahora + 30 min.

Hora actual: {current_time}
Fecha actual: {current_date}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, activeClientId, activeClientName, conversationHistory, uiSnapshot, userId, userName, userRole, aiInstructions } = await req.json();
    
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

    // Build system prompt with user context
    const systemPrompt = baseSystemPrompt
      .replace("{user_name}", userName || "Usuario")
      .replace("{user_role}", userRole || "Empleado")
      .replace("{user_ai_instructions}", aiInstructions ? `INSTRUCCIONES PERSONALIZADAS DEL USUARIO:\n${aiInstructions}` : "")
      .replace("{current_time}", currentTime)
      .replace("{current_date}", currentDate);

    const contextInfo = activeClientName 
      ? `\n[CONTEXTO ACTIVO: Cliente "${activeClientName}" (ID: ${activeClientId || "desconocido"})]`
      : "";
    
    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []).slice(-10),
      { role: "user", content: message + contextInfo }
    ];

    console.log("Sending request to AI gateway with message:", message);

    // Detect if message needs data lookup
    const dataKeywords = [
      "cliente", "presupuesto", "estado", "critico", "crítico", "agenda", "evento",
      "nota", "pendiente", "hoy", "resumen", "como esta", "cómo está", "que tengo", "qué tengo",
      "cobrar", "incidencia", "proyecto", "reunion", "reunión", "llamada", "contacto",
      "telefono", "teléfono", "email", "tarea", "fechas", "responsable", "atencion", "atención",
      "todo", "clientes", "notas", "eventos", "trabajo", "descripcion", "descripción"
    ];
    const lowerMessage = message.toLowerCase();
    const needsData = dataKeywords.some((kw: string) => lowerMessage.includes(kw));
    console.log("Needs data lookup:", needsData, "Message:", lowerMessage);

    // First API call with tools
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools,
        tool_choice: needsData ? "required" : "auto",
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
          case "get_dashboard_summary": {
            // Get all critical information for the CEO
            const startOfDay = `${currentDate}T00:00:00`;
            const endOfDay = `${currentDate}T23:59:59`;

            // Check if we have UI snapshot data (prioritize what CEO sees)
            const hasSnapshotEvents = uiSnapshot?.todayEvents?.length > 0;
            const hasSnapshotNotes = uiSnapshot?.pendingNotes?.length > 0;

            // 1. Get today's events - use snapshot if available
            let todayEvents: any[] = [];
            if (hasSnapshotEvents) {
              todayEvents = uiSnapshot.todayEvents.map((e: any) => ({
                title: e.title,
                type: e.type,
                time: e.time,
                client: e.clientName || null
              }));
            } else {
              const { data: eventsData } = await supabase
                .from("events")
                .select("*, clients(name)")
                .gte("start_at", startOfDay)
                .lte("start_at", endOfDay)
                .order("start_at", { ascending: true });
              
              todayEvents = eventsData?.map(e => ({
                title: e.title,
                type: e.type,
                time: new Date(e.start_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
                client: e.clients?.name || null
              })) || [];
            }

            // 2. Get clients that need attention (red, orange status)
            const { data: criticalClients } = await supabase
              .from("clients")
              .select("*")
              .in("status", ["red", "orange"])
              .order("status", { ascending: true });

            // 3. Get all clients for overview
            const { data: allClients } = await supabase
              .from("clients")
              .select("id, name, status")
              .order("status", { ascending: true });

            // 4. Get pending notes for CEO - use snapshot if available
            let pendingNotes: any[] = [];
            if (hasSnapshotNotes) {
              pendingNotes = uiSnapshot.pendingNotes.map((n: any) => ({
                text: n.content || n.text,
                client: n.clientName || null,
                from: n.author || n.created_by
              }));
            } else {
              const { data: notesData } = await supabase
                .from("notes")
                .select("*, clients(name)")
                .in("visible_to", ["ceo", "both"])
                .eq("status", "pending")
                .order("created_at", { ascending: false })
                .limit(5);
              
              pendingNotes = notesData?.map(n => ({
                text: n.text,
                client: n.clients?.name || null,
                from: n.created_by
              })) || [];
            }

            // 5. Get recent incidents (history entries of type incident) or use snapshot counts
            let incidents: any[] = [];
            if (uiSnapshot?.incidentCounts) {
              // Use counts from UI for consistency
              incidents = [{ count: uiSnapshot.incidentCounts.total || 0 }];
            } else {
              const { data: incidentsData } = await supabase
                .from("client_history")
                .select("*, clients(name)")
                .eq("type", "incident")
                .order("created_at", { ascending: false })
                .limit(5);
              
              incidents = incidentsData?.map(i => ({
                summary: i.summary,
                client: i.clients?.name || null,
                date: i.created_at
              })) || [];
            }

            const statusLabels: Record<string, string> = {
              red: "🔴 crítico",
              orange: "🟠 atención",
              yellow: "🟡 pendiente",
              green: "🟢 estable"
            };

            result = {
              success: true,
              dataSource: hasSnapshotEvents || hasSnapshotNotes ? "ui_snapshot" : "database",
              summary: {
                todayEvents,
                criticalClients: criticalClients?.map(c => ({
                  name: c.name,
                  status: c.status,
                  statusLabel: statusLabels[c.status] || c.status,
                  contact: c.contact_name,
                  phone: c.phone
                })) || [],
                clientsByStatus: {
                  red: allClients?.filter(c => c.status === "red").length || 0,
                  orange: allClients?.filter(c => c.status === "orange").length || 0,
                  yellow: allClients?.filter(c => c.status === "yellow").length || 0,
                  green: allClients?.filter(c => c.status === "green").length || 0,
                  total: allClients?.length || 0
                },
                pendingNotes,
                incidents
              }
            };
            
            console.log("Dashboard summary result:", JSON.stringify(result, null, 2));
            break;
          }

          case "create_event": {
            const { data, error } = await supabase.from("events").insert({
              client_id: args.client_id || null,
              title: args.title,
              type: args.type,
              start_at: args.start_at,
              reminder_minutes: args.reminder_minutes || 15,
              notes: args.notes || null,
              created_by: userName || "Usuario"
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
                  created_by: userName || "Usuario",
                  visible_to: "both"
                });
              }
              
              // Create notification for team when it's a meeting or call
              if (args.type === "meeting" || args.type === "call") {
                const eventDate = new Date(args.start_at);
                const eventTime = eventDate.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit"
                });
                const eventDateStr = eventDate.toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long"
                });
                const eventTypeLabel = args.type === "meeting" ? "reunión" : "llamada";
                 const clientInfo = args.client_name ? ` Cliente: ${args.client_name}.` : "";
                 const creatorName = userName || "Usuario";
                await supabase.from("notes").insert({
                  text: `📅 Nueva ${eventTypeLabel} agendada por ${creatorName}: "${args.title}" el ${eventDateStr} a las ${eventTime}.${clientInfo}`,
                  visible_to: "team",
                  target_employee: null,
                  created_by: creatorName,
                  status: "pending",
                  due_at: args.start_at,
                  client_id: args.client_id || null
                });
                
                console.log("Team notification created for event:", args.title);
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
              created_by: userName || "Usuario",
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

              // Build complete client info with ALL fields from database
              const clientInfo: Record<string, any> = {
                id: clientData.id,
                name: clientData.name,
                status: clientData.status,
                contact_name: clientData.contact_name,
                email: clientData.email,
                phone: clientData.phone,
                address: clientData.address,
                updated_at: clientData.updated_at,
              };

              // Add new business fields - ONLY if they have data
              if (clientData.project_type) clientInfo.project_type = clientData.project_type;
              if (clientData.work_description) clientInfo.work_description = clientData.work_description;
              if (clientData.budget) clientInfo.budget = clientData.budget;
              if (clientData.project_dates) clientInfo.project_dates = clientData.project_dates;
              if (clientData.project_manager) clientInfo.project_manager = clientData.project_manager;
              if (clientData.pending_tasks) clientInfo.pending_tasks = clientData.pending_tasks;
              if (clientData.incidents) clientInfo.incidents_notes = clientData.incidents;
              if (clientData.last_contact) clientInfo.last_contact = clientData.last_contact;

              // List fields that are NOT registered in database
              const missingFields: string[] = [];
              if (!clientData.project_type) missingFields.push("tipo de proyecto");
              if (!clientData.work_description) missingFields.push("descripción del trabajo");
              if (!clientData.budget) missingFields.push("presupuesto");
              if (!clientData.project_dates) missingFields.push("fechas del proyecto");
              if (!clientData.project_manager) missingFields.push("responsable interno");
              if (!clientData.pending_tasks) missingFields.push("tareas pendientes");
              if (!clientData.last_contact) missingFields.push("último contacto");

              result = {
                success: true,
                client: clientInfo,
                missing_fields: missingFields.length > 0 ? missingFields : null,
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
              created_by: userName || "Usuario",
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
          model: "google/gemini-2.5-flash",
          messages: [
            ...messages,
            choice.message,
            ...toolResultMessages
          ],
          stream: true,
          max_tokens: 400,
        }),
      });

      if (!followUpResponse.ok) {
        throw new Error("Failed to get follow-up response");
      }

      // Stream the response with actions prepended
      const actionsPreamble = `data: ${JSON.stringify({ actions: executedActions })}\n\n`;
      const encoder = new TextEncoder();
      
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(encoder.encode(actionsPreamble));
          const reader = followUpResponse.body!.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        }
      });

      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // No tool calls - re-request with streaming
    const directStreamResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: true,
        max_tokens: 400,
      }),
    });

    if (!directStreamResponse.ok) {
      throw new Error("Failed to get streaming response");
    }

    return new Response(directStreamResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
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
