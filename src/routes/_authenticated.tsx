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
    let mounted = true;

    // Listen for ALL auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      // Any event with a valid session → user is logged in
      if (session) {
        setReady(true);
        return;
      }

      // No session → only redirect if this is a definitive "no session" event
      if (event === "SIGNED_OUT") {
        setReady(false);
        nav({ to: "/auth" });
        return;
      }

      if (event === "INITIAL_SESSION" && !session) {
        // Check for pending OAuth hash tokens before redirecting
        const hash = window.location.hash;
        if (hash.includes("access_token") || hash.includes("refresh_token")) {
          // Supabase is still processing the hash — wait
          return;
        }
        // No session and no pending tokens → redirect
        nav({ to: "/auth" });
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
