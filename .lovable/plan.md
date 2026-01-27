
# Plan: Implementar "Cards Gigantes" - Diseño Zero Scroll Adaptativo

## Concepto Visual

Dos bloques principales de máximo impacto visual que ocupan el 100% del viewport sin scroll:

```text
DESKTOP (100vw x 100vh)
┌────────────────────────────────────────────────────────────────────────────┐
│  [Logo Processia]                                    Buenos días · 27 Ene  │
├────────────────────────────────────────────────────────────────────────────┤
│                                    │                                       │
│   ┌────────────────────────────┐   │   ┌─────────────────────────────────┐ │
│   │                            │   │   │                                 │ │
│   │    CLIENTES CRÍTICOS       │   │   │       ASISTENTE IA              │ │
│   │                            │   │   │                                 │ │
│   │    ●  Nexus Tech     [IA]  │   │   │   ✧ "Hola, soy tu mano          │ │
│   │       Facturación sin...   │   │   │      derecha ejecutiva"         │ │
│   │                            │   │   │                                 │ │
│   │    ●  Global Media   [IA]  │   │   │   [Chat messages...]            │ │
│   │       Llamada urgente      │   │   │                                 │ │
│   │                            │   │   │                                 │ │
│   │    ●  Startup Lab    [IA]  │   │   │                                 │ │
│   │       Deadline 48h         │   │   │                                 │ │
│   │                            │   │   │   ┌───────────────────────────┐ │ │
│   │ ─────────────────────────  │   │   │   │ Pregunta...          ➤   │ │ │
│   │  📅 3 eventos  💬 2 notas  │   │   │   └───────────────────────────┘ │ │
│   └────────────────────────────┘   │   └─────────────────────────────────┘ │
│                                    │                                       │
└────────────────────────────────────────────────────────────────────────────┘

MÓVIL (100vw x 100vh - sin scroll)
┌──────────────────────────────┐
│  Buenos días, Juan!          │
├──────────────────────────────┤
│  ┌────────────────────────┐  │
│  │   ASISTENTE IA    ✧    │  │
│  │   Toca para hablar     │  │
│  │   [████████████████]   │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │  ● Nexus Tech          │  │
│  │    Facturación...      │  │
│  ├────────────────────────┤  │
│  │  ● Global Media        │  │
│  │    Llamada urgente     │  │
│  ├────────────────────────┤  │
│  │  + Ver todos (3)       │  │
│  └────────────────────────┘  │
│                              │
│  📅 3    💬 2    ⚠ 2    📆 2 │
└──────────────────────────────┘
```

## Archivos a Modificar

### 1. `src/index.css` - Tema Dark Executive

Actualizar las variables CSS para el tema oscuro corporativo:

