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

    async function load(user: User) {
      try {
        // Parallel fetch with individual error handling
        const [roleResult, profileResult, attemptsResult] = await Promise.allSettled([
          fetchRole(user.id),
          supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
          supabase
            .from("lesson_attempts")
            .select("id")
            .eq("user_id", user.id)
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
          user,
          role,
          displayName,
          loading: false,
          isFirstVisit: !attempts || attempts.length === 0,
        });
      } catch (err) {
        console.error("[AuthProvider] load error:", err);
        // CRITICAL: even if DB queries fail, keep the user logged in!
        if (!cancelled) {
          setState({
            user,
            role: null,
            displayName: "",
            loading: false,
            isFirstVisit: true,
          });
        }
      }
    }

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        if (data.session?.user) {
          await load(data.session.user);
        } else {
          setState((s) => ({ ...s, loading: false }));
        }
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      }
    }

    void init();

    // Only react to SIGNED_OUT — don't reload on every token refresh
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;

      if (event === "SIGNED_OUT") {
        setState({
          user: null,
          role: null,
          displayName: "",
          loading: false,
          isFirstVisit: false,
        });
        return;
      }

      // SIGNED_IN: load user data
      if (event === "SIGNED_IN" && session?.user) {
        void load(session.user);
        return;
      }

      // TOKEN_REFRESHED: update the user object but DON'T reload from DB
      if (event === "TOKEN_REFRESHED" && session?.user) {
        setState((s) => ({ ...s, user: session.user }));
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
