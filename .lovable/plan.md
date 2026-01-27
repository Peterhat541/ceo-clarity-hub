
# Plan: Reorganizar Secciones del Dashboard

## Objetivo

Reorganizar las secciones del dashboard móvil:
1. **Funcionalidades** → Mostrar las tarjetas de clientes que requieren atención (estilo visual de la imagen)
2. **Mi Espacio** (círculos) → Cambiar a: Agenda, Notas, Incidencias, Fechas críticas

---

## Cambios Visuales

### Antes
| Sección | Contenido |
|---------|-----------|
| Funcionalidades | Lista vertical (Agenda, Clientes, Notas, Enviar instrucción) |
| Mi Espacio | Iconos circulares (Agenda, Incidencias, Clientes, Fechas) |

### Después
| Sección | Contenido |
|---------|-----------|
| Clientes que requieren atención | Grid horizontal de tarjetas ClientCard (estilo oscuro como la imagen) |
| Mi Espacio | Iconos circulares (Agenda, Notas, Incidencias, Fechas críticas) |

---

## Diseño de Tarjetas de Clientes

Cada tarjeta tendrá el estilo de la imagen de referencia:

```text
┌─────────────────────────────────────┐
│ [🏢]  Nexus Tech              [●]   │  ← Indicador estado (rojo/naranja)
│       2 proyectos activos           │
│                                     │
│ ⚠ Incidencia de facturación...     │  ← Descripción del problema
│                                     │
│ ⏰ Hace 3 días          [✨ IA]    │  ← Tiempo + Botón IA
└─────────────────────────────────────┘
```

- Fondo oscuro (bg-card con borde)
- Indicador de estado en esquina (rojo pulsante para críticos)
- Icono de edificio + nombre + proyectos activos
- Descripción del problema en recuadro
- Tiempo transcurrido + botón "IA" para acceder al chat

---

## Archivos a Modificar

### 1. `src/components/dashboard/MobileHome.tsx`

**Cambios:**

1. **Reemplazar sección "Funcionalidades"** por:
   - Título: "Clientes que requieren atención"
   - Grid horizontal scrollable con componentes `ClientCard`
   - Cada tarjeta abre el chat de IA del cliente al pulsar "IA"

2. **Actualizar quickAccessItems** (Mi Espacio):
   - Agenda → Abre popup de agenda
   - Notas → Abre popup de notas del equipo + enviar instrucción
   - Incidencias → Abre popup de incidencias activas
   - Fechas → Abre popup de fechas críticas

3. **Importar ClientCard** del componente existente

---

## Detalle de Implementación

### Nueva sección "Clientes que requieren atención"

```tsx
<section className="mb-6">
  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
    Clientes que requieren atención
  </h2>
  <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
    {clientsAttention.map((client) => (
      <div key={client.name} className="min-w-[280px] flex-shrink-0">
        <ClientCard
          name={client.name}
          status={client.status}
          lastActivity={client.lastActivity}
          issue={client.issue}
          projectCount={client.projectCount}
          onAIClick={() => handleClientClick(client)}
        />
      </div>
    ))}
  </div>
</section>
```

### Nuevos quickAccessItems (Mi Espacio)

```tsx
const quickAccessItems = [
  {
    icon: <Calendar className="h-7 w-7 text-primary" />,
    label: "Agenda",
    bgClass: "bg-primary/10",
    onClick: () => setAgendaOpen(true),
    badge: todayEvents.length,
  },
  {
    icon: <MessageSquare className="h-7 w-7 text-status-purple" />,
    label: "Notas",
    bgClass: "bg-status-purple/10",
    onClick: () => setNotesOpen(true),
    badge: pendingNotes.length,
  },
  {
    icon: <AlertTriangle className="h-7 w-7 text-status-orange" />,
    label: "Incidencias",
    bgClass: "bg-status-orange/10",
    onClick: () => setIncidentsOpen(true),
    badge: recentIncidents.length,
  },
  {
    icon: <CalendarDays className="h-7 w-7 text-status-red" />,
    label: "Fechas",
    bgClass: "bg-status-red/10",
    onClick: () => setDatesOpen(true),
    badge: criticalDates.length,
  },
];
```

---

## Estilo Visual de las Tarjetas

El componente `ClientCard` ya existente tiene el estilo correcto:
- Fondo oscuro con borde
- Indicador de estado en la esquina
- Icono de edificio + nombre
- Área de descripción del problema
- Tiempo + botón "IA"

Solo necesita ajustar los colores para que se vea bien con el nuevo tema claro del fondo.

---

## Resultado Esperado

```text
┌────────────────────────────────────────────────────────────┐
│  Hola, Juan!                                               │
│  ¿Cómo va el día de hoy?                                   │
│                                                            │
│  [══════════ AI Hero Card ═══════════]                     │
│                                                            │
│  CLIENTES QUE REQUIEREN ATENCIÓN                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Nexus Tech  │  │ Global Media │  │  Startup Lab │  →   │
│  │  2 proyectos │  │  1 proyecto  │  │  3 proyectos │      │
│  │  ⚠ Inciden..│  │  ⚠ Solicitud.│  │  ⚠ Fecha lím │      │
│  │ 3d    [IA]  │  │ 1d    [IA]  │  │ 2d    [IA]  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                    (scroll horizontal)      │
│                                                            │
│  MI ESPACIO                                                │
│    ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                      │
│    │ 📅  │  │ 💬  │  │ ⚠️  │  │ 📆  │                      │
│    │Agend│  │Notas│  │Incid│  │Fecha│                      │
│    └─────┘  └─────┘  └─────┘  └─────┘                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Archivos Afectados

1. **`src/components/dashboard/MobileHome.tsx`**
   - Importar `ClientCard`
   - Reemplazar sección Funcionalidades por grid horizontal de ClientCards
   - Actualizar quickAccessItems con los 4 nuevos iconos

2. **`src/components/dashboard/ClientCard.tsx`** (ajuste menor)
   - Asegurar que el fondo oscuro se vea bien sobre fondo claro
   - Ajustar clase `bg-card` para tema claro si es necesario
