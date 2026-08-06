import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/documenti")({
  component: DocumentsPage,
});

const KINDS = ["consenso-informato", "consenso-dati-sanitari", "preventivo", "referto"] as const;

const schema = z.object({
  title: z.string().trim().min(3, "Titolo obbligatorio").max(140),
  kind: z.string(),
  patient_id: z.string(),
});

function DocumentsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", kind: KINDS[0] as string, patient_id: "" });
  const [signing, setSigning] = useState<{ id: string; name: string } | null>(null);

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("id, first_name, last_name").order("last_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: docs } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*, patients(first_name,last_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      const { error } = await supabase.from("documents").insert({
        title: parsed.data.title,
        kind: parsed.data.kind,
        patient_id: parsed.data.patient_id || null,
        status: "da-firmare",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm({ title: "", kind: KINDS[0], patient_id: "" });
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Documento creato");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Creazione non riuscita"),
  });

  const sign = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      if (name.trim().length < 3) throw new Error("Inserisci nome e cognome del firmatario");
      const { error } = await supabase
        .from("documents")
        .update({ status: "firmato", signature_name: name.trim(), signed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setSigning(null);
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Firma registrata");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Firma non riuscita"),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow">Gestionale</p>
      <h1 className="display-md mt-3 text-3xl">Documenti e consensi</h1>
      <p className="lede mt-3 text-base">
        Consensi informati e documenti clinici con firma digitale semplice: nome del firmatario,
        data e ora vengono registrati in modo immodificabile.
      </p>

      <div className="card-aura mt-8 grid gap-5 p-6 md:grid-cols-4 md:p-8">
        <div className="md:col-span-2">
          <Label>Titolo</Label>
          <Input
            className="mt-2 h-12 rounded-xl"
            maxLength={140}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <Label>Tipo</Label>
          <select
            className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-3 text-sm"
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value })}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Paziente</Label>
          <select
            className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-3 text-sm"
            value={form.patient_id}
            onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
          >
            <option value="">Nessuno</option>
            {(patients ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.last_name} {p.first_name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-4">
          <Button variant="hero" size="pill" disabled={create.isPending} onClick={() => create.mutate()}>
            Crea documento
          </Button>
        </div>
      </div>

      <div className="card-aura mt-10 divide-y divide-border">
        {(docs ?? []).map((d) => (
          <div key={d.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium">{d.title}</div>
                <div className="text-sm text-muted-foreground">
                  {d.patients ? `${d.patients.first_name} ${d.patients.last_name}` : "Senza paziente"} · {d.kind}
                </div>
              </div>
              {d.status === "firmato" ? (
                <div className="text-right text-xs text-sage">
                  Firmato da {d.signature_name}
                  <div className="text-muted-foreground">
                    {d.signed_at
                      ? new Date(d.signed_at).toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })
                      : ""}
                  </div>
                </div>
              ) : (
                <Button
                  variant="quiet"
                  size="sm"
                  className="rounded-full px-5"
                  onClick={() => setSigning({ id: d.id, name: "" })}
                >
                  Firma
                </Button>
              )}
            </div>

            {signing?.id === d.id && (
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <div className="min-w-56 flex-1">
                  <Label>Nome e cognome del firmatario</Label>
                  <Input
                    className="mt-2 h-12 rounded-xl"
                    maxLength={80}
                    value={signing.name}
                    onChange={(e) => setSigning({ id: d.id, name: e.target.value })}
                  />
                </div>
                <Button
                  variant="hero"
                  size="pill"
                  disabled={sign.isPending}
                  onClick={() => sign.mutate({ id: d.id, name: signing.name })}
                >
                  Registra firma
                </Button>
                <Button variant="ghost" size="pill" onClick={() => setSigning(null)}>
                  Annulla
                </Button>
              </div>
            )}
          </div>
        ))}
        {(docs?.length ?? 0) === 0 && <p className="p-5 text-sm text-muted-foreground">Nessun documento.</p>}
      </div>
    </div>
  );
}
