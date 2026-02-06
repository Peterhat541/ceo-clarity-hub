

# Plan: Aumentar el tamanio del logo en la pagina Home

## Problema

El logo+slogan en la pagina Home (`/`) se ve demasiado pequenio. Actualmente usa `h-32 sm:h-40 md:h-48` (128px / 160px / 192px).

## Cambio

Aumentar las clases de altura del logo en `src/pages/Home.tsx`:

- **Antes**: `h-32 sm:h-40 md:h-48`
- **Despues**: `h-48 sm:h-56 md:h-72`

Esto sube el tamanio a 192px / 224px / 288px respectivamente, casi el doble en desktop.

## Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Home.tsx` | Linea 32: cambiar clases de altura de la imagen |

## Resultado esperado

El logo con el slogan se vera considerablemente mas grande y prominente, ocupando mas espacio visual en la pagina antes de las cards de seleccion de modo.

