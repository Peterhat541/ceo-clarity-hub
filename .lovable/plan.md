

# Plan: Desplegar Edge Function con GPT-5

## Problema Detectado

El código **ya está actualizado** con `openai/gpt-5` en las líneas 215 y 621, pero los logs de Lovable AI muestran que todavía se está usando `gemini-3-flash-preview`.

**Causa:** La edge function necesita ser desplegada para que los cambios tomen efecto.

## Solución

### Paso 1: Forzar Redespliegue de la Edge Function

Necesito desplegar la función `ai-chat` para que use el nuevo modelo GPT-5.

**Archivo:** `supabase/functions/ai-chat/index.ts`
**Estado actual:** Código actualizado con `model: "openai/gpt-5"` ✅
**Estado desplegado:** Sigue usando Gemini (versión antigua)

### Verificación

Después del despliegue, cuando envíes un mensaje al chat:
- Los logs de Lovable AI deberían mostrar llamadas a `openai/gpt-5` (o `gpt-5`)
- Las respuestas deberían ser de ChatGPT, no de Gemini

## Archivos a Modificar

| Archivo | Acción |
|---------|--------|
| `supabase/functions/ai-chat/index.ts` | Forzar redespliegue (no cambios de código) |

## Resultado Esperado

Después del despliegue:
- En "Models" aparecerá `gpt-5` en lugar de `gemini-3-flash-preview`
- Las respuestas del asistente serán más precisas y con mejor razonamiento

