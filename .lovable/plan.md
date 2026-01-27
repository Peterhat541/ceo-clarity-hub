
# Plan: Crear Historial Empresarial por Cliente

## Objetivo

Poblar la tabla `client_history` con registros de interacciones comerciales reales (llamadas, emails, incidencias, reuniones) para que cuando el CEO pregunte sobre un cliente, la IA tenga contexto histórico para responder.

---

## Diferencia con lo anterior

| Tabla | Propósito |
|-------|-----------|
| `client_conversations` | Chat IA ↔ CEO (ya poblada) |
| `client_history` | **Historial empresarial real** (llamadas, emails, incidencias) |

---

## Historial a Crear por Cliente

### 1. Nexus Tech (Crítico)
| Fecha | Tipo | Resumen |
|-------|------|---------|
| -15 días | call | Llamada inicial: María reporta retrasos en facturación |
| -10 días | email | Email enviado con propuesta de plan de pagos |
| -7 días | incident | Incidencia abierta: 3 facturas pendientes (€45,000) |
| -5 días | call | Seguimiento telefónico, esperando aprobación interna |
| -2 días | note | Nota interna: Priorizar resolución antes de fin de mes |

### 2. BlueSky Ventures (Atención)
| Fecha | Tipo | Resumen |
|-------|------|---------|
| -20 días | meeting | Reunión renovación: Carlos interesado en ampliar servicios |
| -14 días | email | Propuesta enviada: ampliación a €180,000/año |
| -10 días | call | Llamada: Carlos necesita aprobación de dirección |
| -5 días | note | Alerta: contrato expira 15 febrero |

### 3. Global Media (Pendiente)
| Fecha | Tipo | Resumen |
|-------|------|---------|
| -12 días | meeting | Reunión proyecto digitalización con Ana López |
| -10 días | email | Presupuesto enviado: €95,000 |
| -7 días | call | Ana solicita semana extra para revisar con CFO |

### 4. DataCore Solutions (Estable)
| Fecha | Tipo | Resumen |
|-------|------|---------|
| -30 días | meeting | Revisión trimestral Q4 - sin incidencias |
| -20 días | email | Feedback positivo de Laura Sánchez |
| -7 días | note | Oportunidad upselling: módulo analytics |

### 5. Startup Lab (Estable)
| Fecha | Tipo | Resumen |
|-------|------|---------|
| -14 días | meeting | Kick-off onboarding con Pedro Martín |
| -10 días | call | Formación completada al 50% |
| -5 días | note | Pendiente: integración con CRM |
| -2 días | event | Sesión técnica programada para jueves |

---

## Detalle Técnico

### Inserción de datos
Se ejecutará un INSERT masivo en `client_history` usando los IDs de los clientes existentes.

### Estructura del INSERT
```sql
INSERT INTO client_history 
  (client_id, type, summary, created_by, visible_to, created_at)
VALUES
  ('uuid', 'call', 'Descripción...', 'CEO', 'both', NOW() - INTERVAL 'X days');
```

### Tipos disponibles
- `email` - Comunicaciones por correo
- `call` - Llamadas telefónicas
- `meeting` - Reuniones presenciales/virtuales
- `note` - Notas internas del equipo
- `incident` - Incidencias o problemas
- `event` - Eventos programados

---

## Resultado Esperado

Cuando el CEO pregunte "¿Cuál es la situación con Nexus Tech?" o "¿Qué ha pasado con BlueSky?", la IA consultará `client_history` y responderá con el contexto histórico real de la relación comercial.
