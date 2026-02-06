

# Plan: Mejorar calidad de la imagen de fondo

## Resumen

Reemplazar la imagen de fondo actual (`src/assets/landing-bg.png`) con la nueva imagen de mayor calidad que has adjuntado. No se necesitan cambios en el codigo, solo sustituir el archivo de imagen.

---

## Cambios

### 1. Reemplazar la imagen de fondo

**Accion**: Copiar `user-uploads://r_6.png` a `src/assets/landing-bg.png`, sobrescribiendo la imagen actual.

Como el archivo `Landing.tsx` ya importa `landing-bg.png` y lo usa como fondo, no hace falta tocar ningun codigo. La nueva imagen se cargara automaticamente con mejor calidad.

---

## Archivos a Modificar

| Archivo | Accion |
|---------|--------|
| `src/assets/landing-bg.png` | **Reemplazar** - Nueva imagen de mayor calidad |

---

## Resultado Esperado

- La imagen de fondo de la landing se vera con mayor resolucion y nitidez
- Todo lo demas (particulas animadas, boton "Entrar") se mantiene igual

