import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/site/page-hero";

export const Route = createFileRoute("/legale/dati-sanitari")({
  head: () => ({
    meta: [
      { title: "Informativa dati sanitari (Art. 9 GDPR) | AURA Clinic" },
      { name: "description", content: "Informativa specifica sul trattamento dei dati relativi alla salute e delle immagini cliniche presso AURA Clinic." },
      { property: "og:title", content: "Informativa dati sanitari | AURA Clinic" },
      { property: "og:description", content: "Base giuridica, finalità, conservazione e diritti per i dati sanitari." },
    ],
  }),
  component: () => (
    <LegalPage title="Informativa dati sanitari (Art. 9 GDPR)" updated="5 agosto 2026">
      <LegalSection title="1. Categorie particolari di dati">
        <p>
          Nel percorso di cura trattiamo dati relativi alla salute, immagini cliniche pre e
          post-operatorie, referti e documentazione anamnestica. Si tratta di categorie particolari
          di dati ai sensi dell'Art. 9 GDPR, soggette a tutele rafforzate.
        </p>
      </LegalSection>
      <LegalSection title="2. Base giuridica">
        <ul>
          <li>Art. 9.2.h GDPR — finalità di medicina preventiva, diagnosi e cura.</li>
          <li>
            Art. 9.2.a GDPR — consenso esplicito, per finalità ulteriori quali la pubblicazione di
            immagini a scopo divulgativo.
          </li>
        </ul>
      </LegalSection>
      <LegalSection title="3. Doppio consenso per le immagini">
        <p>
          Il consenso informato al trattamento sanitario è distinto e separato dal consenso alla
          pubblicazione delle immagini. Il secondo è facoltativo, non condiziona l'accesso alle
          cure ed è revocabile in ogni momento: alla revoca le immagini vengono rimosse dai canali
          pubblici entro 72 ore.
        </p>
      </LegalSection>
      <LegalSection title="4. Misure di sicurezza">
        <ul>
          <li>Cifratura dei dati a riposo e in transito.</li>
          <li>Archiviazione delle immagini cliniche in storage privato, non indicizzabile.</li>
          <li>Accesso segmentato per ruolo: la segreteria non accede alle note cliniche.</li>
          <li>Log degli accessi ai dati sanitari, conservati e verificabili.</li>
          <li>Policy di retention con cancellazione automatica allo scadere dei termini di legge.</li>
        </ul>
      </LegalSection>
      <LegalSection title="5. Conservazione">
        <p>
          La documentazione sanitaria è conservata secondo i termini previsti dalla normativa
          applicabile alla cartella clinica ambulatoriale. Le immagini autorizzate alla
          pubblicazione sono conservate per la durata del consenso.
        </p>
      </LegalSection>
      <LegalSection title="6. Diritti">
        <p>
          L'interessato può esercitare i diritti di accesso, rettifica, cancellazione, limitazione,
          portabilità e opposizione tramite la pagina dedicata. La revoca del consenso non
          pregiudica la liceità del trattamento effettuato in precedenza.
        </p>
      </LegalSection>
    </LegalPage>
  ),
});
