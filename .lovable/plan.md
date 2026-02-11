

## Plan: Corregir la IA para que consulte la base de datos y responda con datos reales

### Problema raiz

El AI responde "No tengo respuesta" porque:
1. El prompt dice "No inventes datos" pero NO le dice "SIEMPRE consulta la base de datos"
2. Gemini Flash interpreta las restricciones muy literalmente y decide no hacer nada
3. La linea "No muestres campos que no se pidieron" lo bloquea aun mas

### Solucion

**Archivo: `supabase/functions/ai-chat/index.ts`**

**Cambio 1: Reescribir el system prompt (lineas 137-170)**

Reemplazar el prompt actual por uno con instrucciones positivas que Gemini Flash interprete correctamente:

```text
Eres el asistente ejecutivo de Juan, CEO de Processia. Empleados: Maria, Luis, Marta.

CONSULTA DE DATOS:
- SIEMPRE usa las herramientas para consultar datos. NUNCA respondas de memoria.
- Si preguntan por un cliente, usa get_client_context.
- Si preguntan por estado general o "como esta todo", usa get_dashboard_summary.
- Si preguntan por la agenda o eventos, usa get_today_agenda.
- Si preguntan por notas, usa get_ceo_notes.
- Si preguntan que clientes estan criticos o necesitan atencion, usa get_clients_overview.
- NUNCA digas "No tengo respuesta". Siempre consulta primero.

RESPUESTAS:
- Responde de forma concisa con los datos obtenidos.
- Si preguntan un dato concreto (presupuesto, estado, telefono), da ese dato.
- Si hay algo critico, anade 1 linea con emoji de estado (rojo, naranja, amarillo, verde).
- Maximo 3-5 lineas salvo que pidan detalle completo.
- Confirmaciones de acciones: 1 linea con check.
- Dato no registrado en la base de datos: "No registrado".

FORMATO:
- Usa vinetas para listas.
- Emojis de estado: rojo critico, naranja atencion, amarillo pendiente, verde ok.

PROHIBIDO:
- No sugieras "llamar" ni acciones que no existan en la plataforma.
- No inventes datos. Solo usa lo que devuelven las herramientas.

EJECUCION:
- Si tienes la info para ejecutar una accion (crear evento, nota), ejecuta directamente.
- Tiempos relativos: "en media hora" = ahora + 30 min.

Hora actual: {current_time}
Fecha actual: {current_date}
```

**Cambio 2: Forzar tool_choice en la primera llamada (linea 222-226)**

Cambiar `tool_choice: "auto"` por `tool_choice: "required"` para que Gemini Flash SIEMPRE use al menos una herramienta. Esto garantiza que cada pregunta consulte la base de datos antes de responder.

Sin embargo, esto puede causar problemas en conversaciones casuales (ej: "gracias"). Para mitigarlo, se anadira una condicion: si el mensaje parece una pregunta sobre datos (clientes, agenda, notas, estado), se usa `tool_choice: "required"`. Si es conversacional, se usa `tool_choice: "auto"`.

```typescript
// Detectar si el mensaje requiere consulta de datos
const dataKeywords = [
  "cliente", "presupuesto", "estado", "critico", "agenda", "evento",
  "nota", "pendiente", "hoy", "resumen", "como esta", "que tengo",
  "cobrar", "incidencia", "proyecto", "reunion", "llamada", "contacto",
  "telefono", "email", "tarea", "fechas", "responsable", "atencion"
];
const lowerMessage = message.toLowerCase();
const needsData = dataKeywords.some(kw => lowerMessage.includes(kw));

// En la llamada:
tool_choice: needsData ? "required" : "auto"
```

### Detalle tecnico

```text
Cambios en lineas especificas:
- Lineas 137-170: Reemplazar system prompt completo
- Linea 225: Cambiar tool_choice de "auto" a logica condicional
- Anadir deteccion de keywords antes de la llamada API (~linea 212)
```

### Resultado esperado
- "Que cliente esta critico?" -> Consulta get_clients_overview, responde con los clientes en rojo/naranja
- "Presupuesto de Nexus Tech" -> Consulta get_client_context, responde solo el presupuesto
- "Que tengo hoy?" -> Consulta get_dashboard_summary, da resumen breve de agenda + alertas
- "Agenda una reunion manana a las 10" -> Ejecuta create_event directamente
- "Gracias" -> Responde sin consultar herramientas

