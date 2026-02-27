

## Plan: Esfera permanente centrada como fondo del chat

**Problema actual**: La esfera se renderiza dentro de bloques condicionales (`showWelcome`, lista de mensajes, loading) y se desmonta al cambiar de estado. Además hay un sticky header duplicado.

**Solución**: Convertir la esfera en un elemento de fondo fijo centrado en el área del chat, siempre visible independientemente del estado.

### Cambios en `src/components/ai/AIChat.tsx`

1. **Eliminar** la esfera del sticky header (líneas 235-237)
2. **Eliminar** la esfera grande de la pantalla de bienvenida (línea 242)
3. **Eliminar** las esferas individuales junto a cada mensaje assistant (líneas 268-271)
4. **Eliminar** la esfera del indicador de loading (líneas 283-285)
5. **Añadir** una esfera permanente centrada como capa de fondo dentro del contenedor principal del chat:
   - Posición absoluta centrada (`absolute inset-0 flex items-center justify-center`)
   - Z-index bajo para que quede detrás del contenido
   - `pointer-events-none` para no bloquear interacción
   - Tamaño grande (~120px) con `isThinking={true}` para rotación constante
   - Opacidad reducida (~0.4) para que no interfiera con la lectura del texto

```text
Estructura resultante:

┌─────────────────────────┐
│  [contexto cliente]     │
├─────────────────────────┤
│                         │
│    ┌───────────┐        │  ← Capa fondo (absolute, z-0)
│    │  ESFERA   │        │     siempre visible, opacity 0.4
│    │  giratoria │        │
│    └───────────┘        │
│                         │
│  mensajes / welcome     │  ← Capa contenido (relative, z-10)
│  encima de la esfera    │
│                         │
├─────────────────────────┤
│  [input area]           │
└─────────────────────────┘
```

Esto asegura que la esfera **nunca se desmonta** y permanece visible continuamente como identidad visual de la IA.

