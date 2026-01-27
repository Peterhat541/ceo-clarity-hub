-- Create table for client chat conversations
CREATE TABLE public.client_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups by client
CREATE INDEX idx_client_conversations_client_name ON public.client_conversations(client_name);
CREATE INDEX idx_client_conversations_created_at ON public.client_conversations(created_at);

-- Enable RLS
ALTER TABLE public.client_conversations ENABLE ROW LEVEL SECURITY;

-- Allow all access (no auth in this app)
CREATE POLICY "Allow all access to client_conversations"
  ON public.client_conversations
  FOR ALL
  USING (true)
  WITH CHECK (true);