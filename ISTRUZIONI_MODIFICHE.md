# Cosa ho aggiunto e come metterlo online

## File nuovi/modificati in questo pacchetto
- `supabase/migrations/20260903200000_staff_shifts.sql` → tabella turni staff
- `supabase/migrations/20260903200030_sms_reminders.sql` → colonne promemoria/conferma su appointments + tabella sms_log
- `supabase/functions/send-appointment-sms/index.ts` → Edge Function che invia davvero l'SMS (Twilio)
- `src/routes/_authenticated/admin.turni.tsx` → nuova pagina "Turni" nel gestionale
- `src/routes/_authenticated/admin.tsx` → aggiunta voce di menu "Turni"
- `src/routes/_authenticated/admin.agenda.tsx` → pulsanti "Invia conferma SMS" / "Invia promemoria SMS" per ogni appuntamento
- `src/integrations/supabase/types.ts` → tipi aggiornati per le nuove tabelle/colonne
- `src/routeTree.gen.ts` → rigenerato automaticamente (contiene la nuova rotta /admin/turni)

## Come caricarlo
1. Sostituisci/aggiungi questi file nel tuo repository GitHub `MariannaOliviero/auraclinicmed`
   (stessi percorsi, va bene sovrascrivere quelli esistenti).
2. Fai commit e push su `main`.
3. Lovable si sincronizza automaticamente e ricostruisce il progetto.

## Per attivare DAVVERO l'invio SMS (obbligatorio, non parte da solo)
La Edge Function è pronta ma senza queste 3 chiavi non invierà nulla:

1. Crea un account su [Twilio](https://www.twilio.com/) (a pagamento, offre credito di prova gratuito).
2. Recupera **Account SID**, **Auth Token** e attiva/compra un **numero di telefono Twilio**.
3. Nel progetto Supabase collegato a Lovable: Dashboard → **Edge Functions** → **Manage secrets**, aggiungi:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM_NUMBER` (es. `+390212345678`)
4. Da terminale, dentro la cartella del progetto (serve Supabase CLI):
   ```
   supabase functions deploy send-appointment-sms
   ```
   (Se non hai la CLI, Lovable a volte permette di farlo deployare automaticamente al push — verifica nella sezione Edge Functions del tuo progetto Supabase se la funzione compare dopo il sync.)
5. Testa: apri il gestionale → Agenda → un appuntamento con paziente che ha un numero di telefono salvato → "Invia conferma SMS".

## Nota importante su "invio automatico"
Quello che ho costruito è l'invio **manuale con un click** dallo staff (pulsante in Agenda) — è già molto più di prima, ed è affidabile.
Per renderlo **automatico** (es. promemoria inviato da solo 24h prima, senza che nessuno clicchi), serve programmare
l'esecuzione periodica della stessa funzione con `pg_cron` + `pg_net` su Supabase (schedulatore lato database). Non l'ho attivato
in automatico in questo pacchetto perché richiede di inserire la Service Role Key del progetto in una configurazione persistente,
e preferisco che tu lo faccia consapevolmente dal Dashboard Supabase (Database → Extensions → abilita `pg_cron` e `pg_net`, poi
Database → Cron Jobs → nuovo job che chiama l'URL della function una volta al giorno). Se vuoi, posso scriverti anche lo script
SQL esatto per quello step successivo.

## Turni staff
Sezione "Turni" nel menu del gestionale: gli **admin** possono assegnare turni ai membri dello staff (data/ora inizio-fine,
etichetta ruolo tipo "Reception"/"Sala"), tutto lo staff può consultarli. Nessuna configurazione aggiuntiva richiesta, funziona
subito dopo il push delle migrazioni.

## Registrazione automatica come "staff" (SOLO per questa demo pubblica)
Ho aggiunto `supabase/migrations/20260903201000_demo_auto_staff_role.sql`: chi si registra su
`https://auraclinicmed.lovable.app/auth` riceve subito il ruolo "staff" ed entra nel gestionale senza bisogno
che tu lo abiliti a mano da "Team". Comodo per far provare la demo ai potenziali clienti.

**IMPORTANTE — da fare quando consegni il prodotto vero a un cliente reale**: questa migrazione va **disattivata**,
altrimenti chiunque si registrasse sul sito del cliente vedrebbe subito i dati reali dei suoi pazienti. Per disattivarla,
crea una nuova migrazione che rimette la funzione `handle_new_user` alla versione originale (senza la riga che inserisce
in `user_roles`) — se vuoi te la preparo io al momento della consegna, basta chiedermelo.

