
# Plan: Crear Historial Ficticio de Conversaciones por Cliente

## Objetivo

Poblar la tabla `client_conversations` con conversaciones de prueba realistas para cada cliente, permitiendo probar correctamente la funcionalidad de persistencia del chat.

---

## Clientes Existentes

| Cliente | Estado | Contacto |
|---------|--------|----------|
| Nexus Tech | 🔴 Crítico | María González |
| BlueSky Ventures | 🟠 Atención | Carlos Ruiz |
| Global Media | 🟡 Pendiente | Ana López |
| DataCore Solutions | 🟢 Estable | Laura Sánchez |
| Startup Lab | 🟢 Estable | Pedro Martín |

---

## Conversaciones Ficticias a Crear

### 1. Nexus Tech (Crítico)
Escenario: Problema de facturación urgente

```text
Usuario: ¿Cuál es la situación actual con Nexus Tech?
IA: Nexus Tech tiene una incidencia crítica de facturación. Hay 3 facturas pendientes por un total de €45,000. María González reportó el problema hace 5 días y está esperando respuesta.
Usuario: ¿Qué pasos hemos tomado hasta ahora?
IA: El equipo financiero envió una propuesta de plan de pagos el día 22. Estamos esperando confirmación. Recomiendo llamar a María hoy para hacer seguimiento.
Usuario: Agenda una llamada con María para mañana a las 10:00
IA: He creado el evento "Llamada seguimiento facturación - Nexus Tech" para mañana a las 10:00. ¿Quieres que prepare un resumen de puntos a tratar?
```

### 2. BlueSky Ventures (Atención)
Escenario: Renovación de contrato pendiente

```text
Usuario: ¿Qué pasa con BlueSky Ventures?
IA: BlueSky Ventures tiene el contrato expirando el 15 de febrero. Carlos Ruiz mencionó interés en ampliar servicios, pero necesita aprobación de su dirección.
Usuario: ¿Cuánto facturamos con ellos?
IA: Facturación anual actual: €120,000. Con la ampliación propuesta subiría a €180,000. Es uno de nuestros clientes top 5.
Usuario: Envía una nota al equipo comercial para preparar propuesta
IA: Nota enviada al equipo: "Preparar propuesta de renovación ampliada para BlueSky Ventures. Fecha límite: 1 de febrero."
```

### 3. Global Media (Pendiente)
Escenario: Esperando decisión sobre nuevo proyecto

```text
Usuario: Estado de Global Media
IA: Global Media está evaluando nuestra propuesta para el proyecto de digitalización. Ana López pidió una semana más para revisar el presupuesto con su CFO.
Usuario: ¿Cuándo fue el último contacto?
IA: Última reunión: 20 de enero. Ana comentó que el proyecto es prioritario pero necesitan ajustar presupuesto Q1.
```

### 4. DataCore Solutions (Estable)
Escenario: Cliente satisfecho con servicio regular

```text
Usuario: ¿Cómo va DataCore?
IA: DataCore Solutions está al día en todos los pagos y el servicio funciona sin incidencias. Laura Sánchez envió feedback positivo la semana pasada.
Usuario: Perfecto, ¿alguna oportunidad de upselling?
IA: Sí, podrían beneficiarse del módulo de analytics avanzado. Recomiendo mencionarlo en la próxima revisión trimestral (marzo).
```

### 5. Startup Lab (Estable)
Escenario: Nuevo cliente en onboarding

```text
Usuario: ¿Cómo va el onboarding de Startup Lab?
IA: Startup Lab completó el 80% del onboarding. Pedro Martín está muy activo y ha hecho todas las formaciones. Faltan configurar las integraciones con su CRM.
Usuario: ¿Cuándo terminamos?
IA: Estimación: esta semana. Tenemos sesión técnica programada para el jueves.
```

---

## Implementación

### Acción Requerida
Ejecutar un INSERT masivo en la tabla `client_conversations` con las conversaciones ficticias, usando los IDs reales de los clientes y timestamps escalonados para simular conversaciones pasadas.

### Estructura de Datos
Cada mensaje tendrá:
- `client_id`: UUID del cliente
- `client_name`: Nombre del cliente
- `role`: "user" o "assistant"
- `content`: Texto del mensaje
- `created_at`: Timestamps escalonados (hace 1-7 días)

---

## Resultado Esperado

Al abrir el chat de cualquier cliente, se cargará automáticamente su historial de conversación ficticio, permitiendo:
- Probar la persistencia de mensajes
- Ver cómo se visualiza el historial previo
- Continuar conversaciones existentes
- Probar el botón de limpiar conversación
