
# Plan: Sistema de acceso demo + mejoras de navegacion

## Resumen

Tres cambios principales:
1. Anadir un formulario de acceso con codigo en la landing (debajo de "Sistemas internos a medida para CEOs")
2. Proteger las rutas internas para que solo se pueda acceder tras introducir el codigo
3. Mejorar la navegacion del logo en el header para que sea intuitiva

---

## 1. Acceso con codigo en la Landing

En la pagina `/landing`, debajo de la imagen (donde aparece "Sistemas internos a medida para CEOs"), se anade:
- Un campo de texto con placeholder "Codigo de acceso"
- Un boton "Acceder a la demo"
- Al introducir el codigo correcto, se guarda en `sessionStorage` y se redirige a `/` (seleccion de modo)

**El codigo se valida contra una tabla en la base de datos** para que puedas cambiarlo sin tocar codigo. Ademas se registra cada acceso en una tabla de logs.

### Tablas nuevas en la base de datos

**`demo_access_codes`** - codigos validos:
- `id` (uuid)
- `code` (texto, unico) - ej: "PROCESSIA2025"
- `is_active` (boolean, default true)
- `created_at` (timestamp)

**`demo_access_logs`** - registro de accesos:
- `id` (uuid)
- `access_code` (texto)
- `accessed_at` (timestamp, default now)
- `user_agent` (texto)

RLS: SELECT e INSERT abiertos en ambas tablas (acceso anonimo necesario para que funcione sin autenticacion).

Se insertara un codigo inicial, por ejemplo `PROCESSIA2025`, que podras compartir en los emails. Puedes cambiarlo cuando quieras desde la base de datos.

## 2. Proteccion de rutas

Se crea un componente `DemoGuard` que envuelve las rutas `/`, `/ceo` y `/admin`. Verifica que en `sessionStorage` exista la clave `demo_access`. Si no existe, redirige a `/landing`.

## 3. Mejora del logo en el header

El logo en la barra superior actualmente no tiene indicacion visual de que es clickable. Cambios:
- Anadir un texto "Inicio" o un icono de casa junto al logo
- O convertirlo en un boton con borde y hover visible, similar a los botones de "Vista CEO" / "Administracion"
- Al pasar el raton, mostrar un tooltip "Volver a seleccion de modo" o simplemente un efecto visual mas claro

La opcion mas limpia: anadir un boton explicito con icono de casa y texto "Inicio" al lado del logo, y eliminar el boton "Inicio" de la derecha (que actualmente va a `/landing`). El boton de la derecha pasa a ser "Cerrar sesion" o "Salir" que limpia el `sessionStorage` y vuelve a `/landing`.

---

## Archivos a crear/modificar

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| Migracion SQL | Crear | Tablas `demo_access_codes` y `demo_access_logs` + dato inicial |
| `src/pages/Landing.tsx` | Modificar | Anadir formulario de codigo debajo de la imagen |
| `src/components/auth/DemoGuard.tsx` | Crear | Componente que protege rutas verificando sessionStorage |
| `src/App.tsx` | Modificar | Envolver rutas con DemoGuard |
| `src/components/layout/HeaderNavigation.tsx` | Modificar | Logo + boton "Inicio" explicito a la izquierda, boton "Salir" a la derecha |

## Flujo del usuario

```text
Email con link + codigo
        |
        v
  /landing (ve la imagen de Processia + campo de codigo)
        |
        v
  Introduce codigo -> se valida -> se registra acceso
        |
        v
  / (seleccion de modo: Vista CEO o Administracion)
        |
        v
  /ceo o /admin (navegan libremente)
        |
  Logo + "Inicio" -> vuelve a /
  "Salir" -> limpia sesion, vuelve a /landing
```
