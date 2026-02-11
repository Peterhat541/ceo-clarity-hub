

## Plan: Notas persistentes, filtro por responsable y vista movil de Administracion

### Problema 1: Las notas creadas desde Admin no se guardan en la base de datos

Actualmente `handleSaveNote` en `Admin.tsx` (linea 364-396) solo guarda las notas en estado local y en el `NoteContext` (que es en memoria). No inserta nada en la tabla `notes` de la base de datos, por lo que las notas desaparecen al recargar y nunca llegan al CEO.

**Solucion:** Reescribir `handleSaveNote` para que inserte directamente en la tabla `notes` de la base de datos, encontrando el `client_id` del cliente seleccionado y usando los campos correctos (`text`, `visible_to`, `due_at`, `created_by`, `status`). Tambien emitir el evento `processia:noteCreated` para que la campana de notificaciones se actualice.

### Problema 2: Selector de responsable (filtro por empleado)

Anadir un selector en la barra superior de Admin que permita elegir "General" (todos) o un responsable especifico (Pedro, Maria, Carlos). Los valores se obtienen dinamicamente del campo `project_manager` de la tabla `clients`.

Al seleccionar un responsable:
- La tabla se filtra mostrando solo los clientes de ese responsable
- El nombre del responsable se usa como `created_by` al crear notas (en lugar del hardcoded "Maria Lopez")

```text
Barra actual:   [Campana] [Buscar...] [Columnas] [Filtro estado] [Nuevo cliente]
Barra nueva:    [Campana] [Selector responsable] [Buscar...] [Columnas] [Filtro estado] [Nuevo cliente]
```

### Problema 3: Vista movil para Administracion

La pagina Admin actualmente no tiene adaptacion movil. Se creara un layout responsive que:
- En movil: muestra las tarjetas de cliente en formato lista vertical compacta (similar a las ClientCards del CEO movil)
- Cada tarjeta muestra: nombre, estado, responsable, y botones de accion (IA, nota, editar)
- El buscador y filtros se adaptan a una sola columna
- Se mantiene intacto el layout desktop actual

### Problema 4: Margenes de la vista CEO movil

Revisar y ajustar los paddings/margins del `MobileHome.tsx` para que no haya cortes ni espacios desiguales.

---

### Detalle tecnico

**Archivos a modificar:**

1. **`src/pages/Admin.tsx`**
   - Reescribir `handleSaveNote` para insertar en Supabase en lugar de solo estado local
   - Anadir estado `selectedEmployee` (string: "" = todos, o nombre del responsable)
   - Anadir logica para obtener lista unica de responsables desde `clients`
   - Anadir selector de responsable en la barra de controles
   - Filtrar `filteredAndSortedClients` tambien por `project_manager` cuando hay responsable seleccionado
   - Anadir deteccion `useIsMobile()` para renderizar version movil o desktop
   - Crear vista movil: lista de tarjetas compactas con acciones

2. **`src/components/dashboard/MobileHome.tsx`**
   - Ajustar paddings del header y secciones para eliminar margenes desiguales

**Flujo corregido de notas:**

```text
Admin crea nota con visibilidad "CEO":
  -> INSERT en tabla notes (text, visible_to="ceo", client_id, created_by="Pedro", status="pending")
  -> Emite processia:noteCreated
  -> La nota aparece en el panel del CEO y en la campana de notificaciones

Admin crea nota con visibilidad "Equipo":
  -> INSERT en tabla notes (text, visible_to="team", ...)
  -> Queda registrada para uso interno del equipo
```

