
# Plan: Notificación Automática al Agendar Reuniones

## Objetivo

Cuando el CEO (Juan) pida agendar una reunión a través de la IA, el sistema deberá:
1. Crear el evento en la agenda del CEO (ya funciona)
2. **NUEVO**: Crear automáticamente una nota/notificación para los empleados (María, Luis, Marta) que aparecerá en la campana de notificaciones del panel de Administración

---

## Flujo Actual

```text
CEO pide reunión → IA ejecuta create_event → Evento en tabla "events" → Agenda del CEO ✅
```

## Flujo Propuesto

```text
CEO pide reunión → IA ejecuta create_event → Evento en tabla "events" → Agenda del CEO ✅
                                           → Nota en tabla "notes" → Campana Admin ✅ (NUEVO)
```

---

## Cambios Necesarios

### 1. Modificar Edge Function `ai-chat/index.ts`

En el caso `create_event`, después de insertar el evento en la base de datos, añadir automáticamente una nota para el equipo:

**Ubicación**: Líneas 395-429 del archivo `supabase/functions/ai-chat/index.ts`

**Lógica a añadir**:
```typescript
// Después de crear el evento exitosamente...
// Crear notificación para el equipo
if (args.type === "meeting" || args.type === "call") {
  const eventTime = new Date(args.start_at).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  });
  const eventDate = new Date(args.start_at).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
  
  await supabase.from("notes").insert({
    text: `📅 Nueva reunión agendada por Juan: "${args.title}" el ${eventDate} a las ${eventTime}.${args.client_name ? ` Cliente: ${args.client_name}.` : ""}`,
    visible_to: "team",
    target_employee: null, // Visible para todos: María, Luis, Marta
    created_by: "Juan",
    status: "pending",
    due_at: args.start_at // La fecha del evento
  });
}
```

### 2. Actualizar System Prompt

Modificar el prompt del sistema para que la IA sepa que el CEO se llama Juan y que las reuniones generan notificaciones automáticas.

**Ubicación**: Líneas 137-163 del archivo `supabase/functions/ai-chat/index.ts`

**Cambio**: Añadir al prompt:
```text
El CEO se llama Juan. Los empleados del equipo son María, Luis y Marta.
Cuando crees una reunión, automáticamente se notificará al equipo.
```

---

## Resultado Esperado

| Acción del CEO | Resultado |
|----------------|-----------|
| "Agenda una reunión a las 12" | ✅ Evento en agenda de Juan |
|  | ✅ Notificación en campana de Admin |
| "Reunión con BlueSky mañana" | ✅ Evento con cliente asociado |
|  | ✅ Notificación con nombre del cliente |

---

## Detalle Técnico

### Tabla `notes` (estructura existente)
| Campo | Valor para notificación |
|-------|------------------------|
| `text` | "📅 Nueva reunión agendada por Juan: [título] el [fecha] a las [hora]." |
| `visible_to` | `team` (visible en campana de Admin) |
| `target_employee` | `null` (para todos) o específico (María/Luis/Marta) |
| `created_by` | `Juan` |
| `status` | `pending` |
| `due_at` | Fecha/hora del evento |

### Sincronización UI
El frontend ya escucha el evento `processia:noteCreated` que se dispara cuando la IA crea notas, por lo que la campana de notificaciones se actualizará automáticamente sin cambios adicionales.

---

## Archivos a Modificar

1. **`supabase/functions/ai-chat/index.ts`**
   - Actualizar el caso `create_event` para crear nota automática
   - Actualizar el system prompt con el nombre del CEO y empleados
