ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS converted_patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS converted_at timestamptz;

CREATE TABLE IF NOT EXISTS public.lead_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_notes TO authenticated;
GRANT ALL ON public.lead_notes TO service_role;

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read lead notes" ON public.lead_notes
  FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff create lead notes" ON public.lead_notes
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND author_id = auth.uid());

CREATE POLICY "Staff update own lead notes" ON public.lead_notes
  FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()) AND author_id = auth.uid())
  WITH CHECK (public.is_staff(auth.uid()) AND author_id = auth.uid());

CREATE POLICY "Admins delete lead notes" ON public.lead_notes
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.convert_lead_to_patient(_lead_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead public.leads%ROWTYPE;
  v_patient_id uuid;
  v_names text[];
BEGIN
  SELECT * INTO v_lead FROM public.leads WHERE id = _lead_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead non trovato';
  END IF;
  IF v_lead.converted_patient_id IS NOT NULL THEN
    RETURN v_lead.converted_patient_id;
  END IF;

  v_names := regexp_split_to_array(trim(v_lead.name), '\s+');

  INSERT INTO public.patients (
    first_name,
    last_name,
    email,
    phone,
    note,
    health_data_consent,
    health_data_consent_at,
    created_by
  ) VALUES (
    v_names[1],
    array_to_string(v_names[2:], ' '),
    v_lead.email,
    v_lead.phone,
    v_lead.note,
    true,
    now(),
    auth.uid()
  )
  RETURNING id INTO v_patient_id;

  UPDATE public.leads
  SET status = 'convertito',
      converted_patient_id = v_patient_id,
      converted_at = now()
  WHERE id = _lead_id;

  RETURN v_patient_id;
END;
$$;

REVOKE ALL ON FUNCTION public.convert_lead_to_patient(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.convert_lead_to_patient(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_lead_notes_updated_at ON public.lead_notes;
CREATE TRIGGER update_lead_notes_updated_at
  BEFORE UPDATE ON public.lead_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();