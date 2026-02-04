
# Plan: Layout Móvil con Chat Completo + Home Rediseñado + Navegación Header

## Resumen

Este plan implementa tres cambios principales:
1. **Móvil**: Chat de IA completo visible (como en desktop), sin necesidad de tocar para iniciar
2. **Home rediseñado**: Logo grande + slogan "Menos conversaciones. Más control." en verde
3. **Navegación en header**: Botones Vista CEO / Administración junto al logo (plan previo)

---

## Parte 1: Rediseño de la Pantalla Home

### Cambios solicitados

| Actual | Nuevo |
|--------|-------|
| Logo pequeño (h-12) | Logo mucho más grande (h-24 o similar) |
| "Hola, Juan 👋" | **Slogan**: "Menos conversaciones. Más control." |
| Color título: blanco | **Color slogan**: #25E0B7 (primary) |
| Subtítulo: "Selecciona un modo de trabajo" | Mantener igual |

### Diseño visual nuevo

```text
┌─────────────────────────────────────────────────────┐
│                                                     │
│                                                     │
│              ┌─────────────────┐                    │
│              │   PROCESSIA     │  ← Logo GRANDE     │
│              │     (logo)      │    (h-24 o más)    │
│              └─────────────────┘                    │
│                                                     │
│     Menos conversaciones. Más control.              │  ← Slogan en #25E0B7
│         (tamaño text-4xl, font-bold)               │
│                                                     │
│         Selecciona un modo de trabajo               │  ← Subtítulo gris
│                                                     │
│   ┌───────────────────┐  ┌───────────────────┐     │
│   │    VISTA CEO      │  │  ADMINISTRACIÓN   │     │
│   └───────────────────┘  └───────────────────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Home.tsx` | Agrandar logo, reemplazar "Hola, Juan" por slogan en color primary |

---

## Parte 2: Layout Móvil con Chat Completo

### Situación actual
- En móvil hay un botón "Asistente IA" que abre un modal con el chat
- El usuario quiere que el chat esté visible directamente, como en desktop

### Nuevo diseño móvil

El layout móvil será similar al desktop: una vista dividida donde el chat de IA está siempre visible, con los clientes críticos debajo.

```text
┌────────────────────────────────────────┐
│  Buenas tardes, Juan!                  │  ← Header compacto
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  🤖 Asistente IA                 │  │  ← Título IA
│  │                                  │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │  Mensajes del chat...      │  │  │  ← AIChat component
│  │  │  (scrollable)              │  │  │     completo
│  │  │                            │  │  │
│  │  └────────────────────────────┘  │  │
│  │  ┌──────────────────────┬───┐   │  │
│  │  │ Escribe aquí...      │🎤│   │  │  ← Input + mic
│  │  └──────────────────────┴───┘   │  │
│  └──────────────────────────────────┘  │
│                                        │
├────────────────────────────────────────┤
│  CLIENTES CRÍTICOS          Ver todos  │  ← Sección clientes
│  ● Nexus Tech      3d      ✨          │     (compacta)
│  ● Global Media    1d      ✨          │
├────────────────────────────────────────┤
│  📅      💬      ⚠️       📆          │  ← Quick Access
└────────────────────────────────────────┘
```

### Distribución del espacio

- **AIChat**: Ocupa ~60% del espacio vertical disponible
- **Clientes**: Ocupa ~25% con scroll interno
- **Quick Access**: Footer fijo

### Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/dashboard/MobileHome.tsx` | Eliminar modal, integrar AIChat directamente en el layout |

---

## Parte 3: Navegación en Header (Desktop)

### Cambios

Mover la navegación del ViewSwitcher (bottom) al header (top), junto al logo.

### Nuevo diseño del header

```text
┌─────────────────────────────────────────────────────────────────┐
│  [Logo clickeable]  [Vista CEO] [Administración]   Buenas · 4 Feb │
│       ↓                  ↓            ↓                         │
│    va a /         activo=verde   activo=verde                   │
└─────────────────────────────────────────────────────────────────┘
```

