CREATE POLICY "Staff read case photo files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'case-photos' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff upload case photo files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'case-photos' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff update case photo files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'case-photos' AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'case-photos' AND public.is_staff(auth.uid()));

CREATE POLICY "Admins delete case photo files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'case-photos' AND public.has_role(auth.uid(), 'admin'));