

# Plan: Unificar la pagina Home con particulas y nuevo asset

## Objetivo

Hacer que la pagina Home (`/`) tenga la animacion de particulas de fondo (los puntos mint conectados) y usar la imagen `r_11.png` (logo + slogan combinados en un solo PNG) en lugar de las dos imagenes separadas actuales.

## Cambios

### 1. Copiar el nuevo asset

Copiar `r_11.png` a `src/assets/logo-slogan.png` para usarlo como imagen combinada de logo + slogan.

### 2. Modificar `src/pages/Home.tsx`

- **Anadir ParticleNetwork**: Importar y colocar el componente `ParticleNetwork` como fondo animado (z-0), detras de todo el contenido.
- **Reemplazar logo + slogan separados**: En lugar de importar `processia-logo-new.png` y `slogan.png` por separado, usar la nueva imagen combinada `logo-slogan.png`. Se mostrara con `mix-blend-mode: screen` para eliminar el fondo blanco y que se integre con el fondo oscuro.
- **Mantener el resto**: El texto "Selecciona un modo de trabajo", las dos cards (VISTA CEO, ADMINISTRACION) y el boton "Inicio" se mantienen igual.
- **Asegurar z-index**: El contenido (logo, cards, boton) tendra `z-10` o superior para estar por encima del canvas de particulas.

### 3. Estructura visual resultante

```text
+--------------------------------------------------+
|  [particulas animadas fondo]           [<- Inicio]|
|                                                   |
|           [logo-slogan.png]                       |
|      (logo + slogan, blend screen)                |
|                                                   |
|      Selecciona un modo de trabajo                |
|                                                   |
|   +------------------+  +------------------+      |
|   |   VISTA CEO      |  |  ADMINISTRACION  |      |
|   |   Dashboard      |  |  Base de datos   |      |
|   +------------------+  +------------------+      |
|                                                   |
+--------------------------------------------------+
```

## Archivos a modificar

| Archivo | Accion |
|---------|--------|
| `src/assets/logo-slogan.png` | Nuevo - copiar r_11.png |
| `src/pages/Home.tsx` | Anadir ParticleNetwork + reemplazar logo/slogan por imagen combinada |

## Detalles tecnicos

- `ParticleNetwork` se renderiza como un `<canvas>` con `position: absolute`, `inset: 0`, `z-0`. Ya existe el componente en `src/components/landing/ParticleNetwork.tsx`.
- La imagen `r_11.png` tiene fondo blanco, asi que se usara `mix-blend-mode: screen` para que el blanco se vuelva transparente sobre el fondo oscuro, mostrando solo el logo y el slogan.
- Todo el contenido interactivo (cards, boton) estara en un contenedor con `relative z-10` para estar por encima de las particulas.

## Resultado esperado

La pagina Home tendra el mismo estilo visual de particulas que la landing, con el logo y slogan nitidos gracias al PNG combinado, y mantendra las cards de seleccion de modo debajo.

