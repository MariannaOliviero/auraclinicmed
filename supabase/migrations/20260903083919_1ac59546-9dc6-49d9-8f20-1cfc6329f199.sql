CREATE TABLE public.case_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'viso',
  description text,
  meta text,
  before_path text,
  after_path text,
  before_public_path text,
  after_public_path text,
  face_anonymized boolean NOT NULL DEFAULT false,
  publication_consent boolean NOT NULL DEFAULT false,
  consent_at timestamp with time zone,
  consent_signer text,
  consent_revoked_at timestamp with time zone,
  consent_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_photos TO authenticated;
GRANT SELECT ON public.case_photos TO anon;
GRANT ALL ON public.case_photos TO service_role;

ALTER TABLE public.case_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read case photos" ON public.case_photos
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Public read published case photos" ON public.case_photos
  FOR SELECT TO anon USING (
    published = true AND publication_consent = true AND consent_revoked_at IS NULL
  );

CREATE POLICY "Staff create case photos" ON public.case_photos
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff update case photos" ON public.case_photos
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Admins delete case photos" ON public.case_photos
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER case_photos_updated_at
  BEFORE UPDATE ON public.case_photos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.validate_case_photo_publication()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.published = true AND (NEW.publication_consent = false OR NEW.consent_revoked_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Impossibile pubblicare un caso senza consenso valido';
  END IF;
  IF NEW.publication_consent = true AND NEW.consent_at IS NULL THEN
    NEW.consent_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER case_photos_validate_publication
  BEFORE INSERT OR UPDATE ON public.case_photos
  FOR EACH ROW EXECUTE FUNCTION public.validate_case_photo_publication();

CREATE INDEX case_photos_published_idx ON public.case_photos (published, category, sort_order);