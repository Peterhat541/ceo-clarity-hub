

## Plan: Cambiar a Gemini Flash + prompt conciso

### Cambios

**Archivo: `supabase/functions/ai-chat/index.ts`**

**1. Modelo: `google/gemini-2.5-flash` en las 3 llamadas**
- Linea ~293 (tool calling)
- Linea ~750 (respuesta con tool results)
- Linea ~794 (streaming directo)

**2. Reescribir el system prompt (lineas 137-241)**

El prompt actual tiene ~100 lineas con plantillas rigidas que obligan a mostrar TODOS los campos siempre. Se reemplazara por uno de ~30 lineas con estas reglas:

- Responde SOLO lo que se pregunta
- Si piden presupuesto, da presupuesto. Si piden estado, da estado. Nada mas
- Si hay alerta critica relacionada con lo que se pregunta, anadela en 1 linea con emoji de estado
- No sugieras "llamar" ni acciones que no existan en la plataforma
- Usa formato estructurado (bullets, emojis de estado) pero solo para los datos pedidos
- Maximo 3-5 lineas salvo que pidan detalle completo
- Confirmaciones de acciones: 1 linea con check

**3. Anadir `max_tokens: 400`** a las llamadas de streaming para reforzar brevedad

### Resultado esperado
- Respuestas en 1-2 segundos (Gemini Flash es significativamente mas rapido)
- Respuestas de 2-5 lineas por defecto
- Solo muestra lo pedido + alerta si hay algo critico
- Sin sugerencias de acciones imposibles

