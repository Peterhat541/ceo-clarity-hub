

# Plan: Mejorar el difuminado de bordes en la Landing Page

## Problema

La imagen `landing-complete.png` en `/landing` muestra bordes visibles donde termina el contenido visual. El mask radial-gradient actual no es suficiente porque:
1. La imagen usa `object-contain`, lo que deja areas negras en los lados
2. El gradiente (80%/80% con fade desde 50%) no difumina lo suficiente los bordes reales del contenido

## Solucion

Cambiar la estrategia de la imagen y hacer el gradiente mas agresivo:

1. Cambiar `object-contain` a `object-cover` para que la imagen cubra todo el viewport sin dejar huecos negros
2. Ajustar el radial-gradient para que el difuminado sea mas pronunciado en los bordes, especialmente en la parte inferior y laterales donde se nota el corte

## Cambios tecnicos

| Archivo | Cambio |
|---------|--------|
| `src/pages/Landing.tsx` | Cambiar `object-contain` a `object-cover` y ajustar el radial-gradient a un fade mas agresivo con valores tipo `ellipse 70% 65% at center, black 30%, transparent 85%` |

## Detalle del cambio

**Antes:**
```css
object-contain
maskImage: radial-gradient(ellipse 80% 80% at center, black 50%, transparent 100%)
```

**Despues:**
```css
object-cover
maskImage: radial-gradient(ellipse 70% 65% at center, black 30%, transparent 85%)
```

- `object-cover`: la imagen llenara todo el espacio, evitando bandas negras
- `ellipse 70% 65%`: area visible mas concentrada en el centro
- `black 30%`: el contenido solido se mantiene solo en el centro
- `transparent 85%`: el fade comienza antes y termina antes del borde, creando un difuminado suave y natural

## Resultado esperado

Los bordes de la imagen se fundiran suavemente con el fondo negro sin que se note donde termina la imagen, creando una transicion elegante y continua.