- Click en logo → navega a `/` (Home)
- Botón activo: `bg-primary text-primary-foreground rounded-full`
- Botón inactivo: `text-muted-foreground`

### Archivos a crear/modificar

| Archivo | Acción | Cambio |
|---------|--------|--------|
| `src/components/layout/HeaderNavigation.tsx` | **Crear** | Componente con logo + botones de navegación |
| `src/components/dashboard/DesktopCEODashboard.tsx` | Modificar | Usar HeaderNavigation, quitar ViewSwitcher |
| `src/pages/Admin.tsx` | Modificar | Usar HeaderNavigation, quitar ViewSwitcher |
| `src/components/layout/ViewSwitcher.tsx` | Eliminar o dejar solo para móvil | Ya no se usa en desktop |

---

## Detalles Técnicos

### 1. Home.tsx - Cambios específicos

```tsx
// Logo grande
<img src={processiaLogo} className="h-24 object-contain" />

// Slogan en lugar de saludo
<h1 className="text-4xl font-bold text-primary">
  Menos conversaciones. Más control.
</h1>

// Subtítulo mantiene igual
<p className="text-muted-foreground text-lg">
  Selecciona un modo de trabajo
</p>
```

### 2. MobileHome.tsx - Estructura nueva

```tsx
<div className="h-screen flex flex-col">
  {/* Header compacto */}
  <header>...</header>
  
  {/* AI Chat - Ocupa espacio principal */}
  <div className="flex-1 min-h-0 flex flex-col">
    <AIChat />  {/* Directamente, sin modal */}
  </div>
  
  {/* Clientes críticos - Sección compacta */}
  <div className="h-[180px] shrink-0">
    <ClientCard compact ... />
  </div>
  
  {/* Quick Access Footer */}
  <QuickAccessGrid />
</div>
```

### 3. HeaderNavigation.tsx - Nuevo componente

```tsx
export function HeaderNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isCEO = location.pathname === "/ceo";
  const isAdmin = location.pathname === "/admin";

  return (
    <header className="h-14 border-b flex items-center justify-between px-6">
      {/* Logo clickeable → Home */}
      <div className="flex items-center gap-4">
        <img 
          src={processiaLogo} 
          onClick={() => navigate("/")}
          className="h-8 cursor-pointer" 
        />
        
        {/* Navigation buttons */}
        <div className="flex items-center bg-secondary rounded-full p-1">
          <button className={isCEO ? "bg-primary ..." : "..."}>
            Vista CEO
          </button>
          <button className={isAdmin ? "bg-primary ..." : "..."}>
            Administración
          </button>
        </div>
      </div>
      
      {/* Date/greeting */}
      <span>Buenas tardes · 4 Feb</span>
    </header>
  );
}
```

---

## Orden de Implementación

1. **Modificar `src/pages/Home.tsx`** - Logo grande + slogan en primary
2. **Crear `src/components/layout/HeaderNavigation.tsx`** - Navegación en header
3. **Modificar `src/components/dashboard/DesktopCEODashboard.tsx`** - Usar HeaderNavigation
4. **Modificar `src/pages/Admin.tsx`** - Usar HeaderNavigation
5. **Modificar `src/components/dashboard/MobileHome.tsx`** - Chat completo sin modal
6. **Limpiar `ViewSwitcher.tsx`** - Eliminar o simplificar

---

## Resultado Esperado

**Home:**
- Logo Processia grande y prominente
- Slogan "Menos conversaciones. Más control." en verde #25E0B7
- Tarjetas de selección de modo debajo

**Desktop (CEO/Admin):**
- Header con logo clickeable (→ Home) + botones de navegación
- Sin ViewSwitcher en la parte inferior

**Móvil:**
- Chat de IA visible directamente (sin modal)
- Clientes críticos en sección compacta debajo
- Quick access en footer
