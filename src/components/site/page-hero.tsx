import type { ReactNode } from "react";
import { Reveal } from "./motion-primitives";

export function PageHero({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-secondary/40 pb-20 pt-36 md:pb-28 md:pt-44">
      <div className="container-aura">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display-lg mt-4 max-w-3xl">{title}</h1>
          {lede && <p className="lede mt-6 max-w-2xl">{lede}</p>}
          {children}
        </Reveal>
      </div>
    </section>
  );
}

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero eyebrow="Documenti legali" title={title} lede={`Ultimo aggiornamento: ${updated}`} />
      <section className="py-20 md:py-28">
        <div className="container-aura max-w-3xl">
          <div className="mb-12 rounded-2xl border border-sage/40 bg-sage/10 p-6 text-sm leading-relaxed">
            <strong className="font-semibold">Bozza segnaposto.</strong> Questo documento è una
            bozza professionale predisposta per un progetto dimostrativo di portfolio. Prima di
            qualsiasi pubblicazione reale deve essere verificato e validato da un legale e dal
            Responsabile della Protezione dei Dati (DPO).
          </div>
          <div className="space-y-8 text-[1.0625rem] leading-relaxed text-muted-foreground [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
            {children}
          </div>
        </div>
      </section>
    </>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="display-md mb-3 text-2xl">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
