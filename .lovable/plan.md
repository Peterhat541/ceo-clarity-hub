

## Plan: Landing con codigo pre-escrito y adaptacion movil

### Cambio 1: Pre-rellenar el codigo de acceso

Cambiar el estado inicial de `code` de `""` a `"DEMO2026"` para que al cargar la pagina el campo ya tenga el codigo escrito y el usuario solo tenga que pulsar "Acceder".

### Cambio 2: Adaptar la landing a movil

El problema actual es que la landing usa una imagen de fondo con `object-contain` y posicionamiento absoluto con porcentajes fijos (`bottom-[18%]`), lo cual no escala bien en pantallas moviles. Los cambios:

- Anadir meta viewport correcta (ya deberia estar en `index.html`, se verificara)
- Cambiar el layout para que en movil la imagen ocupe la parte superior y el formulario quede debajo, en lugar de superpuesto con posicion absoluta
- Usar clases responsive de Tailwind (`md:`) para mantener el diseno desktop intacto
- En movil: formulario centrado verticalmente, imagen de fondo adaptada con `object-cover` en lugar de `object-contain`, y formulario con padding lateral adecuado
- Aumentar el `max-w` del formulario en movil para que ocupe mas ancho de pantalla
- Asegurar que el input y boton tengan tamano tactil adecuado (min 44px de alto)

### Detalle tecnico

**Archivo: `src/pages/Landing.tsx`**

1. Linea 9: Cambiar `useState("")` a `useState("DEMO2026")`
2. Reestructurar el layout para usar flexbox vertical en movil:
   - Contenedor principal: `flex flex-col` en movil, mantener el overlay en desktop
   - Imagen: `object-cover` en movil para llenar la pantalla, `object-contain` en desktop
   - Formulario: posicionado dentro del flujo normal en movil (no `absolute`), con `px-6` para padding lateral
   - Input y boton: altura minima de `py-3` en movil para mejor experiencia tactil
   - `max-w-xs` pasa a `max-w-sm` para mas espacio en movil

**Archivo: `index.html`** (solo verificar que el viewport meta ya existe)

