

# Plan: Mejorar la calidad de la imagen de fondo

## Problema

La imagen se ve borrosa porque:
1. Se usa `object-cover` que estira la imagen para cubrir toda la pantalla, escalandola mas alla de su resolucion nativa
2. El fondo del contenedor es negro pero la imagen tiene fondo blanco, lo que podria causar inconsistencias visuales

## Solucion

### 1. Reemplazar la imagen con la nueva version de mayor calidad

**Archivo**: `src/assets/landing-bg.png`
- Copiar `user-uploads://r_7.png` como nueva imagen de fondo

### 2. Ajustar la Landing Page

**Archivo**: `src/pages/Landing.tsx`

Cambios:
- Cambiar el fondo del contenedor de `bg-black` a `bg-white` para que coincida con el fondo de la imagen
- Cambiar `object-cover` a `object-contain` para que la imagen no se estire mas alla de su tamanio natural y se vea nitida
- Ajustar el color del boton "Entrar" para que sea visible sobre fondo blanco (cambiar de blanco a oscuro)
- Ajustar las particulas para que se vean bien sobre fondo blanco (cambiar color a verde mas intenso)

### 3. Ajustar ParticleNetwork para fondo claro

**Archivo**: `src/components/landing/ParticleNetwork.tsx`

- Las particulas ya son de color verde menta (#25E0B7), que se ve bien sobre fondo blanco
- No necesita cambios significativos

---

## Archivos a Modificar

| Archivo | Accion |
|---------|--------|
| `src/assets/landing-bg.png` | **Reemplazar** - Nueva imagen de mayor calidad |
| `src/pages/Landing.tsx` | **Modificar** - Fondo blanco, object-contain, colores del boton |

---

## Resultado Esperado

- La imagen se vera nitida y con su resolucion original, sin estirarse
- El fondo blanco de la imagen se integra con el fondo del contenedor
- Las particulas animadas siguen visibles sobre el fondo claro
- El boton "Entrar" es visible con colores adaptados al fondo blanco

