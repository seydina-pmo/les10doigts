import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { KickedBanner } from "@/components/Paywall";
import { useSessionGuard } from "@/lib/session-guard";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [{ title: "Mon espace, La Méthode des 10 Doigts" }] }),
  component: AppLayout,
});

function AppLayout() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

function AppShell() {
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { role, displayName } = useAuth();
  const { status: sessionStatus } = useSessionGuard();

  // Show kicked banner if session was displaced
  if (sessionStatus === "kicked") {
    return <KickedBanner />;
  }

  async function logout() {
    await supabase.auth.signOut();
    nav({ to: "/" });
  }

  const tabs: { to: string; label: string; show: boolean }[] = [
    { to: "/app", label: "Tableau de bord", show: role !== "admin_ecole" && role !== "super_admin" },
    { to: "/app/train", label: "S'entraîner", show: role !== "admin_ecole" && role !== "super_admin" },
    { to: "/app/classes", label: role === "formateur" ? "Mes classes" : "Ma classe", show: role === "formateur" || role === "eleve" },
    { to: "/app/certification", label: "Certification", show: role !== "admin_ecole" && role !== "super_admin" },
    { to: "/app/exam", label: "Examen", show: role !== "admin_ecole" && role !== "super_admin" },
    { to: "/app/ecole", label: "Mon école", show: role === "admin_ecole" },
    { to: "/app/admin", label: "Admin", show: role === "super_admin" },
  ].filter((t) => t.show);

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <img src="/favicon.png" alt="" className="h-9 w-9 rounded-lg" />
          <span className="font-serif text-lg font-medium text-[#1e3a5f]">Les <span className="text-[#4361ee]">10</span> Doigts</span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-ink-soft">
          <span>
            {displayName || "compte"} ·{" "}
            <span className="text-copper-deep">{role ?? "particulier"}</span>
          </span>
          <button
            onClick={logout}
            className="rounded-md border border-rule px-3 py-1.5 hover:bg-paper-deep"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <nav className="mx-auto max-w-6xl border-b border-rule px-6">
        <ul className="flex flex-wrap gap-1">
          {tabs.map((t) => {
            const active = path === t.to || (t.to !== "/app" && path.startsWith(t.to));
            return (
              <li key={t.to}>
                <Link
                  to={t.to}
                  preload="intent"
                  className={
                    "inline-block px-4 py-3 text-sm font-medium transition-colors duration-150 " +
                    (active
                      ? "border-b-2 border-copper text-foreground"
                      : "border-b-2 border-transparent text-ink-soft hover:text-foreground")
                  }
                >
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Page content with smooth transition */}
      <div className="animate-fade-in" style={{ animationDuration: "150ms" }}>

      <Outlet />
      </div>
    </main>
  );
}
