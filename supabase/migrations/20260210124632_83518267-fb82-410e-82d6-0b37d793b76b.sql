
-- Table for valid demo access codes
CREATE TABLE public.demo_access_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.demo_access_codes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous SELECT to validate codes
CREATE POLICY "Anyone can read active codes"
  ON public.demo_access_codes
  FOR SELECT
  USING (true);

-- Table for access logs
CREATE TABLE public.demo_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_code TEXT NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT
);

ALTER TABLE public.demo_access_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous INSERT to log accesses
CREATE POLICY "Anyone can insert access logs"
  ON public.demo_access_logs
  FOR INSERT
  WITH CHECK (true);

-- Allow reading logs (for admin purposes)
CREATE POLICY "Anyone can read access logs"
  ON public.demo_access_logs
  FOR SELECT
  USING (true);

-- Insert initial demo code
INSERT INTO public.demo_access_codes (code, is_active)
VALUES ('PROCESSIA2025', true);
