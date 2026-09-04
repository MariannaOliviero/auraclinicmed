import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { CalendarPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_authenticated/admin/pazienti")({
  component: PatientsPage,
});

const schema = z.object({
  first_name: z.string().trim().min(2, "Nome obbligatorio").max(80),
  last_name: z.string().trim().min(2, "Cognome obbligatorio").max(80),
  email: z.string().trim().email("Email non valida").max(160).or(z.literal("")),
  phone: z.string().trim().max(30),
  birth_date: z.string().max(10),
  fiscal_code: z.string().trim().max(16),
  note: z.string().trim().max(2000),
  health_data_consent: z.boolean(),
});

const empty = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  birth_date: "",
  fiscal_code: "",
  note: "",
  health_data_consent: false,
};

function PatientsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*").order("last_name");
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      const v = parsed.data;
      const { error } = await supabase.from("patients").insert({
        first_name: v.first_name,
        last_name: v.last_name,
        email: v.email || null,
        phone: v.phone || null,
        birth_date: v.birth_date || null,
        fiscal_code: v.fiscal_code || null,
        note: v.note || null,
        health_data_consent: v.health_data_consent,
        health_data_consent_at: v.health_data_consent ? new Date().toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm(empty);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Paziente inserito");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Inserimento non riuscito"),
  });

  const filtered = (patients ?? []).filter((p) =>
    `${p.first_name} ${p.last_name} ${p.email ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Gestionale</p>
          <h1 className="display-md mt-3 text-3xl">Pazienti</h1>
        </div>
        <Button variant="hero" size="pill" onClick={() => setOpen((o) => !o)}>
          {open ? "Chiudi" : "Nuovo paziente"}
        </Button>
      </div>

      {open && (
        <div className="card-aura mt-8 p-6 md:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Nome"
              value={form.first_name}
              onChange={(v) => setForm({ ...form, first_name: v })}
            />
            <Field
              label="Cognome"
              value={form.last_name}
              onChange={(v) => setForm({ ...form, last_name: v })}
            />
            <Field
              label="Email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />
            <Field
              label="Telefono"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
            />
            <Field
              label="Data di nascita"
              type="date"
              value={form.birth_date}
              onChange={(v) => setForm({ ...form, birth_date: v })}
            />
            <Field
              label="Codice fiscale"
              value={form.fiscal_code}
              onChange={(v) => setForm({ ...form, fiscal_code: v })}
            />
          </div>
          <div className="mt-5">
            <Label htmlFor="note">Note cliniche</Label>
            <Textarea
              id="note"
              className="mt-2 min-h-24 rounded-xl"
              maxLength={2000}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
          <label className="mt-5 flex items-start gap-3 text-sm">
            <Checkbox
              checked={form.health_data_consent}
              onCheckedChange={(v) => setForm({ ...form, health_data_consent: v === true })}
              className="mt-1"
            />
            <span className="text-muted-foreground">
              Consenso esplicito al trattamento dei dati relativi alla salute (art. 9 GDPR) raccolto
              e archiviato in studio.
            </span>
          </label>
          <Button
            variant="hero"
            size="pill"
            className="mt-7"
            disabled={create.isPending}
            onClick={() => create.mutate()}
          >
            Salva paziente
          </Button>
        </div>
      )}

      <Input
        placeholder="Cerca per nome o email…"
        className="mt-8 h-12 rounded-xl"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="card-aura mt-5 divide-y divide-border">
        {filtered.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <div className="font-medium">
                {p.last_name} {p.first_name}
              </div>
              <div className="text-sm text-muted-foreground">
                {p.email ?? "—"} · {p.phone ?? "—"}
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                p.health_data_consent ? "bg-sage/15 text-sage" : "bg-muted text-muted-foreground"
              }`}
            >
              {p.health_data_consent ? "Consenso art. 9 acquisito" : "Consenso mancante"}
            </span>
            <Link
              to="/admin/agenda"
              search={{ patient_id: p.id, title: `Appuntamento — ${p.first_name} ${p.last_name}` }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <CalendarPlus className="size-4" />
              Fissa appuntamento
            </Link>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="p-5 text-sm text-muted-foreground">Nessun paziente.</p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type={type}
        className="mt-2 h-12 rounded-xl"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
