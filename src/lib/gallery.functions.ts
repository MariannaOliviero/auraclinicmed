import { createServerFn } from "@tanstack/react-start";

export type PublicCase = {
  id: string;
  title: string;
  category: string;
  meta: string | null;
  description: string | null;
  before: string;
  after: string;
};

/**
 * Casi prima/dopo pubblicati: solo con consenso attivo e non revocato.
 * Le immagini sono in un bucket privato, servite con link firmati temporanei.
 */
export const getPublishedCases = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicCase[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("case_photos")
      .select("id,title,category,meta,description,before_public_path,after_public_path")
      .eq("published", true)
      .eq("publication_consent", true)
      .is("consent_revoked_at", null)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    const paths = data.flatMap((c) =>
      [c.before_public_path, c.after_public_path].filter((p): p is string => !!p),
    );
    if (paths.length === 0) return [];

    const { data: signed } = await supabaseAdmin.storage
      .from("case-photos")
      .createSignedUrls(paths, 60 * 60);

    const urls = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));

    return data.flatMap((c) => {
      const before = c.before_public_path ? urls.get(c.before_public_path) : undefined;
      const after = c.after_public_path ? urls.get(c.after_public_path) : undefined;
      if (!before || !after) return [];
      return [
        {
          id: c.id,
          title: c.title,
          category: c.category,
          meta: c.meta,
          description: c.description,
          before,
          after,
        },
      ];
    });
  },
);
