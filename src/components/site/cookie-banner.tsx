import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const KEY = "aura-cookie-consent";
const EASE = [0.22, 1, 0.36, 1] as const;

type Consent = { necessary: true; statistics: boolean; marketing: boolean; ts: string };

export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [statistics, setStatistics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  const save = (consent: Omit<Consent, "necessary" | "ts">) => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ necessary: true, ...consent, ts: new Date().toISOString() } satisfies Consent),
    );
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-xl rounded-3xl border border-border bg-background/85 p-6 shadow-[var(--shadow-lift)] backdrop-blur-xl md:p-7"
          role="dialog"
          aria-label="Preferenze cookie"
        >
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Rispettiamo la tua privacy</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Usiamo cookie tecnici necessari al funzionamento del sito. Solo con il tuo consenso
            attiviamo cookie statistici e di marketing. Puoi rifiutare con un clic, esattamente come
            accettare.
          </p>

          <AnimatePresence initial={false}>
            {details && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="mt-5 space-y-4 border-t border-border pt-5">
                  <Row
                    title="Tecnici (necessari)"
                    desc="Indispensabili per la navigazione e la sicurezza. Sempre attivi."
                    checked
                    disabled
                  />
                  <Row
                    title="Statistici"
                    desc="Misurano l'uso del sito in forma aggregata."
                    checked={statistics}
                    onChange={setStatistics}
                  />
                  <Row
                    title="Marketing"
                    desc="Profilazione e misurazione delle campagne."
                    checked={marketing}
                    onChange={setMarketing}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Button variant="hero" size="sm" className="rounded-full px-5" onClick={() => save({ statistics: true, marketing: true })}>
              Accetta tutti
            </Button>
            <Button variant="quiet" size="sm" className="rounded-full px-5" onClick={() => save({ statistics: false, marketing: false })}>
              Rifiuta tutti
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-4 text-muted-foreground"
              onClick={() => (details ? save({ statistics, marketing }) : setDetails(true))}
            >
              {details ? "Salva preferenze" : "Personalizza"}
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            <Link to="/legale/cookie" className="underline underline-offset-4">
              Cookie Policy
            </Link>{" "}
            ·{" "}
            <Link to="/legale/privacy" className="underline underline-offset-4">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({
  title,
  desc,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange ?? (() => {})} disabled={disabled ?? false} />

    </div>
  );
}
