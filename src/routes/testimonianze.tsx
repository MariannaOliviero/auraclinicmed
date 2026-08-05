import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/motion-primitives";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/testimonianze")({
  head: () => ({
    meta: [
      { title: "Testimonianze dei pazienti | AURA Clinic" },
      {
        name: "description",
        content:
          "Le parole di chi ha scelto AURA Clinic: percorso, consulenza e post-operatorio raccontati in prima persona.",
      },
      { property: "og:title", content: "Testimonianze dei pazienti | AURA Clinic" },
      { property: "og:description", content: "Racconti reali di percorsi seguiti passo dopo passo." },
    ],
  }),
  component: TestimonialsPage,
});

const items = [
  {
    quote:
      "Mi aspettavo un preventivo, ho ricevuto un'ora di domande. Solo alla fine si è parlato di intervento. Ho capito subito di essere nel posto giusto.",
    name: "Giulia M.",
    detail: "Rinoplastica · 2024",
  },
  {
    quote:
      "Il post-operatorio è la parte che spaventa. Sono stata chiamata ogni due giorni per tre settimane. Non mi sono mai sentita sola.",
    name: "Chiara B.",
    detail: "Mastoplastica · 2023",
  },
  {
    quote:
      "Mi ha sconsigliato l'intervento che chiedevo e proposto qualcosa di più piccolo. Aveva ragione lui.",
    name: "Marco T.",
    detail: "Blefaroplastica · 2024",
  },
  {
    quote:
      "Nessuno si è accorto di niente. Mi hanno solo chiesto se fossi tornata da una vacanza. È esattamente quello che volevo.",
    name: "Elena R.",
    detail: "Lifting collo · 2023",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

function TestimonialsPage() {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((prev) => (prev + d + items.length) % items.length);
  const current = items[i]!;

  return (
    <>
      <PageHero
        eyebrow="Testimonianze"
        title="Le parole di chi ci è passato."
        lede="Raccolte con consenso esplicito alla pubblicazione. I risultati individuali possono variare: nessuna esperienza è trasferibile a un'altra persona."
      />

      <section className="py-20 md:py-28">
        <div className="container-aura max-w-3xl">
          <Quote className="size-8 text-sage" />
          <div className="relative mt-8 min-h-56">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <p className="display-md font-medium">{current.quote}</p>
                <footer className="mt-8 text-sm text-muted-foreground">
                  {current.name} — {current.detail}
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center gap-3">
            <button
              onClick={() => go(-1)}
              aria-label="Testimonianza precedente"
              className="inline-flex size-11 items-center justify-center rounded-full border border-border transition-all hover:bg-secondary active:scale-95"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Testimonianza successiva"
              className="inline-flex size-11 items-center justify-center rounded-full border border-border transition-all hover:bg-secondary active:scale-95"
            >
              <ArrowRight className="size-4" />
            </button>
            <span className="ml-3 text-sm text-muted-foreground tabular-nums">
              {i + 1} / {items.length}
            </span>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/50 py-20">
        <div className="container-aura">
          <div className="grid gap-5 md:grid-cols-2">
            {items.map((t, idx) => (
              <Reveal key={t.name} delay={idx * 0.05}>
                <div className="card-aura card-hover h-full p-8">
                  <p className="text-[1.0625rem] leading-relaxed">"{t.quote}"</p>
                  <p className="mt-6 text-sm text-muted-foreground">
                    {t.name} — {t.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-10 text-xs text-muted-foreground">
            Disclaimer: i risultati individuali possono variare. Le testimonianze non costituiscono
            promessa di risultato né sostituiscono una valutazione clinica.
          </p>
        </div>
      </section>

      <section className="py-24 text-center">
        <div className="container-aura">
          <Reveal>
            <h2 className="display-lg">Il prossimo racconto può essere il tuo.</h2>
            <Button asChild variant="hero" size="pill-lg" className="mt-8">
              <Link to="/contatti">Prenota una consulenza</Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
