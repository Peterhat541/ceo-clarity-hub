

# Plan: Ajustar tamanios y posicionamiento de la Landing

## Problemas detectados

Comparando la referencia con lo actual:

1. **Hero (logo + slogan) demasiado pequenio**: El `max-w` en desktop es `40%`, pero en la referencia ocupa aproximadamente el 55-60% del ancho.
2. **Subtitulo demasiado pequenio**: El `max-w` en desktop es `22%`, pero en la referencia ocupa aproximadamente el 35-40% del ancho.
3. **Subtitulo duplicado**: Parece haber un texto residual pequenio mas abajo. Esto puede ser porque el `mix-blend-mode: screen` no elimina completamente el fondo de las imagenes si no es negro puro, o hay algun otro elemento interfiriendo.
4. **Espaciado entre hero y subtitulo**: El `mt-4` actual es demasiado poco. En la referencia hay un poco mas de separacion.

## Cambios en `src/pages/Landing.tsx`

### Ajustar tamanios del hero

Cambiar las clases de tamanio:
- Antes: `max-w-[85%] md:max-w-[50%] lg:max-w-[40%]`
- Despues: `max-w-[90%] md:max-w-[65%] lg:max-w-[55%]`

### Ajustar tamanios del subtitulo

Cambiar las clases de tamanio:
- Antes: `max-w-[60%] md:max-w-[30%] lg:max-w-[22%]`
- Despues: `max-w-[70%] md:max-w-[45%] lg:max-w-[35%]`

### Ajustar espaciado

Cambiar el margen entre hero y subtitulo:
- Antes: `mt-4`
- Despues: `mt-6`

### Verificar mix-blend-mode

Si las imagenes r_7-2.png y r_8-2.png tienen fondo negro (no blanco), entonces `mix-blend-mode: screen` es correcto. Si tienen fondo blanco, `screen` haria que el blanco se vea como blanco brillante, lo cual explicaria el texto fantasma. Revisare las imagenes para confirmar y ajustar el blend mode si es necesario.

## Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Landing.tsx` | Aumentar `max-w` del hero y subtitulo, ajustar espaciado |

## Resultado esperado

El logo, slogan y subtitulo se veran con el tamanio correcto y proporcionado como en la imagen de referencia, sin texto duplicado ni elementos fantasma.
