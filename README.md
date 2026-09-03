# Aura Clinic Studio

Voglio costruire AURA Clinic, un prodotto digitale completo per uno studio di chirurgia plastica ed estetica di alto livello, composto da due macro-aree:

Sito pubblico (marketing site) — vetrina per pazienti potenziali

Gestionale interno (dashboard/CRM) — area riservata per medico e staff

Il prodotto deve avere un linguaggio visivo ispirato ad Apple.com: minimalismo estremo, tipografia protagonista, tantissimo white space, gerarchia visiva chiarissima, animazioni fluide e naturali (mai sopra le righe), micro-interazioni curate, transizioni fisiche (easing morbidi, non lineari), scroll-driven storytelling.

1. DESIGN SYSTEM

Typography

Font primario: SF Pro Display per titoli, SF Pro Text per corpo testo (fallback: -apple-system, "Inter", "Helvetica Neue", sans-serif — se SF Pro non è disponibile su Google Fonts, usa Inter o General Sans come sostituto più fedele)

Titoli grandi: peso 600-700, tracking negativo leggero (-0.02em), dimensioni generose (hero da 64-96px desktop)

Corpo testo: peso 400, line-height 1.5-1.6, dimensione 17-19px

Gerarchia netta tra H1/H2/H3/body/caption

Palette colori

Base: bianco puro #FFFFFF e nero profondo #0A0A0A (non nero puro, leggermente caldo)

Grigio neutro per sfondi secondari: #F5F5F7 (esattamente il grigio "Apple")

