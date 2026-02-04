

# Plan: Reemplazar Branding Lovable por Processia

## Resumen

Eliminar todas las referencias visuales a "Lovable" y reemplazarlas con el branding de Processia usando el logo proporcionado.

---

## Cambios Requeridos

### 1. Favicon del Navegador

**Archivo**: `index.html`

Actualmente el favicon es `public/favicon.ico` (un archivo genérico). Se reemplazará por el logo de Processia que proporcionaste.

**Acciones**:
- Copiar `user-uploads://Logo_Processia_1.png` a `public/favicon.png`
- Actualizar `index.html` para usar el nuevo favicon

```html
<!-- Antes -->
(sin link explícito, usa favicon.ico por defecto)

<!-- Después -->
<link rel="icon" href="/favicon.png" type="image/png">
```

---

### 2. Imágenes Open Graph y Twitter

**Archivo**: `index.html`

Las meta images actualmente apuntan a Lovable:
```html
<meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />
<meta name="twitter:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />
```

**Acciones**:
- Copiar el logo de Processia a `public/og-image.png`
- Actualizar las meta tags para usar la imagen local

```html
<meta property="og:image" content="/og-image.png" />
<meta name="twitter:image" content="/og-image.png" />
```

---

## Archivos a Modificar/Crear

| Archivo | Acción |
|---------|--------|
| `public/favicon.png` | **Crear** - Logo Processia como favicon |
| `public/og-image.png` | **Crear** - Logo Processia para compartir en redes |
| `index.html` | **Modificar** - Actualizar referencias de favicon y OG images |

---

## Resultado Esperado

- **Pestaña del navegador**: Mostrará el icono de Processia (las dos flechas entrelazadas verde-azul) en lugar del favicon anterior
- **Compartir en redes**: Cuando alguien comparta un link, aparecerá el logo de Processia
- **Sin referencias a Lovable** en el código visible para el usuario

---

## Nota

Los archivos internos como `lovable-tagger` en las dependencias son parte del sistema de desarrollo y no afectan la experiencia del usuario final, por lo que se mantienen intactos.

