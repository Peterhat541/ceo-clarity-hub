

# Plan: Corregir 3 bugs en la vista CEO

## Problemas identificados

### 1. Clientes sin datos completos aparecen en la lista
Clientes como "Nexus Tech", "BlueSky Ventures" y "Global Media" tienen estado rojo/naranja/amarillo pero **no tienen datos de proyecto** (tipo de proyecto, descripcion, incidencias, tareas pendientes son todos nulos). Estos no deberian mostrarse al CEO porque no aportan informacion util.

### 2. El contador de eventos muestra "0 eventos" pero la agenda muestra 1
El evento "Reunion con el equipo" esta programado para el 10 de febrero, no para hoy (6 de febrero). El contador en el boton usa `getTodayEvents()` que solo cuenta eventos de hoy, pero la agenda muestra **todos los eventos proximos**. El numero deberia coincidir con lo que muestra la agenda.

### 3. Cliente revisado reaparece al navegar
Al marcar un cliente como "revisado", el codigo actualiza `last_contact` y `updated_at` pero **no cambia el estado** del cliente. Cuando se navega a Administracion y se vuelve, el componente se monta de nuevo y vuelve a cargar clientes con estado rojo/naranja/amarillo desde la base de datos -- el cliente sigue ahi porque su estado no cambio.

---

## Solucion

### Archivo: `src/components/dashboard/DesktopCEODashboard.tsx`

**Cambio 1 - Filtrar clientes incompletos:**
Despues de obtener los clientes de la base de datos, filtrar aquellos que no tengan al menos uno de estos campos rellenados: `project_type`, `work_description`, `incidents`, o `pending_tasks`. Si un cliente no tiene ninguno de estos datos, se considera incompleto y no se muestra.

**Cambio 2 - Marcar como revisado cambia el estado a verde:**
En la funcion `handleMarkReviewed`, ademas de actualizar `last_contact`, tambien se actualizara el `status` a `"green"`. Esto asegura que al recargar la lista el cliente ya no aparezca (la query solo trae red/orange/yellow).

**Cambio 3 - Mostrar contador de eventos proximos en vez de hoy:**
Reemplazar `todayEvents.length` por `events.length` (todos los eventos proximos, que es lo que muestra la agenda). Tambien actualizar el texto del boton para reflejar esto mejor.

---

## Detalles tecnicos

| Archivo | Lineas | Cambio |
|---------|--------|--------|
| `src/components/dashboard/DesktopCEODashboard.tsx` | ~65-84 | Filtrar clientes sin `project_type`, `work_description`, `incidents` ni `pending_tasks` |
| `src/components/dashboard/DesktopCEODashboard.tsx` | ~104-157 | En `handleMarkReviewed`, anadir `status: "green"` al update de Supabase |
| `src/components/dashboard/DesktopCEODashboard.tsx` | ~44-49, ~305 | Usar `events` (del contexto) en vez de `getTodayEvents()` para el contador |

## Resultado esperado

- Solo se muestran clientes con datos de proyecto rellenados en la vista CEO
- El contador de eventos coincide con lo que muestra la agenda
- Al marcar un cliente como revisado, su estado cambia a verde y no reaparece al navegar

