import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/motion-primitives";
import { BeforeAfter } from "@/components/site/before-after";
import { Button } from "@/components/ui/button";
import { getPublishedCases } from "@/lib/gallery.functions";
import beforeImg from "@/assets/ba-1-before.jpg";
import afterImg from "@/assets/ba-1-after.jpg";

export const Route = createFileRoute("/risultati")({
  head: () => ({
    meta: [
      { title: "Risultati prima e dopo | AURA Clinic" },
      {
        name: "description",
        content:
          "Galleria interattiva di casi reali, pubblicati solo con consenso esplicito e revocabile. Filtra per tipo di intervento.",
      },
      { property: "og:title", content: "Risultati prima e dopo | AURA Clinic" },
      {
        property: "og:description",
        content: "Casi documentati, consenso esplicito, anonimizzazione su richiesta.",
      },
    ],
  }),
  component: ResultsPage,
});

const filters = [
  { slug: "tutti", label: "Tutti" },
  { slug: "viso", label: "Viso" },
  { slug: "seno", label: "Seno" },
  { slug: "corpo", label: "Corpo" },
  { slug: "medicina-estetica", label: "Medicina estetica" },
];

const cases = [
  { id: 1, cat: "viso", title: "Rinoplastica strutturata", meta: "Donna, 29 anni · 12 mesi dopo" },
  { id: 2, cat: "viso", title: "Blefaroplastica superiore", meta: "Donna, 48 anni · 6 mesi dopo" },
  { id: 3, cat: "seno", title: "Mastoplastica additiva", meta: "Donna, 34 anni · 9 mesi dopo" },
  { id: 4, cat: "corpo", title: "Liposuzione fianchi", meta: "Uomo, 41 anni · 6 mesi dopo" },
  { id: 5, cat: "medicina-estetica", title: "Filler zigomi", meta: "Donna, 37 anni · 3 settimane dopo" },
  { id: 6, cat: "viso", title: "Lifting collo", meta: "Donna, 57 anni · 8 mesi dopo" },
];

function ResultsPage() {
  const [active, setActive] = useState("tutti");
  const visible = active === "tutti" ? cases : cases.filter((c) => c.cat === active);

  return (
    <>
      <PageHero
        eyebrow="Risultati"
        title="Prima e dopo, senza filtri."
        lede="Trascina il cursore per confrontare. Ogni caso è pubblicato solo dopo consenso scritto specifico del paziente, revocabile in qualsiasi momento."
      />

      <section className="py-16 md:py-24">
        <div className="container-aura">
          <Reveal>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.slug}
                  onClick={() => setActive(f.slug)}
                  className={`rounded-full border px-4 py-2 text-sm transition-all duration-300 active:scale-95 ${
                    active === f.slug
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Reveal>

          <motion.div layout className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visible.map((c) => (
                <motion.figure
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <BeforeAfter before={beforeImg} after={afterImg} alt={c.title} />
                  <figcaption className="mt-4">
                    <div className="font-medium">{c.title}</div>
                    <div className="text-sm text-muted-foreground">{c.meta}</div>
                  </figcaption>
                </motion.figure>
              ))}
            </AnimatePresence>
          </motion.div>

          <Reveal>
            <div className="mt-16 rounded-3xl border border-border bg-secondary/60 p-8 text-sm leading-relaxed text-muted-foreground md:p-10">
              <h2 className="text-base font-semibold text-foreground">
                Nota deontologica e privacy
              </h2>
              <ul className="mt-4 space-y-2">
                <li>
                  Le immagini sono pubblicate previo consenso scritto specifico e distinto dal
                  consenso al trattamento sanitario, ai sensi dell'Art. 9 GDPR.
                </li>
                <li>
                  Il consenso è revocabile in qualsiasi momento: alla revoca le immagini vengono
                  rimosse dal sito entro 72 ore.
                </li>
                <li>Su richiesta del paziente i volti vengono anonimizzati o sfocati.</li>
                <li>
                  Tutte le immagini sono filigranate e non sono scaricabili né riutilizzabili.
                </li>
                <li>
                  I risultati individuali possono variare. Le immagini hanno finalità informativa e
                  non costituiscono promessa di risultato.
                </li>
                <li>
                  In questo progetto dimostrativo le immagini sono simulazioni non cliniche, usate
                  come segnaposto.
                </li>
              </ul>
              <Button asChild variant="quiet" size="pill" className="mt-7">
                <Link to="/legale/dati-sanitari">Informativa dati sanitari</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
