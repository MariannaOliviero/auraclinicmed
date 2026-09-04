# Deploy finale — Aura Clinic (guida completa, in ordine)

Questo pacchetto contiene TUTTO quello fatto finora: turni staff, SMS reali, PWA
installabile, auto-registrazione demo, "Fissa appuntamento", fix contrasto pulsante
WhatsApp. Segui i passaggi in ordine, senza saltarne nessuno.

---

## PARTE 1 — Caricare il codice su GitHub

1. Scarica e apri questo zip sul computer
2. Vai su `https://github.com/MariannaOliviero/auraclinicmed`
3. Clicca **"Add file" → "Upload files"**
4. Trascina dentro TUTTE le cartelle e i file dello zip: `public`, `src`, `supabase`,
   `ISTRUZIONI_MODIFICHE.md`, `DEPLOY_FINALE.md` — GitHub mantiene la struttura delle
   cartelle automaticamente
5. Scorri in basso, scrivi un messaggio tipo "Aggiornamento completo funzionalità gestionale"
6. Clicca il pulsante verde **"Commit changes"**

## PARTE 2 — Pubblicare su Lovable

1. Apri il progetto su Lovable (aspetta qualche minuto che rilevi da solo la sincronizzazione da GitHub,
   oppure controlla che non ci siano errori mostrati nell'editor)
2. Clicca **"Publish"** in alto a destra
3. Clicca **"Publish changes"** (o "Update")
4. Aspetta il completamento

A questo punto il **codice** è live. Ma tre cose NON partono da sole col solo push su
GitHub — vanno attivate a mano, una volta sola, come nella Parte 3.

## PARTE 3 — Attivare il database (SQL Editor, una tantum)

Vai su Lovable → icona "livelli/Altro" in alto → **Cloud → SQL editor**. Esegui questi
blocchi **in ordine**, uno alla volta: incolla, **Run**, aspetta "Success", poi **Clear**
e passa al successivo.

### 3.1 — Turni staff e SMS: le tabelle
Le migrazioni caricate su GitHub (cartella `supabase/migrations`) descrivono le tabelle,
ma per sicurezza verifica che esistano davvero: vai su **Cloud → Database** e cerca tra le
tabelle `staff_shifts` e `sms_log`. Se non le vedi, apri i 3 file `.sql` dentro
`supabase/migrations/` (nello zip) e incollali uno alla volta nello SQL Editor, in
ordine di data (dal nome del file), Run per ciascuno.

### 3.2 — Auto-registrazione come staff (se non l'hai già fatta)
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'staff')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END; $$;
```

### 3.3 — Il tuo account come admin (se non l'hai già fatto)
Sostituisci l'email con la tua:
```sql
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'TUA-EMAIL@gmail.com'
on conflict (user_id, role) do nothing;
```

## PARTE 4 — Attivare gli SMS reali (Twilio)

Senza questo passaggio, i pulsanti "Invia SMS" restano visibili ma non mandano nulla.

1. Crea un account su [twilio.com](https://www.twilio.com/), recupera **Account SID**,
   **Auth Token** e attiva un **numero di telefono Twilio**
2. Lovable → **Cloud → Secrets**, aggiungi tre secrets:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM_NUMBER` (es. `+390212345678`)
3. Lovable → **Cloud → Edge functions**: verifica che `send-appointment-sms` compaia
   nell'elenco (dovrebbe essersi distribuita da sola col push su GitHub). Se non c'è,
   dimmelo — serve un passaggio da terminale con la Supabase CLI che ti guido a fare.

## PARTE 5 — Collaudo finale (checklist)

Spunta uno per uno, con un account di prova (anche `+test`):

- [ ] Registrazione nuova → entra subito nel gestionale (niente "in attesa di autorizzazione")
- [ ] Menu laterale mostra: Panoramica, Lead, Pazienti, Agenda, Turni, Documenti, Team
- [ ] "Turni" → se sei admin, vedi il modulo per aggiungere un turno
- [ ] "Pazienti" → un paziente ha il pulsante "Fissa appuntamento" e ti porta in Agenda
      con il paziente già selezionato
- [ ] "Lead" → dopo "Converti in paziente" compare anche "Fissa appuntamento"
- [ ] "Agenda" → un appuntamento con paziente che ha un telefono mostra i pulsanti
      "Invia conferma SMS" / "Invia promemoria SMS" (funzionano solo dopo la Parte 4)
- [ ] Da Chrome desktop: compare l'icona di installazione nella barra indirizzi, oppure
      il pulsante "Installa app" in fondo alla sidebar del gestionale
- [ ] Homepage pubblica → sezione finale scura → hover su "Scrivici su WhatsApp" → testo
      resta leggibile (bianco su sfondo scuro, non più grigio chiaro illeggibile)

Se un punto della checklist non torna, mandami uno screenshot e sistemiamo subito.
