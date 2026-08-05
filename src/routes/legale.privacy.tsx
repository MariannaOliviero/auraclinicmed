import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/site/page-hero";

export const Route = createFileRoute("/legale/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | AURA Clinic" },
      { name: "description", content: "Informativa sul trattamento dei dati personali di AURA Clinic ai sensi degli artt. 13-14 GDPR." },
      { property: "og:title", content: "Privacy Policy | AURA Clinic" },
      { property: "og:description", content: "Come trattiamo i dati personali di pazienti e visitatori." },
    ],
  }),
  component: () => (
    <LegalPage title="Privacy Policy" updated="5 agosto 2026">
      <LegalSection title="1. Titolare del trattamento">
        <p>
          AURA Clinic S.r.l., Via della Spiga 12, 20121 Milano — P.IVA 00000000000 — email
          privacy@auraclinic.it. Responsabile della Protezione dei Dati (DPO): dpo@auraclinic.it.
        </p>
      </LegalSection>
      <LegalSection title="2. Dati trattati">
        <ul>
          <li>Dati di contatto forniti volontariamente tramite il modulo di prenotazione.</li>
          <li>Dati di navigazione e cookie, secondo le scelte espresse nel banner.</li>
          <li>
            Dati relativi alla salute (categoria particolare ex Art. 9 GDPR), raccolti
            esclusivamente in sede clinica e trattati secondo l'informativa dedicata.
          </li>
        </ul>
      </LegalSection>
      <LegalSection title="3. Finalità e basi giuridiche">
        <ul>
          <li>Riscontro alle richieste di consulenza — Art. 6.1.b GDPR (misure precontrattuali).</li>
          <li>Cure e prestazioni sanitarie — Art. 9.2.h GDPR.</li>
          <li>Comunicazioni informative — Art. 6.1.a GDPR (consenso, revocabile).</li>
          <li>Adempimenti fiscali e sanitari — Art. 6.1.c GDPR.</li>
        </ul>
      </LegalSection>
      <LegalSection title="4. Conservazione">
        <p>
          Dati di contatto di lead non convertiti: 24 mesi. Documentazione sanitaria: conservata
          secondo i termini di legge applicabili alla cartella clinica ambulatoriale. Dati fiscali:
          10 anni.
        </p>
      </LegalSection>
      <LegalSection title="5. Destinatari">
        <p>
          Fornitori di hosting, gestionale sanitario, servizi email e SMS, tutti nominati
          Responsabili del trattamento ex Art. 28 GDPR. Nessun trasferimento extra-UE senza
          adeguate garanzie.
        </p>
      </LegalSection>
      <LegalSection title="6. Diritti dell'interessato">
        <p>
          Accesso, rettifica, cancellazione, limitazione, portabilità, opposizione e revoca del
          consenso, esercitabili tramite la pagina dedicata o scrivendo a privacy@auraclinic.it. È
          sempre possibile proporre reclamo al Garante per la protezione dei dati personali.
        </p>
      </LegalSection>
    </LegalPage>
  ),
});
