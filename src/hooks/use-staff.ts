import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "staff";

export function useStaff() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return { user: null, roles: [] as AppRole[] };
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      return { user, roles: (data ?? []).map((r) => r.role as AppRole) };
    },
    staleTime: 30_000,
  });
}
