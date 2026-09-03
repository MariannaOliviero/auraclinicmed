-- SOLO PER LA DEMO "AURA CLINIC": chi si registra riceve subito il ruolo "staff"
-- e può quindi entrare nel gestionale senza bisogno che un admin lo abiliti a mano.
--
-- ATTENZIONE: quando questo prodotto verrà consegnato a un cliente reale, questa parte
-- va RIMOSSA (vedi ISTRUZIONI_MODIFICHE.md) perché in produzione i ruoli devono essere
-- assegnati solo da un amministratore, altrimenti chiunque si registri vedrebbe i dati
-- reali dei pazienti.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;

  -- Auto-assegnazione ruolo "staff" per la demo pubblica
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'staff')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END; $$;
