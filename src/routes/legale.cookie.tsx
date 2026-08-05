import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/site/page-hero";

export const Route = createFileRoute("/legale/cookie")({
  head: () => ({
    meta: [
      { title: "Cookie Policy | AURA Clinic" },
      { name: "description", content: "Quali cookie usa il sito AURA Clinic, con quali finalità e come modificare le preferenze." },
      { property: "og:title", content: "Cookie Policy | AURA Clinic" },
      { property: "og:description", content: "Categorie di cookie, finalità e gestione del consenso." },
    ],
  }),
  component: () => (
    <LegalPage title="Cookie Policy" updated="5 agosto 2026">
      <LegalSection title="1. Cosa sono i cookie">
        <p>
          Piccoli file di testo memorizzati sul dispositivo. Nessun cookie non essenziale viene
          installato prima della raccolta del consenso.
        </p>
      </LegalSection>
      <LegalSection title="2. Categorie utilizzate">
        <ul>
          <li>
            <strong>Tecnici (necessari)</strong> — funzionamento, sicurezza e memorizzazione delle
            preferenze di consenso. Base giuridica: legittimo interesse / obbligo tecnico.
          </li>
          <li>
            <strong>Statistici</strong> — misurazione aggregata delle visite. Attivati solo con
            consenso.
          </li>
          <li>
            <strong>Marketing</strong> — profilazione e misurazione campagne. Attivati solo con
            consenso.
          </li>
        </ul>
      </LegalSection>
      <LegalSection title="3. Gestione del consenso">
        <p>
          Il banner consente di accettare tutti, rifiutare tutti con un solo clic o scegliere per
          categoria. La preferenza è revocabile in qualsiasi momento cancellando i dati del sito dal
          browser: al successivo accesso il banner verrà mostrato nuovamente.
        </p>
      </LegalSection>
      <LegalSection title="4. Durata">
        <p>Il consenso viene conservato per 6 mesi, trascorsi i quali sarà richiesto nuovamente.</p>
      </LegalSection>
    </LegalPage>
  ),
});
