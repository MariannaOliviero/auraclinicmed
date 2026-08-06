import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

      const [leads, patients, todayAppts, docs, next] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "nuovo"),
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .gte("starts_at", start)
          .lt("starts_at", end),
        supabase.from("documents").select("id", { count: "exact", head: true }).eq("status", "da-firmare"),
        supabase
          .from("appointments")
          .select("id, title, kind, starts_at, patients(first_name,last_name)")
          .gte("starts_at", new Date().toISOString())
          .order("starts_at")
          .limit(6),
      ]);

      return {
        leads: leads.count ?? 0,
        patients: patients.count ?? 0,
        today: todayAppts.count ?? 0,
        docs: docs.count ?? 0,
        next: next.data ?? [],
      };
    },
  });

  const stats = [
    { label: "Lead da lavorare", value: data?.leads ?? 0, to: "/admin/lead" },
    { label: "Pazienti in archivio", value: data?.patients ?? 0, to: "/admin/pazienti" },
    { label: "Appuntamenti oggi", value: data?.today ?? 0, to: "/admin/agenda" },
    { label: "Documenti da firmare", value: data?.docs ?? 0, to: "/admin/documenti" },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow">Gestionale</p>
      <h1 className="display-md mt-3 text-3xl">Panoramica dello studio</h1>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="card-aura card-hover p-6">
            <div className="text-3xl font-semibold tracking-[-0.03em]">{s.value}</div>
            <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
          </Link>
        ))}
      </div>

      <h2 className="display-md mt-14 text-xl">Prossimi appuntamenti</h2>
      <div className="card-aura mt-5 divide-y divide-border">
        {(data?.next ?? []).map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <div className="font-medium">{a.title}</div>
              <div className="text-sm text-muted-foreground">
                {a.patients ? `${a.patients.first_name} ${a.patients.last_name}` : "Senza paziente"} · {a.kind}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(a.starts_at).toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}
            </div>
          </div>
        ))}
        {(data?.next.length ?? 0) === 0 && (
          <p className="p-5 text-sm text-muted-foreground">Nessun appuntamento in programma.</p>
        )}
      </div>
    </div>
  );
}
