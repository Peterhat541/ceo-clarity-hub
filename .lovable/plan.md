

## Plan: Hacer que el ClientChatModal use streaming como AIChat

### Problema

El chat principal (`AIChat.tsx`) usa `fetch()` directo y parsea las respuestas SSE (streaming) correctamente. El **ClientChatModal** usa `supabase.functions.invoke()` que espera JSON, pero la edge function devuelve streaming SSE. Resultado: `data.message` es `undefined` y muestra "No tengo respuesta."

### Solucion

**Archivo: `src/components/ai/ClientChatModal.tsx`**

Reemplazar la llamada `supabase.functions.invoke("ai-chat", ...)` (lineas 272-330) por la misma logica de streaming que usa `AIChat.tsx`:

1. **Usar `fetch()` directo** en vez de `supabase.functions.invoke()`:
   - URL: `${SUPABASE_URL}/functions/v1/ai-chat`
   - Headers: Authorization con anon key, Content-Type

2. **Parsear la respuesta SSE con `getReader()`**:
   - Leer chunks del stream
   - Parsear lineas `data: {...}` para extraer `choices[0].delta.content`
   - Detectar el preamble de `actions` para disparar eventos de calendario/notas
   - Acumular el texto y actualizar el mensaje del asistente en tiempo real

3. **Crear mensaje asistente vacio al inicio** y actualizarlo conforme llega el texto (efecto streaming visual)

4. **Mantener** el guardado en DB, dispatch de eventos y manejo de errores

### Cambios especificos

```text
Lineas 271-344 de ClientChatModal.tsx:
- Eliminar: supabase.functions.invoke("ai-chat", ...)
- Eliminar: const assistantContent = data.message || "No tengo respuesta."
- Anadir: fetch() con headers de autorizacion
- Anadir: Reader SSE con logica identica a AIChat.tsx
- Anadir: Mensaje asistente que se actualiza en tiempo real
- Mantener: saveMessageToDb, dispatchEvent, manejo de errores
```

### Resultado esperado

- El modal de cliente mostrara respuestas en streaming (tiempo real)
- La IA consultara la base de datos con las herramientas (get_client_context, etc.)
- Podras hablar coloquialmente: "como va Nexus Tech?", "que le debemos?", "agenda una reunion con ellos"
- Respuestas con datos reales del cliente: presupuesto, estado, incidencias, tareas

