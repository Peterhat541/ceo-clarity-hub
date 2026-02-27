

## Plan: Input estilo Gemini debajo de las sugerencias

### Cambio
Mover la barra de input de la parte inferior fija a justo debajo de las tarjetas de sugerencias en la pantalla de bienvenida, dentro de un contenedor redondeado estilo Gemini. Cuando hay conversación activa, el input se mantiene abajo pero con el mismo estilo visual.

### Implementación en `AIChat.tsx`

1. **Pantalla de bienvenida**: Mover el input dentro del bloque `showWelcome`, justo después del grid de sugerencias. Envolverlo en un contenedor con bordes redondeados, fondo sutil (`bg-card/80 border border-border/50 rounded-2xl`), con el textarea/input y los botones de mic/enviar dentro, estilo compacto como Gemini.

2. **Pantalla de conversación**: Mantener el input abajo pero aplicar el mismo estilo visual redondeado.

3. **Estilo del contenedor**: Rectángulo redondeado (`rounded-2xl`), padding interno, input sin bordes propios (transparente), botones de mic y enviar alineados a la derecha dentro del contenedor. El input ocupa todo el ancho del contenedor.

4. **Layout**: En welcome, cambiar de `flex-col h-full` con input fijo abajo a que el input forme parte del flujo centrado. Eliminar el `border-t` del input en welcome.

