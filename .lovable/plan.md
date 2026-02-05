
# Plan: Fondo Animado con Partículas y Red de Conexiones

## Resumen

Crear un fondo animado profesional para la landing page similar al de processia.es, con partículas brillantes verdes conectadas por líneas que flotan suavemente, creando un efecto de red tecnológica en movimiento.

---

## Enfoque Técnico

Utilizare **Canvas API con React** para crear el efecto de partículas. Esta es la solución mas ligera y profesional que no requiere librerías externas pesadas.

---

## Componentes a Crear

### 1. Componente ParticleNetwork

**Archivo**: `src/components/landing/ParticleNetwork.tsx`

Un componente React que renderiza un canvas a pantalla completa con:

- **50-80 partículas** flotando con movimiento aleatorio suave
- **Lineas de conexión** entre partículas cercanas (distancia < 150px)
- **Color verde menta** (#25E0B7) - el color primario de la marca
- **Efecto de brillo/glow** en las partículas
- **Diferentes tamaños** para crear sensación de profundidad
- **Opacidad variable** en las lineas según la distancia

**Lógica de animación**:
```text
Por cada frame:
  1. Mover cada partícula según su velocidad
  2. Rebotar en los bordes del canvas
  3. Dibujar conexiones entre partículas cercanas
  4. Dibujar cada partícula con su glow
```

---

### 2. Actualizar Landing Page

**Archivo**: `src/pages/Landing.tsx`

- Añadir el componente `ParticleNetwork` como fondo absoluto
- Mantener el contenido actual (imagen hero + botón) por encima
- Asegurar que el fondo negro puro se mantenga

---

## Estructura del Componente ParticleNetwork

```text
+--------------------------------------------------+
|  Canvas (position: absolute, inset: 0, z-index: 0)
|                                                   |
|     ●━━━━━━━●                    ●                |
|      \     /                    / \               |
|       \   /        ●━━━━━━━━━━●   \              |
|        \ /                          \             |
|         ●              ●━━━━━●━━━━━━●            |
|        / \            /                           |
|       /   ●━━━━━━━━━●                            |
|      ●                                            |
+--------------------------------------------------+
```

---

## Archivos a Crear/Modificar

| Archivo | Accion |
|---------|--------|
| `src/components/landing/ParticleNetwork.tsx` | **Crear** - Componente canvas animado |
| `src/pages/Landing.tsx` | **Modificar** - Integrar fondo de partículas |

---

## Detalles de Implementacion

### Configuracion de Particulas

| Parametro | Valor |
|-----------|-------|
| Numero de particulas | 60-80 |
| Tamaño | 1-3px radio |
| Velocidad | 0.2-0.5 px/frame |
| Distancia maxima conexión | 150px |
| Color | hsl(161, 75%, 51%) - Verde menta |
| Opacidad particulas | 0.6-1.0 |
| Opacidad lineas | 0.1-0.4 (según distancia) |

### Optimizaciones de Rendimiento

- Uso de `requestAnimationFrame` para animación fluida
- Cleanup del animation frame al desmontar
- Canvas responsive que se ajusta al tamaño de ventana
- Limitar particulas en dispositivos móviles

---

## Resultado Esperado

- Fondo animado profesional idéntico al de processia.es
- Partículas verdes brillantes flotando suavemente
- Red de conexiones que se forman y desaparecen dinámicamente
- La imagen hero se mantiene centrada sobre el fondo
- Rendimiento fluido a 60fps
- Responsive en todos los dispositivos