**Nuevos valores de color:**
- Background: `240 20% 4%` (negro profundo #0A0A0F)
- Card: `240 10% 8%` (gris muy oscuro)
- Border: `240 5% 18%` (borde sutil)
- Primary: `174 72% 40%` (teal Processia)
- Muted-foreground: `240 5% 55%` (texto secundario)

**Añadir nuevas utilidades:**
- `.glass-card` - efecto glass morphism sutil
- `.card-giant` - estilos para cards gigantes
- Animaciones de entrada suaves

### 2. `src/components/dashboard/DesktopCEODashboard.tsx` - Layout Principal

**Estructura completa nueva:**

```tsx
<div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
  {/* Header minimalista */}
  <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b">
    <img src={logo} className="h-7" />
    <span className="text-sm text-muted-foreground">Buenos días · 27 Ene</span>
  </header>
  
  {/* Contenido principal - 2 cards gigantes */}
  <main className="flex-1 flex gap-6 p-6 min-h-0">
    {/* Card Izquierda: Clientes */}
    <div className="flex-1 glass-card rounded-3xl flex flex-col p-6">
      <h2>Clientes que requieren atención</h2>
      {/* Lista de clientes con scroll interno si es necesario */}
      <div className="flex-1 overflow-auto space-y-3">
        {clients.map(client => <ClientRow />)}
      </div>
      {/* Footer con accesos rápidos */}
      <div className="flex gap-4 pt-4 border-t">
        <QuickButton icon={Calendar} label="3 eventos" />
        <QuickButton icon={MessageSquare} label="2 notas" />
      </div>
    </div>
    
    {/* Card Derecha: Chat IA */}
    <div className="w-[500px] glass-card rounded-3xl flex flex-col">
      <AIChat />
    </div>
  </main>
</div>
```

**Componentes internos:**
- `ClientRow`: Fila compacta de cliente con estado, nombre, issue y botón IA
- `QuickButton`: Botón de acceso rápido a agenda/notas

### 3. `src/components/dashboard/MobileHome.tsx` - Adaptación Móvil

**Nueva estructura sin scroll:**

```tsx
<div className="h-screen w-screen flex flex-col bg-background overflow-hidden p-4">
  {/* Header */}
  <header className="shrink-0 mb-4">
    <h1>Buenos días, Juan!</h1>
  </header>
  
  {/* Card IA - Prominente */}
  <div className="shrink-0 mb-4">
    <button onClick={openChat} className="w-full glass-card rounded-2xl p-5">
      <Sparkles /> Hablar con IA
    </button>
  </div>
  
  {/* Card Clientes - Flex-1 para llenar espacio */}
  <div className="flex-1 min-h-0 glass-card rounded-2xl p-4 flex flex-col">
    <h2>Clientes críticos</h2>
    <div className="flex-1 overflow-auto">
      {visibleClients.map(client => <CompactClientRow />)}
    </div>
    <button>+ Ver todos ({total})</button>
  </div>
  
  {/* Quick Access Footer - fijo */}
  <div className="shrink-0 mt-4 grid grid-cols-4 gap-2">
    <QuickIcon icon={Calendar} count={3} />
    <QuickIcon icon={MessageSquare} count={2} />
    <QuickIcon icon={AlertTriangle} count={2} />
    <QuickIcon icon={CalendarDays} count={2} />
  </div>
</div>
```

### 4. `src/components/dashboard/ClientCard.tsx` - Versión Compacta

Crear variante `compact` para las filas de clientes dentro de los cards gigantes:

```tsx
interface ClientCardProps {
  variant?: "default" | "compact";
  // ... existing props
}
```

**Modo compact:**
- Layout horizontal de una línea
- Status dot + Nombre + Issue truncado + Tiempo + Botón IA
- Sin padding extra, altura fija de ~48px

## Estilos CSS Clave

### Variables Dark Executive (index.css)

```css
:root {
  --background: 240 20% 4%;
  --foreground: 0 0% 98%;
  --card: 240 10% 8%;
  --card-foreground: 0 0% 98%;
  --border: 240 5% 18%;
  --primary: 174 72% 40%;
  --muted-foreground: 240 5% 55%;
}
```

### Clases Utilitarias Nuevas

```css
.glass-card {
  @apply bg-card/80 backdrop-blur-xl border border-border/50;
  box-shadow: 0 8px 32px -8px hsl(174 72% 40% / 0.1);
}

.card-giant {
  @apply rounded-3xl p-6;
}

.client-row {
  @apply flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors;
}
```

## Comportamiento Responsivo

| Breakpoint | Layout |
|------------|--------|
| < 768px | Stack vertical (IA arriba, Clientes abajo) |
| >= 768px | Grid horizontal 50/50 |
| >= 1280px | Grid horizontal con chat de 500px fijo |

## Interactividad

- **Click en cliente**: Abre modal de chat IA con contexto del cliente
- **Click en IA hero (móvil)**: Abre modal de chat IA
- **Quick buttons**: Abren popups existentes (Agenda, Notas, etc.)
- **Hover en cards**: Glow teal sutil en bordes

## Resultado Esperado

- Dashboard que ocupa 100% del viewport (zero scroll en vista principal)
- Dos bloques visuales de alto impacto
- Transición fluida de desktop a móvil
- Estética Dark Executive coherente con processia.es
- Escaneo instantáneo de información crítica
- Máximo contraste y legibilidad
