import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/motion-primitives";

export const Route = createFileRoute("/magazine")({
  head: () => ({
    meta: [
      { title: "Magazine — approfondimenti di chirurgia estetica | AURA Clinic" },
      {
        name: "description",
        content:
          "Articoli su trattamenti, post-operatorio, falsi miti e scelte consapevoli, scritti dal Dott. Rinaldi e dallo staff clinico.",
      },
      { property: "og:title", content: "Magazine | AURA Clinic" },
      { property: "og:description", content: "Approfondimenti chiari, senza gergo medico inutile." },
    ],
  }),
  component: MagazinePage,
});

const posts = [
  {
    cat: "Falsi miti",
    title: "Il filler non è un lifting: perché la differenza conta",
    excerpt:
      "Volume e sostegno rispondono a problemi diversi. Confonderli è il primo passo verso un risultato innaturale.",
    date: "12 marzo 2026",
    read: "6 min",
  },
  {
    cat: "Post-operatorio",
    title: "Le prime 72 ore dopo una rinoplastica",
    excerpt: "Cosa aspettarsi davvero, ora per ora, e quali segnali meritano una telefonata.",
    date: "2 marzo 2026",
    read: "8 min",
  },
  {
    cat: "Scelte consapevoli",
    title: "Come si legge un preventivo di chirurgia estetica",
    excerpt: "Sala operatoria, anestesista, protesi, controlli: cosa deve essere sempre incluso.",
    date: "18 febbraio 2026",
    read: "5 min",
  },
  {
    cat: "Medicina estetica",
    title: "Botox a 30 anni: prevenzione o eccesso?",
    excerpt: "La risposta dipende dalla mimica, non dall'anno di nascita.",
    date: "4 febbraio 2026",
    read: "4 min",
  },
  {
    cat: "Chirurgia del corpo",
    title: "Liposuzione non è dimagrimento",
    excerpt: "Cosa può e cosa non può fare, spiegato con numeri realistici.",
    date: "21 gennaio 2026",
    read: "7 min",
  },
  {
    cat: "In studio",
    title: "Perché la prima consulenza dura un'ora",
    excerpt: "L'anamnesi estetica è la parte più sottovalutata dell'intero percorso.",
    date: "9 gennaio 2026",
    read: "5 min",
  },
];

function MagazinePage() {
  return (
    <>
      <PageHero
        eyebrow="Magazine"
        title="Capire prima di decidere."
        lede="Approfondimenti su trattamenti, recupero e falsi miti. Scritti per chi sta valutando, non per chi ha già deciso."
      />

      <section className="py-20 md:py-28">
        <div className="container-aura grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05}>
              <article className="card-aura card-hover flex h-full flex-col p-8">
                <span className="eyebrow text-sage">{p.cat}</span>
                <h2 className="mt-4 text-xl font-semibold leading-snug tracking-[-0.02em]">
                  {p.title}
                </h2>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{p.excerpt}</p>
                <div className="mt-8 text-xs text-muted-foreground">
                  {p.date} · {p.read} di lettura
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
