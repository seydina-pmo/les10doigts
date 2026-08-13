import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchRole, type AppRole } from "@/lib/auth";
import type { User } from "@supabase/supabase-js";

type AuthState = {
  user: User | null;
  role: AppRole | null;
  displayName: string;
  loading: boolean;
  /** True only on the very first visit (no lesson_attempts yet). */
  isFirstVisit: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  displayName: "",
  loading: true,
  isFirstVisit: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    displayName: "",
    loading: true,
    isFirstVisit: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabase.auth.getUser();
      if (cancelled || !data.user) {
        setState((s) => ({ ...s, loading: false }));
        return;
      }

      const u = data.user;

      // Parallel fetch: role + profile + check first visit
      const [roleResult, profileResult, attemptsResult] = await Promise.all([
        fetchRole(u.id),
        supabase.from("profiles").select("display_name").eq("id", u.id).maybeSingle(),
        supabase
          .from("lesson_attempts")
          .select("id")
          .eq("user_id", u.id)
          .limit(1),
      ]);

      if (cancelled) return;

      setState({
        user: u,
        role: roleResult,
        displayName: profileResult.data?.display_name ?? "",
        loading: false,
        isFirstVisit: !attemptsResult.data || attemptsResult.data.length === 0,
      });
    }

    void load();

    // Update on auth changes (logout, etc.)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setState({
          user: null,
          role: null,
          displayName: "",
          loading: false,
          isFirstVisit: false,
        });
      } else {
        void load();
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
