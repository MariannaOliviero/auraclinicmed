import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { FileText, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStaff } from "@/hooks/use-staff";
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

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
}

function DocumentsPage() {
  const qc = useQueryClient();
  const { data: me } = useStaff();
  const isAdmin = me?.roles.includes("admin") ?? false;

  const [form, setForm] = useState({ title: "", kind: KINDS[0] as string, patient_id: "" });
  const [file, setFile] = useState<File | null>(null);

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("id, first_name, last_name")
        .order("last_name");
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

      const paths = data.flatMap((d) => (d.file_path ? [d.file_path] : []));
      const urls = new Map<string, string>();
      if (paths.length) {
        const { data: signed } = await supabase.storage
          .from("documenti-pazienti")
          .createSignedUrls(paths, 3600);
        (signed ?? []).forEach((s) => {
          if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl);
        });
      }
      return data.map((d) => ({ ...d, fileUrl: d.file_path ? urls.get(d.file_path) : undefined }));
    },
  });

  const upload = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      if (!file) throw new Error("Carica il file del documento (PDF o immagine)");

      const folder = form.patient_id || "senza-paziente";
      const path = `${folder}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

      const { error: uploadError } = await supabase.storage
        .from("documenti-pazienti")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { error } = await supabase.from("documents").insert({
        title: parsed.data.title,
        kind: parsed.data.kind,
        patient_id: parsed.data.patient_id || null,
        file_path: path,
        status: "archiviato",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm({ title: "", kind: KINDS[0], patient_id: "" });
      setFile(null);
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Documento caricato e archiviato");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Caricamento non riuscito"),
  });

  const remove = useMutation({
    mutationFn: async (doc: { id: string; file_path: string | null }) => {
      if (doc.file_path) {
        await supabase.storage.from("documenti-pazienti").remove([doc.file_path]);
      }
      const { error } = await supabase.from("documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Documento eliminato");
    },
    onError: () => toast.error("Operazione non consentita"),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow">Gestionale</p>
      <h1 className="display-md mt-3 text-3xl">Documenti e consensi</h1>
      <p className="lede mt-3 text-base">
        Archivio dei documenti già firmati dal paziente (su carta e scansionati, o firmati
        digitalmente altrove): carica il file, resta conservato in modo sicuro e collegato al
        paziente.
      </p>

      <div className="card-aura mt-8 grid gap-5 p-6 md:grid-cols-4 md:p-8">
        <div className="md:col-span-2">
          <Label>Titolo</Label>
          <Input
            className="mt-2 h-12 rounded-xl"
            maxLength={140}
            placeholder="Es. Consenso informato — rinoplastica"
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
              <option key={k} value={k}>
                {k}
              </option>
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
        <div className="md:col-span-3">
          <Label>File (PDF o immagine della scansione)</Label>
          <Input
            type="file"
            accept="application/pdf,image/*"
            className="mt-2 h-12 rounded-xl pt-2.5"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              if (f && !form.title)
                setForm((v) => ({ ...v, title: f.name.replace(/\.[^.]+$/, "") }));
            }}
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="hero"
            size="pill"
            className="w-full"
            disabled={upload.isPending}
            onClick={() => upload.mutate()}
          >
            <Upload className="size-4" />
            Carica documento
          </Button>
        </div>
      </div>

      <div className="card-aura mt-10 divide-y divide-border">
        {(docs ?? []).map((d) => (
          <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 size-4 shrink-0 text-sage" />
              <div>
                <div className="font-medium">{d.title}</div>
                <div className="text-sm text-muted-foreground">
                  {d.patients
                    ? `${d.patients.first_name} ${d.patients.last_name}`
                    : "Senza paziente"}{" "}
                  · {d.kind}
                </div>
                <div className="text-xs text-muted-foreground">
                  Caricato il{" "}
                  {new Date(d.created_at).toLocaleString("it-IT", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {d.fileUrl && (
                <a
                  href={d.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-sage underline-offset-4 hover:underline"
                >
                  Visualizza documento
                </a>
              )}
              {isAdmin && (
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remove.mutate({ id: d.id, file_path: d.file_path })}
                  aria-label="Elimina documento"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {(docs?.length ?? 0) === 0 && (
          <p className="p-5 text-sm text-muted-foreground">Nessun documento archiviato.</p>
        )}
      </div>
    </div>
  );
}
