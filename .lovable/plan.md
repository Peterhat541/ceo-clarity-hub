

## Plan: Corregir navegación al historial de conversaciones

### Problema
Al hacer clic en una conversación del historial, se muestra la pantalla de bienvenida ("Hola Carlos, soy tu IA") en vez de los mensajes de esa conversación. Dos bugs:

1. **`showWelcome` demasiado agresivo** en `AIChat.tsx` línea 231: `messages.length <= 1` muestra welcome incluso con 1 mensaje real cargado. Debería solo mostrar welcome cuando el único mensaje es el de bienvenida.

2. **`saveMessage` usa `activeConversationId` stale** en `AIChatContext.tsx`: el `useCallback` captura el valor anterior de `activeConversationId` por el closure, así que tras crear una conversación nueva con `ensureConversation`, `saveMessage` todavía ve `null`.

### Cambios

**`src/components/ai/AIChat.tsx`** — Línea 231:
- Cambiar condición de `showWelcome` a: solo mostrar welcome cuando hay exactamente 1 mensaje y su `id === "welcome"`, o cuando no hay mensajes.
```ts
const showWelcome = messages.length === 0 || (messages.length === 1 && messages[0].id === "welcome");
```

**`src/contexts/AIChatContext.tsx`** — Corregir closure stale:
- Usar un `ref` para `activeConversationId` que `saveMessage` pueda leer siempre el valor actual, en vez de depender del closure del `useCallback`.
- Actualizar `saveMessage` para leer de `activeConversationIdRef.current`.

