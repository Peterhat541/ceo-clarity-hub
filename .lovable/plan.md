
# Plan: Restaurar Vista CEO Desktop al Diseño Original

## Objetivo
Reconstruir exactamente el diseño mostrado en la captura de pantalla, ya que el botón de restaurar del historial no funciona.

## Diferencias Identificadas

### Diseño Actual vs Diseño Objetivo

| Elemento | Actual | Objetivo (captura) |
|----------|--------|-------------------|
| Header | Logo + "Buenos días, Juan" + fecha | Logo + "Buenos días" + barra de búsqueda |
| Métricas | Iconos horizontales pequeños | Tarjetas verticales con número grande y subtítulo detallado |
| Clientes | Lista vertical de 3 columnas | **Fila horizontal** de tarjetas |
| Mi Espacio | No existe | Agenda + Notas del equipo + botón "Enviar nota" |
| Chat IA | Header con "Pregúntame lo que necesites" | Header con "Tu mano derecha ejecutiva" |

## Cambios Técnicos

### Archivo: `src/components/dashboard/DesktopCEODashboard.tsx`

#### 1. Header
- Mantener logo de Processia
- Cambiar "Buenos días, Juan" por solo "Buenos días"
- Añadir barra de búsqueda de clientes debajo del saludo
- Eliminar la fecha del lado derecho

#### 2. Tarjetas de Métricas (4 columnas)
Cambiar el diseño de cada tarjeta para que tenga:
- Icono pequeño en la esquina superior izquierda
- Número grande debajo
- Título del métrica (ej: "Hoy", "Incidencias", "Clientes en rojo", "Fechas críticas")
- Subtítulo descriptivo: "Hoy · 3 incidencias · 1 en rojo · 2 fechas"

Colores por tarjeta:
- Hoy: Teal/Primary (sparkle icon)
- Incidencias: Púrpura (warning icon)
- Clientes en rojo: Naranja (triangle icon)
- Fechas críticas: Gris (calendar icon)

#### 3. Sección de Clientes
- Título: "Clientes que requieren atención"
- Cambiar de grid vertical a **flex horizontal** con tarjetas lado a lado
- Cada tarjeta muestra: icono, nombre, proyectos activos, indicador de estado, issue, tiempo, botón IA

#### 4. Sección "Mi Espacio" (Nueva)
Añadir debajo de clientes:
- Dos bloques rectangulares horizontales:
  - "Agenda" con icono de reloj + "X evento hoy" + badge con número
  - "Notas del equipo" con icono de mensaje + "X pendientes" + badge con número
- Botón full-width: "Enviar nota al equipo" (fondo teal claro)

#### 5. Panel de Chat IA
- Mantener header pero cambiar subtítulo a "Tu mano derecha ejecutiva"
- El resto del chat permanece igual

## Estructura Visual Final

```text
┌────────────────────────────────────────────────────────────────────────────┐
│  [Logo]  Buenos días                                        │              │
│          ┌──────────────────────────────────┐               │  Asistente   │
│          │ Q  Buscar cliente...             │               │      IA      │
│          └──────────────────────────────────┘               │              │
├─────────────────────────────────────────────────────────────┤  Tu mano     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │  derecha     │
│  │ ✧        │ │ ⚠        │ │ △        │ │ 📅       │        │  ejecutiva   │
│  │ 3        │ │ 3        │ │ 1        │ │ 2        │        │              │
│  │ Hoy      │ │Incidenc. │ │ Clientes │ │ Fechas   │        │  [Chat]      │
│  │ Hoy·3... │ │ Hoy·3... │ │ en rojo  │ │ críticas │        │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │              │
├─────────────────────────────────────────────────────────────┤              │
│  Clientes que requieren atención                            │              │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐   │              │
│  │ Nexus Tech   ● │ │ Global Media ● │ │ Startup Lab  ● │   │              │
│  │ 2 proyectos    │ │ 1 proyecto     │ │ 3 proyectos    │   │              │
│  │ ⚠ Incidencia...│ │ ⚠ Solicitud... │ │ ⚠ Fecha límite │   │              │
│  │ Hace 3d   [IA] │ │ Hace 1d   [IA] │ │ Hace 2d   [IA] │   │              │
│  └────────────────┘ └────────────────┘ └────────────────┘   │              │
├─────────────────────────────────────────────────────────────┤              │
│  ┌─────────────────────────┐ ┌─────────────────────────┐    │              │
│  │ 🕐 Agenda          [1]  │ │ 💬 Notas del equipo [2] │    │              │
│  │    1 evento hoy         │ │    2 pendientes         │    │              │
│  └─────────────────────────┘ └─────────────────────────┘    │              │
│  ┌──────────────────────────────────────────────────────┐   │              │
│  │           ✈ Enviar nota al equipo                    │   │              │
│  └──────────────────────────────────────────────────────┘   │              │
├────────────────────────────────────────────────────────────────────────────┤
│              [Vista CEO]  [Administración]                                 │
└────────────────────────────────────────────────────────────────────────────┘
```

## Archivos a Modificar

1. **`src/components/dashboard/DesktopCEODashboard.tsx`** - Reestructuración completa del layout

## Detalles de Implementación

### Clases CSS Clave
- Contenedor principal: `h-full min-h-0 w-full flex overflow-hidden`
- Panel izquierdo de contenido: `flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden`
- Panel de chat: `w-[400px] border-l border-border bg-card flex flex-col shrink-0`
- Tarjetas de clientes: `flex gap-4` (horizontal, no vertical)
- Botón enviar nota: `w-full bg-primary/10 hover:bg-primary/20 text-primary`

### Estado y Funcionalidad
- Mantener todos los estados existentes (agendaOpen, notesOpen, selectedClient)
- Añadir estado `sendNoteOpen` para el popup de enviar nota
- Importar `SendNotePopup` existente
- Añadir barra de búsqueda con estado `searchQuery` (funcionalidad visual por ahora)
