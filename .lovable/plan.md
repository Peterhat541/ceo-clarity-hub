

## Plan: Mejorar la vista de Administracion con IA y notificaciones del CEO

### 1. Eliminar el buscador y columnas duplicados

El archivo `Admin.tsx` tiene duplicado el buscador (lineas 356-365 y 374-383) y el boton de columnas (lineas 368-373 y 386-391). Se eliminara la segunda copia de ambos.

### 2. Boton de IA en cada fila de cliente

Anadir un boton con icono de IA (Sparkles) en la columna de acciones de cada fila de la tabla. Al hacer clic, abre el `ClientChatModal` ya existente con el contexto de ese cliente precargado. Esto permite a los trabajadores hablar con la IA sobre cada cliente directamente desde la tabla.

```text
Acciones por fila actuales: [Nota] [Email] [Editar] [Eliminar]
Acciones por fila nuevas:   [IA] [Nota] [Email] [Editar] [Eliminar]
```

### 3. Indicador de notas del CEO en cada fila

Cuando el CEO deja una nota dirigida a un empleado sobre un cliente especifico, se mostrara un pequeno badge/indicador en la fila de ese cliente. Se consultara la tabla `notes` filtrando por `client_id` y `visible_to = 'team'` con `status = 'pending'`.

Esto permite que los trabajadores vean de un vistazo que clientes tienen instrucciones del CEO pendientes.

### 4. Mejorar la campana de notificaciones (CEONotificationBell)

La campana ya existe en la barra superior de Admin. Se mejorara para:
- Mostrar las notas agrupadas: primero las que tienen `target_employee` (notas dirigidas a alguien concreto), luego las generales
- Que al hacer clic en una nota con cliente asociado, se abra el chat de IA de ese cliente

### Detalle tecnico

**Archivos a modificar:**

1. **`src/pages/Admin.tsx`**
   - Eliminar lineas 374-391 (buscador y columnas duplicados)
   - Importar `ClientChatModal` y `Sparkles` de lucide
   - Anadir estado para controlar el modal de IA: `aiChatClient` (cliente seleccionado para chat IA)
   - Anadir boton de IA en la columna de acciones de cada fila (antes de Nota)
   - Anadir consulta de notas pendientes del CEO por cliente para mostrar badges en las filas
   - Renderizar `ClientChatModal` al final del componente

2. **`src/components/admin/CEONotificationBell.tsx`**
   - Anadir el nombre del cliente en cada notificacion de forma mas visible
   - Anadir prop `onOpenClientChat` para que al tocar una nota con cliente se abra el chat de IA de ese cliente

### Flujo esperado

```text
CEO (vista /ceo):
  "Dile a Pedro que revise el presupuesto de Promocion Residencial Mirador"
  -> IA crea nota con target_employee="Pedro", client_id=X, visible_to="team"

Admin (vista /admin):
  1. La campana de notificaciones muestra: "Para Pedro: revise el presupuesto..."
  2. En la fila de "Promocion Residencial Mirador" aparece un badge indicando nota del CEO pendiente
  3. Pedro puede hacer clic en el boton de IA de esa fila y preguntar detalles
```

