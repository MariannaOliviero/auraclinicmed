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
L'invio SMS è scritto come funzione server integrata nell'app stessa (non una Edge Function
Supabase separata — questo progetto usa TanStack Start su Cloudflare, non lo standard Supabase
CLI). Il file è `src/lib/sms.functions.ts`, richiamato da Agenda. Va comunque configurato:

1. Crea un account su [Twilio](https://www.twilio.com/) (a pagamento, offre credito di prova gratuito).
2. Recupera **Account SID**, **Auth Token** e attiva/compra un **numero di telefono Twilio**.
3. Nel progetto Lovable: **Altro → Cloud → Secrets**, aggiungi:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM_NUMBER` (es. `+390212345678`)
4. Nessun altro passaggio di "deploy": una volta che il codice è su GitHub e Lovable ha
   pubblicato, la funzione è già parte dell'app — funziona appena i 3 secrets sono impostati.
5. Testa: apri il gestionale → Agenda → un appuntamento con paziente che ha un numero di
   telefono salvato → "Invia conferma SMS".

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

## Documenti: da "firma finta" ad archivio reale
La vecchia versione di "Documenti" faceva solo scrivere un nome in un campo di testo e lo segnava come "firmato" — nessun
valore legale reale, nessun contenuto del documento. L'ho sostituita con un **archivio vero**: lo staff carica il file
(PDF o foto della scansione) di un documento già firmato dal paziente su carta, o firmato digitalmente altrove. Il file
viene conservato in modo sicuro (bucket privato `documenti-pazienti`, visibile solo allo staff), collegato al paziente,
con data di caricamento e un link "Visualizza documento". Gli admin possono anche eliminare un documento caricato per errore.

## Eliminazione dati (Lead, Pazienti, Risultati)
Prima mancava il pulsante "Elimina" in queste 3 sezioni (il database lo permetteva già, solo agli admin, ma
l'interfaccia non lo usava). Ora, per gli **admin**, ogni scheda Lead/Paziente/Caso in Risultati ha un pulsante
per eliminarla in modo permanente (con richiesta di conferma). Eliminare un paziente elimina automaticamente
anche i suoi appuntamenti e documenti collegati; eliminare un caso in Risultati rimuove anche le foto dallo storage.

## App installabile su desktop e smartphone (PWA)
Ho aggiunto tutto il necessario per rendere il sito "installabile" come un'app, senza passare da App Store/Play Store:
- `public/manifest.webmanifest` → nome, colori e icone dell'app
- `public/sw.js` → service worker minimale (richiesto tecnicamente per l'installazione; non mette in cache dati reali,
  solo l'involucro statico, così il gestionale mostra sempre dati aggiornati)
- `public/icons/` → icone segnaposto (una "A" bianca su nero) — **da sostituire con il logo reale del cliente** quando
  personalizzi il prodotto (basta sovrascrivere gli stessi file mantenendo gli stessi nomi/dimensioni: 192x192, 512x512,
  più le versioni "maskable" per Android e l'apple-touch-icon 180x180)
- Pulsante **"Installa app"** che compare da solo nella sidebar del gestionale, quando il browser lo supporta

**Come la installano gli utenti (nessuna configurazione richiesta da parte tua, funziona già così):**
- **Desktop (Chrome/Edge)**: icona di installazione nella barra degli indirizzi, oppure il pulsante "Installa app" nel gestionale
- **Android (Chrome)**: banner automatico "Aggiungi a schermata Home", oppure menu ⋮ → "Installa app"
- **iPhone/iPad (Safari)**: pulsante Condividi (□↑) → "Aggiungi a Home" (iOS non mostra prompt automatici, è sempre manuale — limite di Apple, non nostro)

Una volta installata, l'app si apre a schermo intero, con icona propria, senza barra del browser — a tutti gli effetti
sembra un'app nativa, pur restando un sito web.

## "Fissa appuntamento" diretto da Lead e Pazienti
Ora, sia nella pagina **Pazienti** (per ogni paziente) sia nella pagina **Lead** (dopo averlo convertito in paziente),
c'è un pulsante **"Fissa appuntamento"**: porta direttamente in Agenda con il paziente già selezionato nel modulo
(e, partendo da un Lead, con un titolo già suggerito in base all'interesse indicato). Resta comunque da confermare
a mano data e ora (quelle concordate al telefono con il cliente), il resto è precompilato.

## Registrazione automatica come "admin" (SOLO per questa demo pubblica)
Ho aggiunto `supabase/migrations/20260904210000_demo_auto_admin_role.sql`: chi si registra su
`https://auraclinicmed.lovable.app/auth` riceve subito il ruolo **"admin"** (aggiornato da "staff" a "admin", così un
potenziale cliente in prova può creare turni, gestire il team, eliminare record di prova — tutte le funzionalità)
ed entra nel gestionale senza bisogno che tu lo abiliti a mano. Comodo per far provare la demo ai potenziali clienti.

Questa migrazione **sostituisce** la precedente `20260903201000_demo_auto_staff_role.sql` (che assegnava solo "staff") —
carica anche quella nel pacchetto, l'ultima eseguita nello SQL Editor è quella che conta.

**Account già registrati prima di questo aggiornamento** (es. il tuo account "+test", rimasto con ruolo "staff"):
per farli diventare admin, esegui una volta in SQL Editor (sostituendo l'email):
```sql
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'TUA-EMAIL+test@gmail.com'
on conflict (user_id, role) do nothing;
```

**IMPORTANTE — da fare quando consegni il prodotto vero a un cliente reale**: questa migrazione va **disattivata**,
altrimenti chiunque si registrasse sul sito del cliente diventerebbe subito admin con accesso completo ai dati reali
dei pazienti. Per disattivarla, crea una nuova migrazione che rimette la funzione `handle_new_user` alla versione
originale (senza la riga che inserisce in `user_roles`) — se vuoi te la preparo io al momento della consegna, basta
chiedermelo.

