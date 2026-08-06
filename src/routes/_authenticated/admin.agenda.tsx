import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/agenda")({
  component: AgendaPage,
});

const KINDS = ["consulenza", "intervento", "controllo", "medicina-estetica"] as const;

const schema = z.object({
  title: z.string().trim().min(3, "Titolo obbligatorio").max(120),
  starts_at: z.string().min(1, "Data e ora obbligatorie"),
  kind: z.string(),
  patient_id: z.string(),
});

function AgendaPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", starts_at: "", kind: "consulenza", patient_id: "" });

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("id, first_name, last_name").order("last_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: appointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, patients(first_name,last_name)")
        .order("starts_at");
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      const v = parsed.data;
      const start = new Date(v.starts_at);
      const { error } = await supabase.from("appointments").insert({
        title: v.title,
        kind: v.kind,
        starts_at: start.toISOString(),
        ends_at: new Date(start.getTime() + 60 * 60 * 1000).toISOString(),
        patient_id: v.patient_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm({ title: "", starts_at: "", kind: "consulenza", patient_id: "" });
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appuntamento creato");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Creazione non riuscita"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appuntamento eliminato");
    },
  });

  const groups = new Map<string, typeof appointments>();
  for (const a of appointments ?? []) {
    const day = new Date(a.starts_at).toLocaleDateString("it-IT", { dateStyle: "full" });
    groups.set(day, [...(groups.get(day) ?? []), a]);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow">Gestionale</p>
      <h1 className="display-md mt-3 text-3xl">Agenda</h1>

      <div className="card-aura mt-8 grid gap-5 p-6 md:grid-cols-4 md:p-8">
        <div className="md:col-span-2">
          <Label>Titolo</Label>
          <Input
            className="mt-2 h-12 rounded-xl"
            value={form.title}
            maxLength={120}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <Label>Data e ora</Label>
          <Input
            type="datetime-local"
            className="mt-2 h-12 rounded-xl"
            value={form.starts_at}
            onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
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
        <div className="md:col-span-3">
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
        <div className="flex items-end">
          <Button variant="hero" size="pill" className="w-full" disabled={create.isPending} onClick={() => create.mutate()}>
            Aggiungi
          </Button>
        </div>
      </div>

      <div className="mt-12 space-y-8">
        {[...groups.entries()].map(([day, items]) => (
          <div key={day}>
            <h2 className="eyebrow">{day}</h2>
            <div className="card-aura mt-3 divide-y divide-border">
              {(items ?? []).map((a) => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div>
                    <div className="font-medium">{a.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {a.patients ? `${a.patients.first_name} ${a.patients.last_name}` : "Senza paziente"} · {a.kind}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {new Date(a.starts_at).toLocaleTimeString("it-IT", { timeStyle: "short" })}
                    </span>
                    <button
                      className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                      onClick={() => remove.mutate(a.id)}
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {(appointments?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">Agenda vuota.</p>
        )}
      </div>
    </div>
  );
}
