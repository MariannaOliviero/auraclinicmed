import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/lead")({
  component: LeadsPage,
});

const STATUSES = ["nuovo", "contattato", "consulenza-fissata", "chiuso"] as const;

function LeadsPage() {
  const qc = useQueryClient();
  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: { status?: string; internal_note?: string } }) => {
      const { error } = await supabase.from("leads").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead aggiornato");
    },
    onError: () => toast.error("Aggiornamento non riuscito"),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow">Gestionale</p>
      <h1 className="display-md mt-3 text-3xl">Lead dal sito</h1>
      <p className="lede mt-3 text-base">
        Richieste ricevute dal modulo contatti. I dati sono trattati secondo la base giuridica del
        consenso raccolto in fase di invio.
      </p>

      <div className="mt-10 space-y-4">
        {(leads ?? []).map((l) => (
          <div key={l.id} className="card-aura p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold tracking-[-0.02em]">{l.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  <a href={`mailto:${l.email}`} className="hover:text-foreground">{l.email}</a> ·{" "}
                  <a href={`tel:${l.phone}`} className="hover:text-foreground">{l.phone}</a>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {l.interest ?? "—"} · disponibilità: {l.slot ?? "—"}
                </div>
              </div>
              <div className="text-right">
                <select
                  value={l.status}
                  onChange={(e) => update.mutate({ id: l.id, patch: { status: e.target.value } })}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="mt-2 text-xs text-muted-foreground">
                  {new Date(l.created_at).toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Marketing: {l.marketing_consent ? "sì" : "no"}
                </div>
              </div>
            </div>

            {l.note && <p className="mt-4 rounded-xl bg-muted p-4 text-sm">{l.note}</p>}

            <Textarea
              defaultValue={l.internal_note ?? ""}
              placeholder="Nota interna…"
              className="mt-4 min-h-20 rounded-xl"
              onBlur={(e) => {
                if (e.target.value !== (l.internal_note ?? "")) {
                  update.mutate({ id: l.id, patch: { internal_note: e.target.value } });
                }
              }}
            />
          </div>
        ))}
        {(leads?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">Nessun lead ricevuto finora.</p>
        )}
      </div>
    </div>
  );
}
