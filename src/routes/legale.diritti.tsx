import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { z } from "zod";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/motion-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/legale/diritti")({
  head: () => ({
    meta: [
      { title: "Diritti dell'interessato | AURA Clinic" },
      {
        name: "description",
        content:
          "Esercita i diritti di accesso, rettifica, cancellazione, portabilità e opposizione sui tuoi dati personali trattati da AURA Clinic.",
      },
      { property: "og:title", content: "Diritti dell'interessato | AURA Clinic" },
      { property: "og:description", content: "Modulo per l'esercizio dei diritti ex artt. 15-22 GDPR." },
    ],
  }),
  component: RightsPage,
});

const rights = [
  { id: "accesso", label: "Accesso ai dati (Art. 15)" },
  { id: "rettifica", label: "Rettifica (Art. 16)" },
  { id: "cancellazione", label: "Cancellazione (Art. 17)" },
  { id: "limitazione", label: "Limitazione (Art. 18)" },
  { id: "portabilita", label: "Portabilità (Art. 20)" },
  { id: "opposizione", label: "Opposizione (Art. 21)" },
  { id: "revoca", label: "Revoca del consenso immagini" },
];

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  request: z.string().min(1),
  details: z.string().trim().max(800).optional(),
  confirm: z.literal(true),
});

function RightsPage() {
  const [selected, setSelected] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = () => {
    const result = schema.safeParse({ name, email, request: selected, details, confirm });
    if (!result.success) {
      setError("Compila nome, email, tipo di richiesta e conferma di identità.");
      return;
    }
    setError(null);
    setDone(true);
  };

  return (
    <>
      <PageHero
        eyebrow="GDPR"
        title="Diritti dell'interessato"
        lede="Puoi esercitare in qualsiasi momento i tuoi diritti sui dati personali. Rispondiamo entro 30 giorni, senza costi."
      />

      <section className="py-20 md:py-28">
        <div className="container-aura max-w-3xl">
          <Reveal>
            <div className="card-aura p-8 md:p-10">
              {done ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="py-10 text-center"
                >
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-sage text-sage-foreground">
                    <Check className="size-6" />
                  </div>
                  <h2 className="display-md mt-6 text-2xl">Richiesta registrata</h2>
                  <p className="lede mt-3 text-base">
                    Riceverai riscontro all'indirizzo {email} entro 30 giorni. Potremmo chiederti un
                    documento di identità per verificare la titolarità dei dati.
                  </p>
                </motion.div>
              ) : (
                <>
                  <h2 className="display-md text-2xl">Modulo di richiesta</h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {rights.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelected(r.id)}
                        className={`rounded-2xl border px-5 py-4 text-left text-sm transition-all duration-300 ${
                          selected === r.id ? "border-sage bg-sage/10" : "border-border hover:border-foreground/30"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 grid gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="r-name">Nome e cognome</Label>
                        <Input id="r-name" className="mt-2 h-12 rounded-xl" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="r-email">Email</Label>
                        <Input id="r-email" type="email" className="mt-2 h-12 rounded-xl" maxLength={160} value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="r-details">Dettagli della richiesta (facoltativo)</Label>
                      <Textarea id="r-details" className="mt-2 min-h-28 rounded-xl" maxLength={800} value={details} onChange={(e) => setDetails(e.target.value)} />
                    </div>
                    <label className="flex items-start gap-3 text-sm">
                      <Checkbox checked={confirm} onCheckedChange={(v) => setConfirm(v === true)} className="mt-1" />
                      <span className="text-muted-foreground">
                        Dichiaro di essere l'interessato o di avere titolo per presentare la
                        richiesta, e acconsento al trattamento dei dati necessari a gestirla.
                      </span>
                    </label>
                  </div>

                  {error && <p className="mt-6 text-sm text-destructive">{error}</p>}

                  <Button variant="hero" size="pill" className="mt-8" onClick={submit}>
                    Invia richiesta
                  </Button>
                </>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <p className="mt-10 text-sm text-muted-foreground">
              In alternativa puoi scrivere a privacy@auraclinic.it o al DPO all'indirizzo
              dpo@auraclinic.it. Hai inoltre diritto di proporre reclamo al Garante per la
              protezione dei dati personali.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
