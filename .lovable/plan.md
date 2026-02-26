

## Plan: Rebranding total Prossium + Rediseño visual centrado en IA empresarial

### Resumen ejecutivo

Eliminar todas las referencias a "Processia", roles ("Vista CEO", "Administración"), y reposicionar la plataforma como **IA empresarial personalizada**. El chat pasa a ser el centro absoluto. Sin cambios en lógica, APIs, ni comportamiento del agente.

---

### Cambio 1: Assets e identidad visual

- Copiar `r_33.png` como nuevo favicon (`public/favicon.png`) y como icono SS (`src/assets/ss-icon.png`)
- Copiar `r_26.png` como logo principal (`src/assets/prossium-logo.png`)
- Actualizar `index.html`: titulo "Prossium", meta author "Prossium", eliminar "@Processia" en twitter

### Cambio 2: Eliminar pantalla de selección de modo (Home.tsx)

La ruta `/` deja de mostrar "Selecciona un modo de trabajo" con tarjetas CEO/Admin. En su lugar, redirige directamente al dashboard principal (`Index.tsx`), que ya contiene el chat como centro.

**Archivo: `src/App.tsx`**
- Ruta `/` apunta a `<DemoGuard><Index /></DemoGuard>` (antes era Home)
- Ruta `/home` puede redirigir a `/`
- Home.tsx deja de usarse como página principal

### Cambio 3: Rebranding de HeaderNavigation

**Archivo: `src/components/layout/HeaderNavigation.tsx`**
- Eliminar botones "Inicio", "Vista CEO", "Administración" como navegación por roles
- Header minimal: Logo Prossium + indicador "IA activa para [Empresa]" + botón configuración discreto (engranaje) + botón "Salir"
- En móvil: header compacto con logo + "IA activa" + salir
- Mantener acceso a Admin como icono discreto de configuración (no como modo de trabajo)

### Cambio 4: Rediseño DesktopCEODashboard → Dashboard principal

**Archivo: `src/components/dashboard/DesktopCEODashboard.tsx`**
- Eliminar referencia a "Asistente IA" / "Tu mano derecha ejecutiva"
- Header del chat: "IA de [Empresa]" con subtítulo "Conectada a tus datos y herramientas"
- Panel izquierdo renombrar "Clientes que requieren atención" → "Seguimientos activos" o "Proyectos activos"
- Mantener toda la lógica de clientes, eventos, notas exactamente igual
- Footer discreto: "Infrastructure by Prossium"

### Cambio 5: Rediseño MobileHome

**Archivo: `src/components/dashboard/MobileHome.tsx`**
- Header: Logo Prossium + "IA activa" (sin "Buenos días", sin botón Admin prominente)
- Chat header: eliminar "Asistente IA" / "Tu mano derecha ejecutiva" → "Tu IA empresarial"
- Mensaje inicial del chat ya configurado en AIChatContext
- Acceso a Admin como icono settings discreto
- Input fijo inferior (ya está)

### Cambio 6: Mensaje inicial del chat

**Archivo: `src/contexts/AIChatContext.tsx`**
- Cambiar el mensaje inicial de "Hola, soy tu asistente ejecutivo..." a:
  "Hola. Soy tu IA empresarial. Estoy conectada a tus datos y herramientas. Pregúntame lo que necesites saber."

### Cambio 7: Eliminar referencias "Processia" en comentarios y alt texts

- `src/index.css`: Comentarios "Processia Design System" → "Prossium Design System"
- `src/components/layout/TopNavigation.tsx`: alt="Processia" → alt="Prossium"
- `src/components/dashboard/MobileHome.tsx`: alt="Processia" → alt="Prossium"
- `src/components/layout/HeaderNavigation.tsx`: alt="Processia" → alt="Prossium"
- Custom events `processia:eventCreated` y `processia:noteCreated` → `prossium:eventCreated` y `prossium:noteCreated` (en todos los archivos que los usan: AIChat.tsx, ClientChatModal.tsx, DesktopCEODashboard.tsx, SendNotePopup.tsx, CreateEventModal.tsx, CEONotificationBell.tsx, EventContext.tsx, ReminderContext.tsx)

### Cambio 8: Textos de Admin y popups

- `src/components/dashboard/SendNotePopup.tsx`: "Administración" → "el panel de gestión"
- `src/components/dashboard/TeamNotesPopup.tsx`: "Administración" → "el panel de gestión"
- `src/pages/Admin.tsx`: Mantener funcionalidad, solo revisar títulos visibles

### Cambio 9: Footer discreto

Añadir en el layout principal (tanto desktop como móvil) un footer mínimo con:
```
Infrastructure by Prossium
```
Texto gris tenue, centrado, font-size xs.

---

### Detalle técnico: Archivos afectados

| Archivo | Tipo de cambio |
|---|---|
| `public/favicon.png` | Reemplazar asset |
| `src/assets/prossium-logo.png` | Reemplazar asset |
| `src/assets/ss-icon.png` | Reemplazar asset |
| `index.html` | Meta tags rebranding |
| `src/App.tsx` | Rutas: eliminar Home, `/` → Index |
| `src/pages/Home.tsx` | Ya no se usa como página principal |
| `src/contexts/AIChatContext.tsx` | Mensaje inicial |
| `src/components/layout/HeaderNavigation.tsx` | Rebranding completo header |
| `src/components/layout/TopNavigation.tsx` | Alt text |
| `src/components/dashboard/DesktopCEODashboard.tsx` | Rebranding textos + footer |
| `src/components/dashboard/MobileHome.tsx` | Rebranding header + textos |
| `src/components/dashboard/SendNotePopup.tsx` | Texto |
| `src/components/dashboard/TeamNotesPopup.tsx` | Texto |
| `src/components/ai/AIChat.tsx` | Custom events rename |
| `src/components/ai/ClientChatModal.tsx` | Custom events rename |
| `src/components/admin/CEONotificationBell.tsx` | Custom events rename |
| `src/contexts/EventContext.tsx` | Custom events rename |
| `src/contexts/ReminderContext.tsx` | Custom events rename |
| `src/components/dashboard/CreateEventModal.tsx` | Custom events rename |
| `src/index.css` | Comentarios |

**NO se modifica:** lógica de negocio, APIs, edge functions, system prompts, estructura de datos, conexiones con IA.

