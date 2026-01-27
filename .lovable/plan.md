
## Objetivo (sin “inventar” nada fuera de lo aprobado)
Que el **grid del fondo sea “sutil pero claramente visible”** (como textura), manteniendo el estilo Processia, sin cambiar el layout ni añadir features nuevos.

## Qué pasa ahora (por qué tú no lo ves)
He verificado el código actual y el grid **sí está aplicado** (`bg-grid` en Desktop/Mobile/Admin y también en `body`).  
El problema es que el color del grid es **demasiado parecido al fondo**:

- Fondo: `--background: hsl(240 15% 6%)`
- Líneas actuales: `hsl(240 8% 12% / 0.4)` (líneas “oscuras” sobre fondo oscuro)

En algunos monitores/ajustes de brillo/contraste, eso se vuelve prácticamente invisible aunque exista.

## Cambios exactos que haré (mínimos y concretos)
### 1) Ajustar SOLO el estilo del grid (1 archivo)
**Archivo:** `src/index.css`

**Acción:** cambiar el grid para que sea un poco más visible usando líneas **ligeramente más claras** con muy baja opacidad (sin que parezca “rejilla marcada”).  
Además, añadiré una “grid mayor” (cada 4 celdas) muy sutil, como textura premium, sin cargar el diseño.

Propuesta de CSS (valores “sutil visible”):
```css
/* Sustituir el background-image actual del grid (body y .bg-grid) por: */
background-image:
  /* grid fino */
  linear-gradient(to right, hsl(0 0% 100% / 0.035) 1px, transparent 1px),
  linear-gradient(to bottom, hsl(0 0% 100% / 0.035) 1px, transparent 1px),
  /* grid mayor (cada 4) */
  linear-gradient(to right, hsl(0 0% 100% / 0.06) 1px, transparent 1px),
  linear-gradient(to bottom, hsl(0 0% 100% / 0.06) 1px, transparent 1px);

background-size:
  60px 60px,
  60px 60px,
  240px 240px,
  240px 240px;
```

**Importante:** no tocaré `DesktopCEODashboard.tsx`, `MobileHome.tsx` ni `Admin.tsx` (ya tienen `bg-grid`). Solo haré que el patrón sea visible.

### 2) Mantener consistencia global
Actualizaré tanto:
- el grid en `body { ... }` (fallback global), como
- la utilidad `.bg-grid { ... }` (que es la que usan las páginas)

Así siempre se verá igual.

## Cómo validaremos (para no “gastar créditos a ciegas”)
1. Validación en Desktop (route `/`):
   - Ver el grid en las zonas “vacías” entre cards y en el header.
2. Validación en Mobile:
   - Ver el grid detrás del contenido principal.
3. Si todavía lo percibís muy flojo:
   - Ajuste puntual de opacidad (solo números): `0.035 → 0.045` y `0.06 → 0.075` (sin tocar nada más).

## Nota para ahorrar créditos en cambios visuales futuros
Para cambios de texto/color/espaciados en elementos estáticos, podéis usar **Visual Edits** (no consume créditos en ediciones directas). En este caso concreto (CSS global), sí requiere cambio de código.

## Rollback rápido (si no os gusta)
Podéis restaurar el estado anterior desde el historial del proyecto (sin rehacer nada).
