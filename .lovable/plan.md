

# Plan: Chats de IA Independientes por Cliente en Modales

## Objetivo

Permitir al CEO abrir múltiples ventanas de chat de IA simultáneas, una para cada cliente. Al hacer clic en un cliente, se abre un modal centrado con un chat de IA dedicado exclusivamente a ese cliente.

---

## Arquitectura Actual vs. Nueva

```text
ACTUAL:
+------------------+-------------------+
|    Dashboard     |  Chat IA (único)  |
|                  |    [Sidebar]      |
|   [Clientes]     |                   |
+------------------+-------------------+

NUEVO:
+------------------+-------------------+
|    Dashboard     |  Chat IA General  |
|                  |    [Sidebar]      |
|   [Click en      |                   |
|    cliente] ---> | +---------------+ |
|                  | | Modal Chat    | |
|                  | | Cliente X     | |
|                  | +---------------+ |
+------------------+-------------------+
```

---

## Cambios Técnicos

### 1. Nuevo Componente: ClientChatModal

Crear un componente de modal que contenga una instancia independiente del chat de IA.

**Archivo nuevo:** `src/components/ai/ClientChatModal.tsx`

**Características:**
- Recibe `clientId`, `clientName`, `clientStatus` e `issue` como props
- Mantiene su propio estado de mensajes y conversación (independiente del sidebar)
- Usa el mismo endpoint de Edge Function `ai-chat` pero con contexto fijo del cliente
- Modal centrado usando Dialog de Radix UI
- Header con nombre del cliente y estado (color)
- Botón para cerrar el modal

### 2. Refactorizar AIChat para ser Reutilizable

Crear una versión base del chat que pueda usarse tanto en el sidebar como en modales.

**Opción A - Componente Base:**
Extraer la lógica del chat a un componente `ChatInstance` que:
- Acepta props opcionales: `clientId`, `clientName`, `isModal`
- Gestiona su propio estado de mensajes
- No depende de `ClientContext` (contexto se pasa por props)

**Opción B - Duplicar con Simplificación:**
Crear `ClientChatModal` como componente independiente que:
- Copia la lógica esencial de `AIChat`
- Elimina la dependencia del contexto global
- Fija el cliente al inicio y no permite cambiarlo

**Recomendación:** Opción B para velocidad de implementación y menor riesgo de romper el chat existente del sidebar.

### 3. Gestión de Múltiples Modales Abiertos

**Archivo:** `src/pages/Index.tsx` o nuevo contexto

**Lógica:**
```text
Estado: openChats = [
  { clientId: "uuid-1", clientName: "Nexus Tech", status: "red", issue: "..." },
  { clientId: "uuid-2", clientName: "Global Media", status: "orange", issue: "..." }
]

Cada entrada renderiza un <ClientChatModal /> independiente
```

**Alternativa simple (un modal a la vez):**
- Mantener un solo estado `activeChatClient`
- Solo un modal abierto simultáneamente (más sencillo de implementar inicialmente)

### 4. Modificar Flujo de Click en Cliente

**Archivos a modificar:**
- `src/components/dashboard/ClientCard.tsx` - Ya tiene `onClick` y `onAIClick`
- `src/pages/Index.tsx` - Cambiar `handleClientClick` para abrir modal

**Nuevo flujo:**
1. Usuario hace clic en ClientCard
2. Se abre `ClientChatModal` con los datos del cliente
3. El chat del modal es independiente del sidebar
4. El sidebar sigue disponible para consultas generales

---

## Diseño Visual del Modal

```text
+--------------------------------------------+
|  [●] Nexus Tech                        [X] |
|  Estado: Crítico                           |
+--------------------------------------------+
|                                            |
|  Mensaje de bienvenida del asistente       |
|  con contexto del cliente cargado...       |
|                                            |
|  +--------------------------------------+  |
|  | Usuario: ¿Cuál es la situación?     |  |
|  +--------------------------------------+  |
|                                            |
|  +--------------------------------------+  |
|  | IA: Nexus Tech tiene una incidencia |  |
|  | de facturación abierta hace 3 días. |  |
|  +--------------------------------------+  |
|                                            |
+--------------------------------------------+
|  [   Escribe tu mensaje...       ] [Enviar]|
+--------------------------------------------+
```

**Estilo del modal:**
- Tamaño: `max-w-2xl` (640px) para dar espacio al chat
- Altura: `max-h-[80vh]` con scroll interno
- Fondo oscuro consistente con el tema
- Sin overlay oscuro completo (permitir ver dashboard detrás)

---

## Archivos a Crear/Modificar

| Archivo | Acción |
|---------|--------|
| `src/components/ai/ClientChatModal.tsx` | **NUEVO** - Modal con chat independiente |
| `src/pages/Index.tsx` | Modificar para gestionar modal de chat por cliente |
| `src/components/dashboard/ClientCard.tsx` | Actualizar onClick para abrir modal |
| `src/components/dashboard/ClientPopup.tsx` | Opcional: Reemplazar botón IA por abrir chat directo |

---

## Flujo de Implementación

### Paso 1: Crear ClientChatModal
- Componente con Dialog de Radix
- Chat simplificado con contexto fijo del cliente
- Llamadas independientes a la Edge Function

### Paso 2: Integrar en Index.tsx
- Añadir estado para cliente activo en modal
- Renderizar `ClientChatModal` cuando hay cliente seleccionado

### Paso 3: Actualizar ClientCard
- Modificar `onClick` para abrir el modal de chat
- Mantener `onAIClick` como alternativa (o eliminarlo si es redundante)

### Paso 4: Opcional - Múltiples Modales
- Cambiar estado de un cliente a array de clientes
- Renderizar múltiples modales (posicionamiento flotante)

---

## Consideraciones

**Rendimiento:**
- Cada modal mantiene su propio historial de conversación
- Las conversaciones no persisten al cerrar el modal (MVP)
- Futuro: Persistir conversaciones en base de datos

**UX:**
- El sidebar sigue disponible para consultas generales
- Los modales son independientes entre sí
- Cerrar un modal no afecta otros modales ni el sidebar

**Persistencia futura:**
- Añadir tabla `client_conversations` para guardar historial por cliente
- Cargar conversación previa al abrir modal

---

## Resultado Esperado

1. CEO hace clic en "Nexus Tech"
2. Aparece modal centrado con chat de IA
3. Header muestra "Nexus Tech 🔴 Crítico"
4. Chat carga automáticamente contexto del cliente
5. CEO puede chatear sobre Nexus Tech
6. Mientras tanto, puede abrir otro modal para "Global Media"
7. Cada conversación es independiente

