
# Plan: Rediseño Visual Estilo App Móvil

## Objetivo

Transformar la interfaz actual en un diseño más amigable, visual y tipo "app móvil" inspirado en la imagen de referencia, manteniendo la funcionalidad actual.

---

## Elementos Clave del Nuevo Diseño

### 1. Cabecera con Saludo Personalizado
- "Hola, Juan!" con avatar del CEO
- Texto secundario contextual ("¿Cómo va el día?")
- Estilo más cálido y personal

### 2. Tarjeta Principal del Asistente IA
- Tarjeta destacada con gradiente suave (teal/azul)
- Icono/ilustración grande del asistente
- Mensaje "¿Qué necesitas hoy?" 
- Botón "Hablar" prominente que activa el chat
- Bordes extra redondeados con sombra suave

### 3. Tarjetas de Funcionalidades (Grid 1 columna)
- Diseño tipo lista con iconos ilustrativos a la izquierda
- Cada tarjeta representa una función:
  - "Agenda del día" - Ver eventos programados
  - "Clientes que requieren atención" - Estado de clientes
  - "Notas del equipo" - Mensajes pendientes
  - "Enviar instrucción" - Crear nota para el equipo
- Fondo claro/gris suave con sombras elevadas
- Esquinas muy redondeadas (2xl)

### 4. Sección "Mi Espacio" (Grid de iconos circulares)
- Iconos grandes en círculos
- Accesos rápidos: Agenda, Incidencias, Clientes, Fechas
- Estilo ilustrativo con colores suaves

### 5. Cambios de Estilo Global
- Aumentar border-radius a 2xl (1rem)
- Sombras más suaves y elevadas (shadow-lg)
- Espaciado más generoso
- Opción de tema claro (o mantener oscuro con ajustes)

---

## Estructura del Layout Propuesto

```text
┌────────────────────────────────────────────────────────────┐
│ Logo Processia                                    [Avatar] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  "Hola, Juan!"                                             │
│  ¿Cómo va el día de hoy?                                   │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │         [Icono IA Grande]                            │  │
│  │                                                      │  │
│  │         "Cuéntame, ¿qué necesitas?"                  │  │
│  │                                                      │  │
│  │              [ Hablar ]                              │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  Funcionalidades                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [📅]  Agenda del día                                 │  │
│  │       3 eventos programados                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [👥]  Clientes que requieren atención                │  │
│  │       2 en rojo, 1 en naranja                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [💬]  Notas del equipo                               │  │
│  │       1 pendiente de revisar                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  Mi espacio                                                │
│    ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                      │
│    │ 📅  │  │ ⚠️  │  │ 👥  │  │ 📆  │                      │
│    │Citas│  │Inci.│  │Clien│  │Fecha│                      │
│    └─────┘  └─────┘  └─────┘  └─────┘                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Archivos a Modificar

### 1. `src/index.css`
- Añadir variables para tema claro (opcional)
- Nuevas clases para sombras suaves y gradientes
- Aumentar radius por defecto

### 2. `src/pages/Index.tsx`
- Reestructurar layout con nuevo diseño
- Cabecera con saludo "Hola, Juan!" + avatar
- Tarjeta principal del asistente IA
- Lista de funcionalidades en formato tarjeta
- Sección "Mi espacio" con iconos circulares

### 3. `src/components/layout/CEOLayout.tsx`
- Ajustar layout para diseño más centrado
- Posiblemente ocultar chat lateral para mobile-first
- Integrar chat como modal/overlay en lugar de panel fijo

### 4. `src/components/dashboard/SummaryCard.tsx`
- Rediseñar como tarjeta de funcionalidad
- Iconos más grandes y ilustrativos
- Descripción secundaria más prominente

### 5. Nuevos Componentes
- `src/components/dashboard/AIHeroCard.tsx` - Tarjeta principal del asistente
- `src/components/dashboard/QuickAccessGrid.tsx` - Grid de iconos "Mi espacio"
- `src/components/dashboard/FeatureCard.tsx` - Tarjetas de funcionalidades

### 6. `tailwind.config.ts`
- Ajustar border-radius predeterminado
- Añadir nuevas sombras personalizadas

---

## Decisión: Tema de Color

La imagen de referencia usa fondo blanco/claro. Tengo dos opciones:

| Opción | Descripción |
|--------|-------------|
| A) Tema claro | Cambiar a fondo blanco con acentos teal (como la imagen) |
| B) Mantener oscuro | Mantener fondo negro pero aplicar el nuevo estilo visual |

Recomiendo **Opción A (Tema claro)** para mayor similitud con la referencia, pero puedo implementar B si prefieres mantener la estética oscura actual.

---

## Resultado Esperado

Una interfaz más amigable, visual y tipo "app móvil" donde:
- El CEO ve un saludo personalizado al entrar
- La tarjeta del asistente IA es el elemento central y destacado
- Las funcionalidades se presentan como tarjetas fáciles de tocar
- Los accesos rápidos están organizados en iconos circulares
- El diseño se siente más como una app móvil moderna
