

# Plan: Reconstruir la Landing con 3 capas independientes

## Objetivo

Montar la landing page superponiendo las 3 imagenes por separado para mantener la maxima calidad, en lugar de usar una sola imagen combinada que pierde resolucion al escalar.

## Las 3 capas

```text
Capa 0 (fondo):     r_9.png    -> Globo oscuro, cubre toda la pantalla
Capa 1 (hero):      r_7-2.png  -> Logo + "MENOS CONVERSACIONES. MAS CONTROL"
Capa 2 (subtitulo): r_8-2.png  -> "SISTEMAS INTERNOS A MEDIDA PARA CEOS"
```

## Cambios

### 1. Reemplazar los 3 assets

| Archivo destino | Origen | Contenido |
|-----------------|--------|-----------|
| `src/assets/landing-bg.png` | `r_9.png` | Fondo oscuro con globo (sin texto) |
| `src/assets/landing-hero.png` | `r_7-2.png` | Logo + slogan |
| `src/assets/landing-subtitle.png` | `r_8-2.png` | Subtitulo "SISTEMAS INTERNOS..." |

### 2. Modificar `src/pages/Landing.tsx`

Reestructurar completamente la pagina:

- **Fondo** (`landing-bg.png`): Posicion absoluta, `object-cover`, cubre toda la pantalla. Como es solo el globo sin texto, estirar no causa borrosidad visible en textos.
- **Contenido central**: Un contenedor flex vertical centrado que apila:
  - `landing-hero.png` (logo + slogan) - centrado, tamanio responsivo
  - `landing-subtitle.png` (subtitulo) - justo debajo, tamanio mas pequenio
- **Eliminar ParticleNetwork**: El fondo r_9.png ya tiene su propia estetica de particulas y lineas, no necesita la capa animada extra.
- **Boton "Entrar"**: Se mantiene en la esquina superior derecha con estilo blanco/transparente.

### 3. Estructura del nuevo layout

```text
+--------------------------------------------------+
|                                        [Entrar ->]|
|                                                   |
|            [fondo: landing-bg.png]                |
|                                                   |
|              [landing-hero.png]                   |
|          (logo + slogan centrado)                 |
|                                                   |
|            [landing-subtitle.png]                 |
|         (subtitulo justo debajo)                  |
|                                                   |
+--------------------------------------------------+
```

### 4. Detalles tecnicos

- Las imagenes hero y subtitle tienen fondo blanco, asi que se usara CSS `mix-blend-mode: screen` para que el fondo blanco se vuelva transparente sobre el fondo oscuro, integrando los textos perfectamente.
- Si el blend mode no es suficiente, se puede ajustar con `lighten` como alternativa.
- El hero y subtitle se posicionan con un contenedor absoluto centrado usando flexbox.

## Archivos a modificar

| Archivo | Accion |
|---------|--------|
| `src/assets/landing-bg.png` | Reemplazar con r_9.png |
| `src/assets/landing-hero.png` | Reemplazar con r_7-2.png |
| `src/assets/landing-subtitle.png` | Reemplazar con r_8-2.png |
| `src/pages/Landing.tsx` | Reescribir layout con 3 capas + mix-blend-mode |

## Resultado esperado

La landing se vera exactamente como la imagen de referencia: fondo oscuro con el globo, logo Processia con slogan centrado, y debajo el subtitulo en gradiente verde-azul. Todo nitido porque cada elemento se escala independientemente.

