import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/page-hero";
import { Reveal, CountUp } from "@/components/site/motion-primitives";
import { Button } from "@/components/ui/button";
import doctorImg from "@/assets/doctor-portrait.jpg";
import heroImg from "@/assets/hero-clinic.jpg";

export const Route = createFileRoute("/il-dottore")({
  head: () => ({
    meta: [
      { title: "Dott. Alessandro Rinaldi — Chirurgo plastico a Milano | AURA Clinic" },
      {
        name: "description",
        content:
          "Percorso formativo, filosofia dello studio e numeri di oltre vent'anni di chirurgia plastica ed estetica a Milano.",
      },
      { property: "og:title", content: "Dott. Alessandro Rinaldi | AURA Clinic" },
      {
        property: "og:description",
        content: "Il risultato migliore è quello che nessuno riconosce come chirurgico.",
      },
    ],
  }),
  component: DoctorPage,
});

const timeline = [
  { year: "2001", text: "Laurea in Medicina e Chirurgia, Università degli Studi di Milano." },
  { year: "2007", text: "Specializzazione in Chirurgia Plastica, Ricostruttiva ed Estetica." },
  { year: "2009", text: "Fellowship in chirurgia del volto, Hôpital Saint-Louis, Parigi." },
  { year: "2013", text: "Dirigente medico in chirurgia ricostruttiva post-oncologica." },
  { year: "2018", text: "Fondazione di AURA Clinic, Milano." },
  { year: "Oggi", text: "Attività clinica, docenza e relazioni a congressi nazionali." },
];

function DoctorPage() {
  return (
    <>
      <PageHero
        eyebrow="Chi siamo"
        title="Dott. Alessandro Rinaldi"
        lede="Specialista in Chirurgia Plastica, Ricostruttiva ed Estetica. Vent'anni di sala operatoria, una sola idea guida: la chirurgia deve sparire dietro al risultato."
      />

      <section className="py-20 md:py-28">
        <div className="container-aura grid items-start gap-14 md:grid-cols-2">
          <Reveal>
            <div className="overflow-hidden rounded-3xl shadow-[var(--shadow-lift)]">
              <img
                src={doctorImg}
                alt="Ritratto del Dott. Alessandro Rinaldi"
                width={1024}
                height={1280}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display-md">La filosofia dello studio</h2>
            <p className="lede mt-5">
              La chirurgia estetica non serve a diventare qualcun altro. Serve a togliere ciò che
              disturba la lettura di un volto o di un corpo, lasciando intatta l'identità.
            </p>
            <p className="lede mt-4">
              Per questo la prima consulenza dura almeno un'ora. Si parla di aspettative, di
              limiti, di rischi. Non esistono percorsi standard, e non esistono risposte affrettate.
            </p>
            <p className="lede mt-4">
              Circa un paziente su dieci esce dallo studio con il consiglio di non operarsi. È il
              dato di cui andiamo più fieri.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/50 py-24">
        <div className="container-aura grid gap-12 text-center sm:grid-cols-4">
          {[
            { n: 22, s: "", l: "anni di attività" },
            { n: 4100, s: "+", l: "interventi eseguiti" },
            { n: 31, s: "", l: "pubblicazioni scientifiche" },
            { n: 48, s: "", l: "congressi come relatore" },
          ].map((k, i) => (
            <Reveal key={k.l} delay={i * 0.07}>
              <div className="display-md tabular-nums">
                <CountUp to={k.n} suffix={k.s} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{k.l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-aura grid gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <h2 className="display-md">Percorso</h2>
            </Reveal>
            <ol className="mt-8 space-y-0">
              {timeline.map((t, i) => (
                <Reveal key={t.year} delay={i * 0.05}>
                  <li className="flex gap-8 border-t border-border py-6">
                    <span className="w-16 shrink-0 text-sm text-sage tabular-nums">{t.year}</span>
                    <span className="text-muted-foreground">{t.text}</span>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-3xl">
              <img
                src={heroImg}
                alt="Ambienti dello studio AURA Clinic"
                width={1920}
                height={1200}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Lo studio, in Via della Spiga 12 a Milano: due ambulatori, una sala per la medicina
              estetica e spazi d'attesa pensati per non sembrare una clinica.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border bg-primary py-24 text-primary-foreground">
        <div className="container-aura text-center">
          <Reveal>
            <h2 className="display-lg">Parliamone di persona.</h2>
            <Button asChild variant="sage" size="pill-lg" className="mt-8">
              <Link to="/contatti">Prenota una consulenza</Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
