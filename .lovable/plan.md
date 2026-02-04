
# Plan: Home de Selección + Micrófono Whisper + Nueva Paleta de Colores

## Resumen

Este plan implementa tres funcionalidades:
1. **Pantalla de inicio** con selección de modo (CEO / Administración)
2. **Micrófono funcional** usando OpenAI Whisper para transcripción de voz
3. **Nueva paleta de colores** según especificaciones

---

## Parte 1: Nueva Paleta de Colores

### Colores especificados

| Elemento | Color HEX | Uso |
|----------|-----------|-----|
| Fondo | `#131313` | Background principal |
| Botones/Títulos destacados | `#25E0B7` | Primary, accent, títulos |
| Texto normal | `#FFFFFF` | Foreground general |

### Conversión a HSL (para variables CSS)

| Color | HSL |
|-------|-----|
| `#131313` | 0 0% 7.5% |
| `#25E0B7` | 161 75% 51% |
| `#FFFFFF` | 0 0% 100% |

### Archivo a modificar

| Archivo | Acción |
|---------|--------|
| `src/index.css` | Actualizar variables CSS `:root` |

### Variables que cambian

```css
--background: 0 0% 7.5%;      /* #131313 */
--foreground: 0 0% 100%;      /* #FFFFFF */
--primary: 161 75% 51%;       /* #25E0B7 */
--accent: 161 75% 51%;        /* #25E0B7 */
/* Cards y elementos secundarios ajustados para coherencia */
```

---

## Parte 2: Pantalla de Inicio (Home)

### Descripcion
Una pantalla inicial que muestra el saludo "Hola, Juan" y dos tarjetas grandes para seleccionar el modo de trabajo.

### Archivos a crear/modificar

| Archivo | Acción | Descripcion |
|---------|--------|-------------|
| `src/pages/Home.tsx` | Crear | Nueva pagina de seleccion de modo |
| `src/App.tsx` | Modificar | Nueva ruta "/" para Home, mover CEO a "/ceo" |
| `src/components/layout/ViewSwitcher.tsx` | Modificar | Actualizar rutas |

### Diseño de la pantalla

```text
┌─────────────────────────────────────────────────────┐
│                                                     │
│              [Logo Processia]                       │
│                                                     │
│         Hola, Juan                                  │
│         Selecciona un modo de trabajo               │
│                                                     │
│   ┌───────────────────┐  ┌───────────────────┐     │
│   │       TARGET      │  │     CLIPBOARD     │     │
│   │                   │  │                   │     │
│   │    VISTA CEO      │  │  ADMINISTRACION   │     │
│   │                   │  │                   │     │
│   │   Dashboard       │  │   Base de datos   │     │
│   │   ejecutivo       │  │   de clientes     │     │
│   └───────────────────┘  └───────────────────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Estructura de rutas actualizada

- `/` → Home (seleccion de modo)
- `/ceo` → Dashboard CEO (actual Index)
- `/admin` → Administracion

---

## Parte 3: Microfono con OpenAI Whisper

### Flujo de usuario

1. Usuario pulsa el boton de microfono
2. Se muestra indicador visual "Escuchando..." con animacion roja
3. Se captura audio del microfono (mantener pulsado o click para toggle)
4. Al soltar/parar: se envia audio a Edge Function → OpenAI Whisper
5. Texto transcrito se coloca en el input
6. Usuario puede editar o enviar directamente

### Archivos a crear/modificar

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| `supabase/functions/transcribe/index.ts` | Crear | Edge Function que llama a Whisper |
| `src/hooks/useAudioRecorder.ts` | Crear | Hook para grabar audio del microfono |
| `src/components/ai/AIChat.tsx` | Modificar | Integrar boton de microfono funcional |

### Estados del microfono

- **Inactivo**: Icono normal gris
- **Grabando**: Animacion de pulso rojo, icono rojo
- **Procesando**: Spinner, texto "Transcribiendo..."
- **Error**: Toast con mensaje (ej: "Permiso de microfono denegado")

---

## Detalles Tecnicos

### 1. Edge Function `transcribe`

```typescript
// Recibe: audio en base64 (formato webm)
// Proceso: 
//   1. Decodifica base64 a Blob
//   2. Envia a OpenAI Whisper API (model: whisper-1)
//   3. Idioma: "es" (espanol)
// Devuelve: { text: "transcripcion..." }
```

### 2. Hook useAudioRecorder

```typescript
interface UseAudioRecorder {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  isRecording: boolean;
  isSupported: boolean;
  error: string | null;
}
```

- Usa MediaRecorder API nativa del navegador
- Formato de salida: WebM (compatible con Whisper)
- Duracion maxima: 30 segundos
- Manejo de permisos de microfono

### 3. Integracion en AIChat

- Click en microfono → inicia grabacion
- Segundo click → para grabacion → envia a transcribir
- Mientras graba: boton con animacion de pulso
- Al recibir texto: lo coloca en el input (no envia automaticamente)

---

## Requisitos Previos

Se necesita configurar tu **OPENAI_API_KEY** como secret en el proyecto para que la Edge Function pueda llamar a Whisper.

---

## Orden de Implementacion

1. **Solicitar OPENAI_API_KEY** - Configurar secret
2. **Actualizar `src/index.css`** - Nueva paleta de colores
3. **Crear `supabase/functions/transcribe/index.ts`** - Edge Function Whisper
4. **Crear `src/hooks/useAudioRecorder.ts`** - Hook de grabacion
5. **Modificar `src/components/ai/AIChat.tsx`** - Boton funcional
6. **Crear `src/pages/Home.tsx`** - Pantalla de inicio
7. **Actualizar `src/App.tsx`** - Nuevas rutas
8. **Actualizar `ViewSwitcher.tsx`** - Rutas actualizadas

---

## Resultado Esperado

- **Colores**: Fondo oscuro #131313, botones y titulos en verde #25E0B7, texto blanco #FFFFFF
- **Home**: Pantalla inicial con dos tarjetas para elegir modo
- **Microfono**: Boton funcional que graba voz y la transcribe usando tu API de OpenAI
- **Rutas**: `/` (Home), `/ceo` (Dashboard), `/admin` (Administracion)
