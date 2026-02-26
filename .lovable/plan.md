

## Plan: Rediseño completo del dashboard estilo ChatGPT corporativo

El usuario quiere que el dashboard se parezca al diseño de referencia (image-104.png): un layout tipo ChatGPT con sidebar izquierdo de contexto, área central de chat prominente con mensaje de bienvenida y tarjetas de sugerencias, header corporativo con pill central, y footer branded.

---

### Cambio 1: Rediseño completo del Header (`src/components/layout/HeaderNavigation.tsx`)

Reemplazar el header actual por uno que siga el diseño de referencia:
- **Izquierda**: Icono SS + "Prossium" en texto bold
- **Centro**: Pill con punto verde + "IA activa para [Empresa]" (pill con borde, fondo oscuro)
- **Derecha**: Botón "✦ TU IA" con borde primary + nombre "Carlos Ruiz" + Settings discreto

### Cambio 2: Rediseño del DesktopCEODashboard (`src/components/dashboard/DesktopCEODashboard.tsx`)

Reestructurar completamente a layout de 2 columnas tipo ChatGPT:

**Sidebar izquierdo (~240px)**:
- Sección "CONTEXTO ACTIVO" con items: Proyectos activos (con conteo), Clientes (con badge "3 nuevo"), Reuniones (con "Esta semana: X"), Seguimientos (con "X pendientes")
- Cada item clickable, abre los popups existentes (agenda, clientes, notas)
- Sección "HISTORIAL" debajo con las últimas conversaciones del chat (título + tiempo relativo)
- Items con iconos colored en cuadrados redondeados

**Área central (flex-1)**:
- Header del chat: icono robot + "Nexus IA" + "Especializada en tu agencia · Conectada a tu CRM" + botones "Datos actualizados" y "Configurar"
- Estado inicial (sin mensajes): icono sparkle grande centrado + "Hola Carlos, soy tu **IA de empresa**" (IA de empresa en color primary/dorado) + subtítulo descriptivo + grid 2x2 de tarjetas de sugerencias con iconos
- Cuando hay mensajes: vista de chat normal con scroll
- Input inferior: campo ancho "Pregunta sobre tus clientes, proyectos, reuniones..." + botón enviar circular primary + debajo "📎 Adjuntar" y "🎤 Voz"
- Footer: "Nexus IA · Powered by Prossium"

### Cambio 3: Actualizar AIChat (`src/components/ai/AIChat.tsx`)

- Modificar las sugerencias iniciales a tarjetas 2x2 con iconos (en lugar de pills inline)
- Las 4 sugerencias: "¿Qué clientes necesitan atención urgente?", "Resumen de proyectos activos", "Reuniones de seguimiento pendientes", "Oportunidades de venta abiertas"
- Estilo de las tarjetas: fondo glass verde oscuro, borde sutil, icono arriba + texto
- Mensaje de bienvenida grande centrado con sparkle icon antes del primer mensaje
- Input placeholder: "Pregunta sobre tus clientes, proyectos, reuniones..."
- Botones "Adjuntar" y "Voz" debajo del input

### Cambio 4: Paleta de colores refinada

En `src/index.css`, ajustar para que el fondo sea más verde-oscuro profundo (como el mockup: ~#0a1a14 deep forest green en lugar del gris #131313). Ajustar cards a tonos verdes oscuros con bordes verdes sutiles. Los textos de sección ("CONTEXTO ACTIVO", "HISTORIAL") en color primary tenue.

### Cambio 5: MobileHome responsive (`src/components/dashboard/MobileHome.tsx`)

Mantener estructura actual pero aplicar la misma paleta verde oscura y estilo visual del nuevo diseño.

---

### Archivos afectados

| Archivo | Cambio |
|---|---|
| `src/index.css` | Paleta verde-oscuro profundo, cards verdes |
| `src/components/layout/HeaderNavigation.tsx` | Rediseño completo: logo + pill central + TU IA |
| `src/components/dashboard/DesktopCEODashboard.tsx` | Layout sidebar + chat central tipo ChatGPT |
| `src/components/ai/AIChat.tsx` | Welcome screen con sparkle, sugerencias 2x2, input redesign |
| `src/components/dashboard/MobileHome.tsx` | Aplicar nueva paleta verde |

### Sin modificar
Lógica de negocio, APIs, edge functions, comportamiento del agente IA, estructura de datos.

