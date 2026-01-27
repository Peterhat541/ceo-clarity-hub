
# Plan: Correcciones del Dashboard "Cards Gigantes"

## Problemas Identificados

### 1. Header No Visible
El header definido en `DesktopCEODashboard.tsx` (líneas 73-78) no se muestra porque:
- `Index.tsx` envuelve el dashboard en un contenedor con `h-screen` 
- Añade `ViewSwitcher` (48px) debajo, causando desbordamiento
- El header del dashboard se corta por arriba

### 2. Paleta de Colores Demasiado Contrastada
Basándome en el análisis de processia.es, la web corporativa utiliza:
- Fondo negro profundo con grid sutil
- Acento principal en teal (#2E9D8F / hsl 174 72% 40%)
- Textos secundarios en grises más suaves (no blanco puro)
- Glows sutiles en elementos interactivos

El dashboard actual tiene:
- Negro demasiado puro (hsl 240 20% 4%)
- Texto blanco al 98% (muy alto contraste)
- Faltan gradientes sutiles

---

## Correcciones a Implementar

### Archivo 1: `src/pages/Index.tsx`

**Problema**: Conflicto de alturas entre contenedores

**Solución**: Eliminar contenedor wrapper redundante y dejar que `DesktopCEODashboard` maneje todo el layout incluyendo el ViewSwitcher

```tsx
// Desktop: render dashboard directly (it handles its own viewport)
return <DesktopCEODashboard />;
```

### Archivo 2: `src/components/dashboard/DesktopCEODashboard.tsx`

**Cambios**:
1. Integrar ViewSwitcher dentro del componente
2. Asegurar que el header sea visible y prominente
3. Calcular alturas correctamente: header (56px) + main (flex-1) + footer (48px)

**Estructura corregida**:
```tsx
<div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
  {/* Header - SIEMPRE VISIBLE */}
  <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-border/50 bg-card/30 backdrop-blur-sm">
    <img src={processiaLogo} alt="Processia" className="h-7" />
    <span className="text-sm text-muted-foreground">
      {getGreeting()} · {formatDate()}
    </span>
  </header>
  
  {/* Main Content */}
  <main className="flex-1 flex gap-6 p-6 min-h-0">
    {/* Cards... */}
  </main>
  
  {/* ViewSwitcher integrado */}
  <ViewSwitcher />
</div>
```

### Archivo 3: `src/index.css` - Paleta Refinada

**Cambios en variables CSS** para reducir contraste y añadir elegancia:

```css
:root {
  /* Fondo: negro profundo pero no puro */
  --background: 240 15% 6%;        /* Más cálido que 4% */
  --foreground: 220 10% 92%;       /* No blanco puro, más suave */
  
  /* Cards: ligeramente más claras */
  --card: 240 10% 10%;
  --card-foreground: 220 10% 92%;
  
  /* Bordes más sutiles */
  --border: 240 8% 20%;
  
  /* Textos secundarios más legibles */
  --muted-foreground: 220 10% 65%; /* Más claro que 55% */
  
  /* Mantener teal corporativo */
  --primary: 174 72% 40%;
  
  /* Añadir variable púrpura para acentos secundarios */
  --accent-purple: 271 65% 50%;
}
```

### Archivo 4: Ajustes menores en `glass-card`

Suavizar los efectos de glass morphism:
```css
.glass-card {
  @apply bg-card/70 backdrop-blur-xl border border-border/30;
  box-shadow: 0 4px 24px -4px hsl(0 0% 0% / 0.3),
              inset 0 1px 0 0 hsl(0 0% 100% / 0.02);
}
```

---

## Distribución Visual Corregida

```text
┌─────────────────────────────────────────────────────────────────────┐
│ [LOGO]                                       Buenos días · 27 Ene  │  ← Header (h-14 = 56px)
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────┐   ┌─────────────────────────────┐  │
│  │                             │   │                             │  │
│  │   CLIENTES CRÍTICOS         │   │   ASISTENTE IA              │  │
│  │                             │   │                             │  │
│  │   ● Nexus Tech        [IA]  │   │   ✧ "Hola, soy tu mano      │  │
│  │   ● Global Media      [IA]  │   │      derecha ejecutiva"     │  │
│  │   ● Startup Lab       [IA]  │   │                             │  │
│  │                             │   │   [Chat...]                 │  │
│  │ ─────────────────────────── │   │                             │  │
│  │  📅 1 eventos  💬 2 notas   │   │                             │  │
│  │  [Enviar nota al equipo]    │   │   [Input...]                │  │
│  └─────────────────────────────┘   └─────────────────────────────┘  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│        ◉ Vista CEO                    ○ Administración              │  ← ViewSwitcher (h-12 = 48px)
└─────────────────────────────────────────────────────────────────────┘
```

---

## Resumen de Cambios

| Archivo | Cambio |
|---------|--------|
| `src/pages/Index.tsx` | Simplificar para renderizar solo `DesktopCEODashboard` sin wrapper |
| `src/components/dashboard/DesktopCEODashboard.tsx` | Integrar ViewSwitcher, asegurar header visible |
| `src/index.css` | Ajustar paleta: reducir contraste, suavizar grises, mantener teal |

## Resultado Esperado
- Header con logo y saludo siempre visible
- Paleta de colores más elegante y menos contrastada
- Coherencia visual con processia.es
- Layout 100vh sin scroll, respetando header y footer
