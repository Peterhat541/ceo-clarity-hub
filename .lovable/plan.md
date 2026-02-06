

# Plan: Poner la imagen como fondo de la landing page

## Resumen

Usar la imagen subida como fondo completo de la landing page, reemplazando el fondo negro actual. Las particulas animadas se mantendran por encima para dar mas dinamismo.

---

## Cambios

### 1. Guardar la imagen

**Accion**: Copiar `user-uploads://image-56.png` a `src/assets/landing-bg.png`

### 2. Actualizar Landing Page

**Archivo**: `src/pages/Landing.tsx`

- Importar la nueva imagen de fondo
- Usarla como fondo que cubra toda la pantalla (`object-cover`, `absolute inset-0`)
- Eliminar la imagen hero central (ya que el fondo YA contiene el logo, slogan y todo el contenido visual)
- Mantener las particulas animadas por encima del fondo para mayor profundidad
- Mantener el boton "Entrar" en la esquina superior derecha

**Estructura resultante**:

```text
+--------------------------------------------------+
|  Imagen de fondo (absolute, inset-0, z-0)        |
|  Canvas particulas (absolute, inset-0, z-1)      |
|                              [Entrar ->] (z-10)  |
|                                                   |
|            (contenido visual ya esta              |
|             en la imagen de fondo)                |
|                                                   |
+--------------------------------------------------+
```

---

## Archivos a Crear/Modificar

| Archivo | Accion |
|---------|--------|
| `src/assets/landing-bg.png` | **Crear** - Imagen de fondo |
| `src/pages/Landing.tsx` | **Modificar** - Usar imagen como fondo, quitar hero central |

---

## Resultado Esperado

- La imagen con el globo tecnologico, logo Processia y slogan ocupa todo el fondo de la pantalla
- Las particulas animadas flotan por encima dando profundidad
- El boton "Entrar" sigue visible y funcional arriba a la derecha

