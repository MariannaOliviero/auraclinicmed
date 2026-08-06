import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Accesso staff | AURA Clinic" },
      { name: "description", content: "Area riservata al personale di AURA Clinic: gestione pazienti, agenda, lead e documenti." },
      { property: "og:title", content: "Accesso staff | AURA Clinic" },
      { property: "og:description", content: "Area riservata al personale dello studio." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const credentials = z.object({
  email: z.string().trim().email("Email non valida").max(160),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const dest = search.redirect && search.redirect.startsWith("/") ? search.redirect : "/admin";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: dest, replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        navigate({ to: dest, replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [dest, navigate]);

  const submit = async () => {
    const parsed = credentials.safeParse({ email, password });
    if (!parsed.success) return toast.error(parsed.error.issues[0]!.message);
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          ...parsed.data,
          options: {
            emailRedirectTo: window.location.origin + "/admin",
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          return;
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Accesso non riuscito");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) toast.error("Accesso con Google non riuscito");
  };

  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="card-aura p-8 md:p-10">
          <p className="eyebrow">Area riservata</p>
          <h1 className="display-md mt-3 text-3xl">
            {sent ? "Controlla la tua email" : mode === "login" ? "Accesso staff" : "Nuovo account staff"}
          </h1>

          {sent ? (
            <p className="lede mt-4 text-base">
              Ti abbiamo inviato un link di conferma a {email}. Dopo la conferma potrai accedere al
              gestionale.
            </p>
          ) : (
            <>
              <p className="lede mt-3 text-base">
                Il gestionale è riservato al personale di AURA Clinic.
              </p>

              <div className="mt-8 grid gap-5">
                {mode === "signup" && (
                  <div>
                    <Label htmlFor="fullName">Nome e cognome</Label>
                    <Input
                      id="fullName"
                      className="mt-2 h-12 rounded-xl"
                      value={fullName}
                      maxLength={80}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="mt-2 h-12 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className="mt-2 h-12 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                  />
                </div>
              </div>

              <Button variant="hero" size="pill" className="mt-7 w-full" disabled={loading} onClick={submit}>
                {loading ? "Attendi…" : mode === "login" ? "Accedi" : "Crea account"}
              </Button>

              <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> oppure <span className="h-px flex-1 bg-border" />
              </div>

              <Button variant="quiet" size="pill" className="w-full" onClick={google}>
                Continua con Google
              </Button>

              <button
                type="button"
                className="mt-6 w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
              >
                {mode === "login" ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
              </button>
            </>
          )}

          <p className="mt-8 text-xs text-muted-foreground">
            <Link to="/" className="underline underline-offset-4">
              Torna al sito
            </Link>
          </p>
        </div>
      </motion.div>
    </section>
  );
}
