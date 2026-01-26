
# Plan: Migrar a ChatGPT (GPT-5) y Sincronizar Dashboard con IA

## Resumen Ejecutivo

Actualmente el sistema usa **Google Gemini 3 Flash**. Este plan migra a **OpenAI GPT-5** para mejor razonamiento y decisiones, además de sincronizar los datos mock del dashboard con la base de datos real.

---

## Fase 1: Cambiar Modelo de IA a GPT-5

### Cambio requerido
Modificar la Edge Function para usar GPT-5 en lugar de Gemini.

**Archivo:** `supabase/functions/ai-chat/index.ts`

**Cambio:**
```text
// Línea 215 - Cambiar de:
model: "google/gemini-3-flash-preview"

// A:
model: "openai/gpt-5"
```

**También en línea 585** (segunda llamada a la API).

### Consideraciones del modelo

| Aspecto | Gemini Flash | GPT-5 |
|---------|--------------|-------|
| Velocidad | Muy rápido | Más lento |
| Precisión | Buena | Excelente |
| Razonamiento | Básico | Avanzado |
| Costo | Bajo | Mayor |

**Recomendación alternativa:** `openai/gpt-5-mini` ofrece buen balance entre calidad y velocidad.

---

## Fase 2: Conectar Dashboard a Base de Datos Real

### Problema actual
El dashboard (`Index.tsx`) usa datos hardcoded:
- `clientsAttention` - Array mock con 3 clientes
- `recentIncidents` - Array mock con 3 incidencias
- `criticalDates` - Array mock con 2 fechas

Mientras la base de datos tiene:
- 5 clientes reales (Nexus Tech, BlueSky Ventures, etc.)
- 0 incidencias registradas
- 0 eventos en la tabla

### Solución
1. Reemplazar arrays mock por queries a Supabase
2. Poblar la base de datos con datos iniciales

**Archivo:** `src/pages/Index.tsx`

**Estructura de cambios:**
```text
// En lugar de datos mock:
const clientsAttention = [...]

// Usar queries:
const { data: clientsAttention } = await supabase
  .from("clients")
  .select("*")
  .in("status", ["red", "orange"])
  .order("status");

const { data: recentIncidents } = await supabase
  .from("client_history")
  .select("*, clients(name)")
  .eq("type", "incident")
  .order("created_at", { ascending: false })
  .limit(5);
```

---

## Fase 3: Poblar Base de Datos con Datos Iniciales

### Datos a insertar

**Incidencias (client_history):**
- Nexus Tech: "Error en facturación enero - pendiente resolución"
- Global Media: "Cambio de alcance solicitado - valorar"
- CoreData: "Retraso en entrega de contenidos"

**Eventos para hoy:**
- "Llamada seguimiento Nexus Tech" - 10:00
- "Reunión trimestral BlueSky" - 16:00

**Notas del equipo:**
- De María: "Revisar propuesta Global Media antes de enviar"
- De Carlos: "Entrega Startup Lab confirmada para viernes"

---

## Fase 4: UI Snapshot para Sincronización Inmediata

Mientras se migran los datos, implementar snapshot que envía el estado visible al AI.

**Archivo:** `src/components/ai/AIChat.tsx`

**Lógica:**
```text
// Capturar estado actual antes de enviar
const uiSnapshot = {
  todayEvents: getTodayEvents(),
  pendingNotes: getTodayCEONotes(),
  incidents: recentIncidents, // Del context o props
  clientsAttention: clientsAttention
};

// Enviar con el mensaje
supabase.functions.invoke("ai-chat", {
  body: { message, uiSnapshot, ... }
});
```

**Archivo:** `supabase/functions/ai-chat/index.ts`

**Lógica:**
```text
// En get_dashboard_summary, priorizar snapshot si existe
if (uiSnapshot?.todayEvents?.length > 0) {
  // Usar datos del snapshot
  result.summary.todayEvents = uiSnapshot.todayEvents;
}
```

---

## Fase 5: Sincronización en Tiempo Real (Opcional)

Usar Supabase Realtime para que los cambios de la IA aparezcan instantáneamente.

**Migración SQL:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_history;
```

**En componentes:**
```text
supabase
  .channel('events-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, 
      () => refetchEvents())
  .subscribe();
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/ai-chat/index.ts` | Cambiar modelo a `openai/gpt-5`, procesar uiSnapshot |
| `src/pages/Index.tsx` | Conectar a Supabase, eliminar datos mock |
| `src/components/ai/AIChat.tsx` | Enviar uiSnapshot con estado visible |
| `src/contexts/EventContext.tsx` | Migrar a datos de Supabase |
| `src/contexts/NoteContext.tsx` | Migrar a datos de Supabase |

---

## Orden de Implementación

1. **Cambiar modelo a GPT-5** (5 min)
   - Modificar edge function

2. **Poblar base de datos** (5 min)
   - Insertar incidencias de ejemplo
   - Insertar eventos de ejemplo
   - Insertar notas de ejemplo

3. **Conectar Index.tsx a Supabase** (15 min)
   - Reemplazar arrays mock
   - Añadir useEffect con queries

4. **Implementar UI Snapshot** (10 min)
   - Modificar AIChat.tsx
   - Actualizar edge function

5. **Opcional: Tiempo real** (10 min)
   - Activar realtime en tablas
   - Añadir listeners en componentes

---

## Resultado Esperado

Después de implementar:

**CEO pregunta:** "¿Qué tengo que hacer hoy?"

**IA responde:**
```text
Buenos días. Aquí tienes el resumen del día:

📅 **Agenda:**
- 10:00 - Llamada seguimiento Nexus Tech
- 16:00 - Reunión trimestral BlueSky

⚠️ **Clientes críticos:**
- 🔴 Nexus Tech - Incidencia de facturación sin resolver (3 días abierta)
- 🟠 Global Media - Solicitud de llamada urgente pendiente

📝 **Notas del equipo:**
- María: "Revisar propuesta Global Media antes de enviar"
- Carlos: "Entrega Startup Lab confirmada para viernes"

¿Quieres que te conecte con algún cliente o agende algo?
```

---

## Información Técnica

**Modelo actual:** `google/gemini-3-flash-preview`
**Modelo destino:** `openai/gpt-5` o `openai/gpt-5-mini`
**API Gateway:** Lovable AI Gateway (no requiere API key adicional)
**Function calling:** Compatible con ambos modelos
