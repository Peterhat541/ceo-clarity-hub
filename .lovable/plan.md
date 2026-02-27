

## Plan: Sistema de conversaciones múltiples estilo ChatGPT

### Resumen
Convertir el chat actual (un único hilo de mensajes por usuario) en un sistema de conversaciones múltiples, donde cada usuario puede crear nuevas conversaciones y navegar entre ellas desde el historial del sidebar.

### 1. Base de datos — Nueva tabla `conversations`

```sql
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id),
  title text NOT NULL DEFAULT 'Nueva conversación',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Añadir columna conversation_id a user_chat_messages
ALTER TABLE user_chat_messages 
  ADD COLUMN conversation_id uuid REFERENCES conversations(id);

-- RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);
```

### 2. `AIChatContext.tsx` — Gestión de conversaciones

- Añadir estado: `activeConversationId`, `conversationsList` (lista de `{id, title, updated_at}`)
- Cargar lista de conversaciones del usuario al montar
- `createNewConversation()`: inserta en `conversations`, limpia mensajes, establece como activa
- `switchConversation(id)`: carga mensajes de esa conversación, actualiza estado
- Al enviar mensaje, si no hay conversación activa, crear una automáticamente
- Auto-generar título de conversación a partir del primer mensaje del usuario (primeros 40 chars)
- `saveMessage` ahora incluye `conversation_id`

### 3. `DesktopCEODashboard.tsx` — UI

**Botón "Nueva conversación"** (línea 275-277):
- Reemplazar el icono Settings por un botón con icono `Plus` y texto "Nueva conversación"
- Al hacer clic, llama a `createNewConversation()` del contexto

**Sidebar "Historial"** (líneas 234-246):
- En lugar de mostrar mensajes individuales, mostrar la lista de conversaciones (`conversationsList`)
- Cada entrada muestra el título de la conversación y la fecha
- Al hacer clic en una, llama a `switchConversation(id)`
- La conversación activa se resalta visualmente

### 4. `AIChat.tsx` — Adaptación

- El `showWelcome` se muestra cuando no hay conversación activa o la conversación activa no tiene mensajes
- Al enviar un mensaje desde welcome, se crea automáticamente una conversación nueva

### Archivos afectados
- Nueva migración SQL (tabla `conversations` + columna en `user_chat_messages`)
- `src/contexts/AIChatContext.tsx` — lógica de conversaciones
- `src/components/dashboard/DesktopCEODashboard.tsx` — sidebar historial + botón nueva conversación
- `src/components/ai/AIChat.tsx` — adaptar welcome/envío

