-- Añadir nuevas columnas de negocio real a la tabla clients
-- Manteniendo todas las columnas existentes

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS project_type text,
ADD COLUMN IF NOT EXISTS work_description text,
ADD COLUMN IF NOT EXISTS budget text,
ADD COLUMN IF NOT EXISTS project_dates text,
ADD COLUMN IF NOT EXISTS project_manager text,
ADD COLUMN IF NOT EXISTS pending_tasks text,
ADD COLUMN IF NOT EXISTS incidents text,
ADD COLUMN IF NOT EXISTS last_contact text;

-- Añadir comentarios descriptivos para documentar las columnas
COMMENT ON COLUMN public.clients.project_type IS 'Tipo de proyecto: Cambio de ventanas, Cerramiento de terraza, etc.';
COMMENT ON COLUMN public.clients.work_description IS 'Descripción detallada del trabajo a realizar';
COMMENT ON COLUMN public.clients.budget IS 'Presupuesto: Total, señal cobrada y pendiente';
COMMENT ON COLUMN public.clients.project_dates IS 'Fechas clave: medición, fabricación, instalación';
COMMENT ON COLUMN public.clients.project_manager IS 'Responsable interno del proyecto';
COMMENT ON COLUMN public.clients.pending_tasks IS 'Lista de tareas pendientes';
COMMENT ON COLUMN public.clients.incidents IS 'Incidencias o retrasos del proyecto';
COMMENT ON COLUMN public.clients.last_contact IS 'Fecha y resumen del último contacto con el cliente';