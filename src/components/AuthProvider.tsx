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
      try {
        const { data, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.warn("[AuthProvider] getUser error:", authError.message);
        }
        if (cancelled || !data?.user) {
          setState((s) => ({ ...s, loading: false }));
          return;
        }

        const u = data.user;

        // Parallel fetch with individual error handling
        const [roleResult, profileResult, attemptsResult] = await Promise.allSettled([
          fetchRole(u.id),
          supabase.from("profiles").select("display_name").eq("id", u.id).maybeSingle(),
          supabase
            .from("lesson_attempts")
            .select("id")
            .eq("user_id", u.id)
            .limit(1),
        ]);

        if (cancelled) return;

        const role = roleResult.status === "fulfilled" ? roleResult.value : null;
        const displayName =
          profileResult.status === "fulfilled"
            ? (profileResult.value?.data?.display_name ?? "")
            : "";
        const attempts =
          attemptsResult.status === "fulfilled"
            ? attemptsResult.value?.data
            : null;

        setState({
          user: u,
          role,
          displayName,
          loading: false,
          isFirstVisit: !attempts || attempts.length === 0,
        });
      } catch (err) {
        console.error("[AuthProvider] Unexpected error:", err);
        setState((s) => ({ ...s, loading: false }));
      }
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
