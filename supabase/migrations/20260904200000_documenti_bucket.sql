-- Archivio documenti pazienti: bucket privato per i file caricati (consensi firmati,
-- referti, preventivi ecc.), accessibile solo allo staff autenticato.
insert into storage.buckets (id, name, public)
values ('documenti-pazienti', 'documenti-pazienti', false)
on conflict (id) do nothing;

CREATE POLICY "Staff read patient document files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documenti-pazienti' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff upload patient document files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documenti-pazienti' AND public.is_staff(auth.uid()));

CREATE POLICY "Admins delete patient document files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'documenti-pazienti' AND public.has_role(auth.uid(), 'admin'));
