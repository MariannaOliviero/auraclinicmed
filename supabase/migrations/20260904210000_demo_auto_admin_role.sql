-- SOLO PER LA DEMO "AURA CLINIC": chi si registra riceve il ruolo "admin" (non solo "staff"),
-- così un potenziale cliente che prova il gestionale può esplorare TUTTE le funzionalità
-- (creare turni, gestire il team, eliminare record di prova), non solo quelle riservate allo staff.
--
-- ATTENZIONE: quando questo prodotto verrà consegnato a un cliente reale, questa parte
-- va RIMOSSA (vedi ISTRUZIONI_MODIFICHE.md) — in produzione i ruoli devono essere assegnati
-- solo da un amministratore vero, altrimenti chiunque si registrasse sul sito del cliente
-- diventerebbe automaticamente admin con accesso completo ai dati reali dei pazienti.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;

  -- Auto-assegnazione ruolo "admin" per la demo pubblica (era "staff")
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END; $$;
