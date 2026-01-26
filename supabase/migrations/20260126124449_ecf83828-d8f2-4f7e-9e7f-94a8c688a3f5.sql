-- Crear enum para estados de cliente
CREATE TYPE public.client_status AS ENUM ('green', 'yellow', 'orange', 'red');

-- Crear enum para tipos de historial
CREATE TYPE public.history_type AS ENUM ('email', 'note', 'incident', 'event', 'call', 'meeting');

-- Crear enum para visibilidad
CREATE TYPE public.visibility_type AS ENUM ('team', 'ceo', 'both');

-- Crear enum para tipo de evento
CREATE TYPE public.event_type AS ENUM ('call', 'meeting', 'reminder');

-- Crear enum para estado de nota
CREATE TYPE public.note_status AS ENUM ('pending', 'seen', 'done');

-- Tabla de clientes
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status client_status NOT NULL DEFAULT 'green',
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de historial de clientes
CREATE TABLE public.client_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  type history_type NOT NULL,
  summary TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT 'system',
  visible_to visibility_type NOT NULL DEFAULT 'both',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de notas
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  due_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT NOT NULL DEFAULT 'CEO',
  visible_to visibility_type NOT NULL DEFAULT 'both',
  status note_status NOT NULL DEFAULT 'pending',
  target_employee TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de eventos
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type event_type NOT NULL,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_minutes INTEGER DEFAULT 15,
  notes TEXT,
  created_by TEXT NOT NULL DEFAULT 'CEO',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (para MVP sin auth - ajustar después)
CREATE POLICY "Allow all access to clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to client_history" ON public.client_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to events" ON public.events FOR ALL USING (true) WITH CHECK (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar datos de ejemplo
INSERT INTO public.clients (name, status, contact_name, email, phone) VALUES
('Nexus Tech', 'red', 'María González', 'maria@nexustech.com', '+34 612 345 678'),
('BlueSky Ventures', 'orange', 'Carlos Ruiz', 'carlos@bluesky.com', '+34 623 456 789'),
('Global Media', 'yellow', 'Ana López', 'ana@globalmedia.com', '+34 634 567 890'),
('Startup Lab', 'green', 'Pedro Martín', 'pedro@startuplab.com', '+34 645 678 901'),
('DataCore Solutions', 'green', 'Laura Sánchez', 'laura@datacore.com', '+34 656 789 012');