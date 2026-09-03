import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { watermarkImage } from "@/lib/watermark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_authenticated/admin/risultati")({
  component: GalleryAdminPage,
});

const categories = [
  { slug: "viso", label: "Viso" },
  { slug: "seno", label: "Seno" },
  { slug: "corpo", label: "Corpo" },
  { slug: "medicina-estetica", label: "Medicina estetica" },
];

const empty = {
  title: "",
  category: "viso",
  meta: "",
  description: "",
  consent: false,
  consent_signer: "",
  face_anonymized: false,
  published: false,
};

function GalleryAdminPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [before, setBefore] = useState<File | null>(null);
  const [after, setAfter] = useState<File | null>(null);

  const { data: cases } = useQuery({
    queryKey: ["case_photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_photos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const paths = data.flatMap((c) =>
        [c.before_public_path, c.after_public_path].filter((p): p is string => !!p),
      );
      const previews = new Map<string, string>();
      if (paths.length) {
        const { data: signed } = await supabase.storage
          .from("case-photos")
          .createSignedUrls(paths, 3600);
        (signed ?? []).forEach((s) => s.signedUrl && previews.set(s.path, s.signedUrl));
      }
      return data.map((c) => ({
        ...c,
        beforeUrl: c.before_public_path ? previews.get(c.before_public_path) : undefined,
        afterUrl: c.after_public_path ? previews.get(c.after_public_path) : undefined,
      }));
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error("Titolo obbligatorio");
      if (!before || !after) throw new Error("Carica sia la foto prima sia quella dopo");
      if (!form.consent) throw new Error("Serve il consenso alla pubblicazione delle immagini");
      if (!form.consent_signer.trim()) throw new Error("Indica chi ha firmato il consenso");

      const { data: userData } = await supabase.auth.getUser();
      const folder = crypto.randomUUID();

      const upload = async (file: File, kind: "before" | "after") => {
        const raw = `${folder}/${kind}-originale.${file.name.split(".").pop() ?? "jpg"}`;
        const wm = `${folder}/${kind}-filigrana.jpg`;
        const { error: e1 } = await supabase.storage
          .from("case-photos")
          .upload(raw, file, { upsert: false, contentType: file.type });
        if (e1) throw e1;
        const watermarked = await watermarkImage(file);
        const { error: e2 } = await supabase.storage
          .from("case-photos")
          .upload(wm, watermarked, { upsert: false, contentType: "image/jpeg" });
        if (e2) throw e2;
        return { raw, wm };
      };

      const b = await upload(before, "before");
      const a = await upload(after, "after");

      const { error } = await supabase.from("case_photos").insert({
        title: form.title.trim(),
        category: form.category,
        meta: form.meta.trim() || null,
        description: form.description.trim() || null,
        before_path: b.raw,
        after_path: a.raw,
        before_public_path: b.wm,
        after_public_path: a.wm,
        face_anonymized: form.face_anonymized,
        publication_consent: form.consent,
        consent_at: new Date().toISOString(),
        consent_signer: form.consent_signer.trim(),
        published: form.published,
        created_by: userData.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm(empty);
      setBefore(null);
      setAfter(null);
      qc.invalidateQueries({ queryKey: ["case_photos"] });
      toast.success("Caso caricato con filigrana");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Caricamento non riuscito"),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase.from("case_photos").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case_photos"] });
      toast.success("Caso aggiornato");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Aggiornamento non riuscito"),
  });

  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow">Gestionale</p>
      <h1 className="display-md mt-3 text-3xl">Galleria prima/dopo</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Le foto restano in un archivio privato. Sul sito pubblico vengono mostrate solo le versioni
        con filigrana dei casi pubblicati con consenso attivo; alla revoca spariscono subito.
      </p>

      <div className="mt-8 rounded-3xl border border-border bg-background p-6 md:p-8">
        <h2 className="text-base font-semibold">Nuovo caso</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <Label>Titolo</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Rinoplastica strutturata"
            />
          </div>
          <div>
            <Label>Categoria</Label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Dettagli (età, tempo dall'intervento)</Label>
            <Input
              value={form.meta}
              onChange={(e) => setForm({ ...form, meta: e.target.value })}
              placeholder="Donna, 29 anni · 12 mesi dopo"
            />
          </div>
          <div>
            <Label>Firmatario del consenso</Label>
            <Input
              value={form.consent_signer}
              onChange={(e) => setForm({ ...form, consent_signer: e.target.value })}
              placeholder="Nome e cognome del paziente"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Note pubbliche</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label>Foto prima</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setBefore(e.target.files?.[0] ?? null)}
            />
          </div>
          <div>
            <Label>Foto dopo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setAfter(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <div className="mt-6 space-y-3 rounded-2xl bg-muted/50 p-4 text-sm">
          <label className="flex items-start gap-3">
            <Checkbox
              checked={form.consent}
              onCheckedChange={(v) => setForm({ ...form, consent: v === true })}
            />
            <span>
              Consenso scritto specifico alla pubblicazione delle immagini (Art. 9 GDPR), distinto
              dal consenso al trattamento sanitario e revocabile.
            </span>
          </label>
          <label className="flex items-start gap-3">
            <Checkbox
              checked={form.face_anonymized}
              onCheckedChange={(v) => setForm({ ...form, face_anonymized: v === true })}
            />
            <span>Volto anonimizzato su richiesta del paziente</span>
          </label>
          <label className="flex items-start gap-3">
            <Checkbox
              checked={form.published}
              onCheckedChange={(v) => setForm({ ...form, published: v === true })}
            />
            <span>Pubblica subito nella galleria del sito</span>
          </label>
        </div>

        <Button
          className="mt-6"
          onClick={() => create.mutate()}
          disabled={create.isPending}
          size="pill"
        >
          {create.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Carica con filigrana
        </Button>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {(cases ?? []).map((c) => (
          <div key={c.id} className="rounded-3xl border border-border bg-background p-5">
            <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl">
              {[c.beforeUrl, c.afterUrl].map((src, i) => (
                <div key={i} className="aspect-[3/4] bg-muted">
                  {src && (
                    <img
                      src={src}
                      alt={`${c.title} — ${i === 0 ? "prima" : "dopo"}`}
                      className="size-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 font-medium">{c.title}</div>
            <div className="text-sm text-muted-foreground">{c.meta}</div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-border px-3 py-1">
                {c.published ? "Pubblicato" : "Bozza"}
              </span>
              <span className="rounded-full border border-border px-3 py-1">
                {c.consent_revoked_at ? "Consenso revocato" : "Consenso attivo"}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="quiet"
                size="sm"
                onClick={() => update.mutate({ id: c.id, patch: { published: !c.published } })}
                disabled={!!c.consent_revoked_at && !c.published}
              >
                {c.published ? "Ritira dal sito" : "Pubblica"}
              </Button>
              {!c.consent_revoked_at && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    update.mutate({
                      id: c.id,
                      patch: { consent_revoked_at: new Date().toISOString(), published: false },
                    })
                  }
                >
                  Registra revoca
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
