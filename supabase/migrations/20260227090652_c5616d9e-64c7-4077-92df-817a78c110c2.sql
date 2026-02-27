
-- Table for app users (employees)
CREATE TABLE public.app_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  ai_instructions text NOT NULL DEFAULT '',
  avatar_color text NOT NULL DEFAULT '#3b82f6',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);

-- Table for per-user chat messages
CREATE TABLE public.user_chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  client_context text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to user_chat_messages" ON public.user_chat_messages FOR ALL USING (true) WITH CHECK (true);

-- Seed initial users
INSERT INTO public.app_users (name, role, ai_instructions, avatar_color) VALUES
  ('Carlos', 'Director General', 'Sé directo y conciso. Prioriza datos financieros y estratégicos.', '#3b82f6'),
  ('Pedro', 'Director Comercial', 'Enfócate en ventas, clientes y oportunidades de negocio.', '#10b981'),
  ('María', 'Directora de Operaciones', 'Prioriza eficiencia operativa, plazos y recursos.', '#f59e0b'),
  ('Paula', 'Directora de Marketing', 'Céntrate en campañas, métricas de marketing y comunicación.', '#ec4899');
