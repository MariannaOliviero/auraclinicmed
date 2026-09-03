-- Promemoria e conferme via SMS: tracciamento su appointments + log invii
ALTER TABLE public.appointments
  ADD COLUMN reminder_sent_at timestamptz,
  ADD COLUMN confirmation_sent_at timestamptz;

CREATE TABLE public.sms_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('reminder', 'confirmation')),
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'inviato' CHECK (status IN ('inviato', 'errore')),
  provider_response text,
  sent_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Solo la Edge Function (service_role) scrive davvero; lo staff può leggere lo storico.
-- L'INSERT da client autenticato è concesso per compatibilità ma nel flusso reale
-- l'invio passa sempre dalla Edge Function "send-appointment-sms".
GRANT SELECT ON public.sms_log TO authenticated;
GRANT ALL ON public.sms_log TO service_role;
ALTER TABLE public.sms_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read sms log" ON public.sms_log
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE INDEX sms_log_appointment_idx ON public.sms_log (appointment_id);
CREATE INDEX sms_log_created_at_idx ON public.sms_log (created_at);
