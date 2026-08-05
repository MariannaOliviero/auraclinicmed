import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/site/page-hero";

export const Route = createFileRoute("/legale/termini")({
  head: () => ({
    meta: [
      { title: "Termini e Condizioni | AURA Clinic" },
      { name: "description", content: "Condizioni d'uso del sito AURA Clinic e natura informativa dei contenuti pubblicati." },
      { property: "og:title", content: "Termini e Condizioni | AURA Clinic" },
      { property: "og:description", content: "Condizioni d'uso e limitazioni di responsabilità." },
    ],
  }),
  component: () => (
    <LegalPage title="Termini e Condizioni" updated="5 agosto 2026">
      <LegalSection title="1. Natura dei contenuti">
        <p>
          I contenuti del sito hanno finalità esclusivamente informativa e non costituiscono
          diagnosi, prescrizione né promessa di risultato. Nessuna informazione pubblicata
          sostituisce una visita specialistica.
        </p>
      </LegalSection>
      <LegalSection title="2. Prenotazioni">
        <p>
          L'invio del modulo non costituisce conferma di appuntamento: la segreteria ricontatta
          l'interessato per la conferma di data e ora.
        </p>
      </LegalSection>
      <LegalSection title="3. Proprietà intellettuale">
        <p>
          Testi, immagini e materiali fotografici sono di proprietà di AURA Clinic S.r.l. o dei
          rispettivi aventi diritto. È vietata la riproduzione, anche parziale, delle immagini di
          risultato.
        </p>
      </LegalSection>
      <LegalSection title="4. Pubblicità sanitaria">
        <p>
          Le comunicazioni rispettano i criteri di trasparenza, veridicità e non ingannevolezza
          previsti dalla normativa in materia di pubblicità sanitaria e dal Codice di Deontologia
          Medica.
        </p>
      </LegalSection>
      <LegalSection title="5. Legge applicabile">
        <p>Legge italiana. Foro competente: Milano, salve le competenze inderogabili del consumatore.</p>
      </LegalSection>
    </LegalPage>
  ),
});
