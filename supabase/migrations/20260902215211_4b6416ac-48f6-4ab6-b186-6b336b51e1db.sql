CREATE OR REPLACE FUNCTION public.convert_lead_to_patient(_lead_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_lead public.leads%ROWTYPE;
  v_patient_id uuid;
  v_names text[];
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Operazione riservata allo staff';
  END IF;

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