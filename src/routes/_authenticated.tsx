import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: Gate,
});

function Gate() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        // Primary check: get session from localStorage/memory
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        if (data.session) {
          setReady(true);
          checkedRef.current = true;
          return;
        }

        // No session found — check if there are OAuth tokens in hash
        if (window.location.hash.includes("access_token")) {
          // Wait for Supabase to process the hash tokens
          await new Promise((r) => setTimeout(r, 2000));
          const { data: retryData } = await supabase.auth.getSession();
          if (!mounted) return;
          if (retryData.session) {
            setReady(true);
            checkedRef.current = true;
            return;
          }
        }

        // Definitely no session → redirect to auth
        if (mounted) nav({ to: "/auth" });
      } catch {
        // Auth check failed — don't kick the user out
        if (mounted && !checkedRef.current) nav({ to: "/auth" });
      }
    }

    void checkAuth();

    // Listen for sign-out ONLY — don't react to token refreshes
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT") {
        setReady(false);
        nav({ to: "/auth" });
      }
      // SIGNED_IN and TOKEN_REFRESHED: keep the user logged in (do nothing)
      if (event === "SIGNED_IN") {
        setReady(true);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [nav]);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e2e8f0] border-t-[#4361ee]" />
          <p className="font-mono text-sm text-[#5a7a9a]">chargement…</p>
        </div>
      </main>
    );
  }
  return <Outlet />;
}
