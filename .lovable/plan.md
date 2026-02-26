

## Plan: Efecto de partículas siguiendo el cursor (mouse trail)

### Qué se hará
Añadir al componente `ParticleNetwork` un efecto donde un grupo de bolitas (verdes y doradas, los colores de marca) siguen el cursor del ratón por la pantalla, dejando un rastro visual como una "flecha" de partículas que persiguen al puntero.

### Cambios técnicos

**Archivo: `src/components/landing/ParticleNetwork.tsx`**

1. Capturar la posición del ratón con un listener de `mousemove` en el canvas
2. Crear un conjunto de ~15-20 partículas "seguidoras" que persigan al cursor con un efecto de retraso (easing/lerp), de forma que cada una siga a la anterior creando un efecto de cola/serpiente
3. Estas partículas usarán los mismos colores de marca (verde `#24A475` y dorado `#D89B2A`), con tamaños decrecientes y opacidad que se desvanece hacia el final de la cola
4. En móvil, usar `touchmove` en lugar de `mousemove` para el mismo efecto
5. Las partículas del fondo (las que ya existen flotando) se mantienen tal cual

