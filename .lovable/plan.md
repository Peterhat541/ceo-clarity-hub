
Objetivo: que la esfera no desaparezca y permanezca siempre visible cuando se muestra el bloque de bienvenida (“Hola, Carlos…”).

1) Corregir la causa de corte de animación en `src/components/ai/AIBrainSphere.tsx`
- Ajustar el dibujo de órbitas para no pasar radios negativos al canvas.
- Cambiar `ctx.ellipse(..., r * Math.cos(tilt), ...)` por una versión segura:
  - `radiusY = Math.max(0.1, Math.abs(r * Math.cos(tilt)))`
- Mantener el ángulo de rotación visual por separado para conservar el efecto 3D.
- Envolver el frame de animación en protección mínima (`try/catch`) para evitar que un frame inválido congele la esfera completa.

2) Mantener la esfera fija en la vista de bienvenida en `src/components/ai/AIChat.tsx`
- Dejar `AIBrainSphere` dentro del bloque de bienvenida, pero con contenedor estable y clases fijas para que no “parpadee” en rerenders.
- No condicionar su render por timers ni estados transitorios; solo por `showWelcome`.
- Mantenerla por encima del título exactamente en la misma posición visual actual.

3) Verificación funcional después del cambio
- Entrar al perfil/chat y esperar >15s en bienvenida: la esfera debe seguir animando sin desaparecer.
- Repetir navegando fuera y dentro del perfil: la esfera debe volver y mantenerse estable.
- Confirmar que el resto del chat (mensajes, historial, envío) no cambia de comportamiento.

Sección técnica (resumen)
- Archivo 1: `AIBrainSphere.tsx` → fix de canvas para radios no negativos + robustez del loop de animación.
- Archivo 2: `AIChat.tsx` → garantizar render persistente de la esfera mientras `showWelcome === true`.
- No requiere cambios de base de datos ni backend.
