import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: Gate,
});

function Gate() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Listen for auth state changes (including OAuth callback token processing)
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setReady(true);
      }
      if (event === "SIGNED_OUT" || (event === "INITIAL_SESSION" && !session)) {
        // Only redirect if there's no hash fragment (no pending OAuth callback)
        const hasHashTokens = window.location.hash.includes("access_token");
        if (!hasHashTokens) {
          nav({ to: "/auth" });
        }
      }
    });

    return () => sub.subscription.unsubscribe();
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
