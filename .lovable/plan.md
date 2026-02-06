

# Plan: Usar imagen completa directamente como landing

## Problema

El enfoque de 3 capas con `mix-blend-mode` no consigue el resultado correcto. El usuario ha proporcionado una imagen final (`r_10.png`) que ya tiene todo combinado: fondo, logo, slogan y subtitulo.

## Solucion

Usar `r_10.png` como unica imagen de la landing, centrada y sin blend modes ni capas.

## Cambios

### 1. Copiar el asset

Copiar `r_10.png` a `src/assets/landing-complete.png` para usarlo como imagen principal.

### 2. Modificar `src/pages/Landing.tsx`

Simplificar completamente el componente:

- Eliminar las 3 imagenes separadas (landing-bg, landing-hero, landing-subtitle)
- Usar solo `landing-complete.png` como imagen unica centrada
- Mantener fondo negro para las barras laterales/superiores si la imagen no cubre todo
- La imagen se mostrara con `object-contain` para que se vea completa sin recortar ni deformar
- Mantener el boton "Entrar" en la esquina superior derecha
- Eliminar imports de los assets anteriores que ya no se usan

### Estructura simplificada

```text
+--------------------------------------------------+
|  [fondo negro]                         [Entrar ->]|
|                                                   |
|         [landing-complete.png]                    |
|         (centrada, object-contain)                |
|         (toda la composicion en 1 imagen)         |
|                                                   |
+--------------------------------------------------+
```

## Archivo a modificar

| Archivo | Accion |
|---------|--------|
| `src/assets/landing-complete.png` | Nuevo - copiar r_10.png |
| `src/pages/Landing.tsx` | Simplificar a 1 sola imagen |

## Resultado esperado

La landing se vera exactamente como la imagen proporcionada, sin problemas de tamanio, blend mode, ni capas desalineadas. Simple y directo.

