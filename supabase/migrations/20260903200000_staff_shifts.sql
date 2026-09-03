-- Gestione turni staff
CREATE TABLE public.staff_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  role_label text,
  note text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT staff_shifts_valid_range CHECK (ends_at > starts_at)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_shifts TO authenticated;
GRANT ALL ON public.staff_shifts TO service_role;
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;

-- Tutto lo staff vede i turni (serve per la copertura del team)
CREATE POLICY "Staff read shifts" ON public.staff_shifts
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- Solo gli admin creano/modificano/eliminano i turni
CREATE POLICY "Admins manage shifts" ON public.staff_shifts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER staff_shifts_updated_at
  BEFORE UPDATE ON public.staff_shifts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX staff_shifts_starts_at_idx ON public.staff_shifts (starts_at);
CREATE INDEX staff_shifts_staff_id_idx ON public.staff_shifts (staff_id);
