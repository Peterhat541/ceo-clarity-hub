

## Plan: Sistema multiusuario con historial de chat individual

### Resumen
Crear un sistema donde cada empleado (Carlos, Pedro, María, Paula) tiene su propio perfil con chat personalizado. Comparten todos los datos (clientes, eventos, notas) pero cada uno tiene su historial de conversación separado. Incluye formulario para crear nuevos usuarios con nombre, rol e instrucciones para la IA.

### Cambios en la base de datos

**Nueva tabla `app_users`:**
- `id` (uuid, PK)
- `name` (text) — nombre del empleado
- `role` (text) — rol en la empresa (ej: "Director comercial")
- `ai_instructions` (text) — cómo quiere que actúe la IA (ej: "Sé directo y usa datos")
- `avatar_color` (text) — color para identificar visualmente
- `created_at` (timestamp)

**Nueva tabla `user_chat_messages`:**
- `id` (uuid, PK)
- `user_id` (uuid, FK → app_users)
- `role` (text) — "user" o "assistant"
- `content` (text)
- `client_context` (text, nullable)
- `created_at` (timestamp)

Insertar los 4 usuarios iniciales: Carlos, Pedro, María, Paula.

### Cambios en frontend

1. **Nuevo contexto `UserContext`** — almacena el usuario activo seleccionado, lo persiste en `sessionStorage`

2. **Pantalla de selección de usuario** — al entrar (después del código demo), si no hay usuario seleccionado, muestra tarjetas con cada empleado para elegir quién eres. Botón "Crear nuevo usuario" abre formulario con campos: nombre, rol, instrucciones para la IA

3. **`AIChatContext`** — modificar para cargar/guardar mensajes en `user_chat_messages` según el usuario activo. Al cambiar de usuario, carga su historial

4. **`AIChat.tsx`** — el saludo cambia dinámicamente: "Hola, {nombre}" según el usuario activo

5. **`HeaderNavigation.tsx`** — mostrar el nombre del usuario activo en lugar de "Carlos Ruiz" hardcodeado. Añadir opción para cambiar de usuario

6. **Edge function `ai-chat`** — recibir `userId` y `userName` + `userRole` + `aiInstructions`. Personalizar el system prompt con esos datos. Guardar mensajes en `user_chat_messages`

### Flujo
```text
Demo code → Seleccionar usuario → Dashboard con chat personalizado
                ↓
        [Crear nuevo usuario]
        → Nombre: ____
        → Rol: ____
        → ¿Cómo quieres que actúe la IA?: ____
        → Guardar → Seleccionar automáticamente
```