Accent color: un colore unico, elegante e non clinico — proponi un verde salvia desaturato (#8FA893) o un beige rosato/nude (#D8C3B5) coerente col mondo estetico, da usare con parsimonia (CTA, hover, badge)

Nessun colore "medicale" freddo (blu ospedaliero, verde acqua da camice)

Stile visivo

Glassmorphism leggero su header/nav (blur di sfondo allo scroll)

Bordi arrotondati generosi (16-24px su card, 12px su bottoni)

Ombre morbide e diffuse, mai dure

Immagini a piena larghezza con parallax leggero

Dark mode opzionale con toggle (stile Apple)

Animazioni e interazioni

Fade-in + slide-up all'entrata in viewport (scroll reveal) su ogni sezione

Numeri/statistiche che contano progressivamente quando entrano in viewport

Hover su card con scale leggero (1.02-1.03) e ombra che si intensifica

Transizioni di pagina fluide (no scatti, crossfade tra route)

Sticky nav che si trasforma (da trasparente a bianca/blur) allo scroll

Cursor custom opzionale sulle sezioni immersive (galleria before/after)

Menu mobile con animazione di apertura fluida a schermo intero

Micro-feedback su ogni bottone/interazione (press state, loading state)

Usa Framer Motion (o equivalente) per gestire le transizioni

2. SITO PUBBLICO — SITEMAP E COPY

Home

Hero a piena pagina con headline forte, sottotitolo rassicurante, CTA doppia (primaria "Prenota una consulenza", secondaria "Scopri i trattamenti"). Sotto: sezione trust (anni di esperienza, pazienti seguiti, certificazioni), sezione trattamenti in evidenza (grid con hover), sezione "Il Dott." con foto e bio breve, sezione risultati/testimonianze, sezione prima del prossimo passo (CTA finale + form contatto rapido).

Copy hero (esempio, adattabile):

Bellezza autentica, cura senza compromessi. Un percorso su misura, guidato dall'esperienza chirurgica e da un ascolto autentico. Perché ogni scelta estetica comincia da una domanda: chi vuoi essere, ancora più tu stesso. [Prenota una consulenza riservata] [Scopri i trattamenti]

Chi siamo / Il Dottore

Bio professionale, percorso formativo, filosofia dello studio, foto ambientazioni cliniche (calde, non fredde), numeri (interventi eseguiti, anni di attività, pubblicazioni/relatore a congressi).

Trattamenti

Struttura a categorie, ciascuna con pagina dedicata:

Chirurgia del viso: rinoplastica, blefaroplastica, lifting viso e collo, otoplastica

Chirurgia del seno: mastoplastica additiva, mastopessi, riduzione mammaria

Chirurgia del corpo: liposuzione, addominoplastica, body contouring

Medicina estetica non chirurgica: botox, filler, biorivitalizzazione, fili di sospensione

Ogni scheda trattamento: cos'è, per chi è indicato, come si svolge (step numerati con animazione), tempi di recupero, FAQ, CTA a consulenza.

Risultati (Before/After)

Galleria interattiva con slider before/after (drag), filtrabile per tipo di intervento. Nota GDPR/deontologica: prevedi consenso esplicito del paziente per pubblicazione immagini, watermark, e possibilità di sfocare/anonimizzare volto se necessario.

Testimonianze

Slider testimonianze video/testo, con disclaimer "risultati individuali possono variare".

Blog / Magazine

Per SEO e authority: articoli su trattamenti, mitologia da sfatare, post-operatorio, consigli.

Contatti / Prenota consulenza

Form di contatto con step multipli (tipo di trattamento di interesse → dati contatto → preferenza data/ora), integrazione mappa studio, orari, numero whatsapp diretto.

Footer

Menu secondario, social, P.IVA, link a Privacy Policy, Cookie Policy, Termini e Condizioni, Consenso informato generale.

3. GESTIONALE INTERNO (Dashboard riservata staff/medico)

Area protetta da login (email + password, 2FA consigliato), accessibile da /admin o sottodominio dedicato (es. app.auraclinic.it).

Moduli richiesti:

Dashboard overview

KPI principali: appuntamenti oggi/settimana, nuovi lead, fatturato mese, tasso di conversione consulenza→intervento

Calendario centrale con vista giorno/settimana/mese

Gestione pazienti (CRM)

Anagrafica paziente completa (dati sensibili trattati come categoria particolare di dati ex Art. 9 GDPR)

Storico visite, trattamenti eseguiti, note cliniche

Allegati: foto pre/post (storage sicuro e cifrato), referti, consensi informati firmati digitalmente

Timeline attività per singolo paziente

Agenda e appuntamenti

Calendario drag&drop, gestione multi-operatore (medico, staff, sala operatoria)

Reminder automatici via email/SMS al paziente

Gestione liste d'attesa e cancellazioni

Gestione lead / consulenze

Pipeline stile kanban: Nuovo contatto → Consulenza fissata → Consulenza fatta → Preventivo inviato → Intervento programmato → Cliente

Provenienza lead (sito, referral, social) per tracciare ROI marketing

Documenti e consensi

Template di consenso informato per ogni tipo di intervento, generabili e firmabili digitalmente (firma su tablet o firma elettronica semplice)

Archivio conforme a normativa su cartella clinica e conservazione documentale

Fatturazione e preventivi

Creazione preventivi personalizzati con export PDF

Stato pagamenti, fatture emesse

Galleria clinica interna

Archivio foto before/after organizzato per paziente, con permessi separati da eventuale pubblicazione sul sito pubblico (doppio consenso richiesto)

Gestione staff e permessi

Ruoli differenziati (medico, segreteria, marketing) con visibilità dati differenziata — la segreteria non deve necessariamente vedere note cliniche sensibili

Report e analytics

Andamento mensile interventi per categoria, tasso di conversione, LTV paziente

4. CONFORMITÀ GDPR (obbligatoria, non opzionale)

Implementa concretamente:

Cookie banner conforme (rifiuto facile quanto l'accettazione, granularità per categoria: tecnici/statistici/marketing), nessun cookie non essenziale prima del consenso

Privacy Policy completa e Cookie Policy separata, linkate in footer e nel banner

Informativa specifica per dati sanitari (categoria particolare ex Art. 9 GDPR): base giuridica, finalità, tempi di conservazione, diritti dell'interessato (accesso, rettifica, cancellazione, portabilità, opposizione), responsabile del trattamento e DPO se nominato

Modulo di consenso informato digitale distinto dal consenso privacy generico (il consenso al trattamento medico è diverso dal consenso al trattamento dati)

Consenso separato e specifico per la pubblicazione di immagini before/after sul sito pubblico, revocabile in ogni momento

Form di contatto con checkbox di consenso esplicito (non pre-spuntata) prima dell'invio

Nel gestionale: log degli accessi ai dati sensibili, cifratura dei dati a riposo, policy di retention e cancellazione automatica dopo i termini di legge

Pagina "Diritti dell'interessato" con modulo per richiedere accesso/cancellazione dati

(Genera i testi legali come bozza segnaposto professionale, specificando chiaramente nel footer/nella pagina che vanno validati da un legale/DPO prima della messa online reale — questo è un prodotto demo di portfolio, non un sito in produzione.)

5. NOTE TECNICHE PER LOVABLE

Stack consigliato: React + Tailwind CSS + Framer Motion per le animazioni

Supabase come backend per: autenticazione (sito pubblico → form lead; gestionale → login staff con ruoli), database pazienti/appuntamenti/documenti, storage sicuro per immagini e allegati (bucket privato per foto cliniche, bucket pubblico solo per gallery before/after autorizzate)

Row Level Security su Supabase per separare permessi tra ruoli (medico/segreteria/marketing)

Struttura responsive mobile-first, ma con attenzione particolare alla resa desktop (il target è spesso su desktop per ricerche mediche approfondite)

Performance: lazy loading immagini, ottimizzazione Core Web Vitals (il sito deve "sentirsi" veloce quanto elegante)

6. TONO DI VOCE DEL COPY

Autorevole ma caldo, mai freddamente clinico

Rassicurante senza essere paternalistico

Frasi brevi, dirette, mai gergo medico inutile

Ogni sezione deve trasmettere fiducia e competenza, non vendita aggressiva

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://auraclinicmed.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7b76e660-0276-49a8-9d14-045a305833e5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
