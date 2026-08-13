import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VoiceGuide } from "@/components/VoiceGuide";


export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Connexion, La Méthode des 10 Doigts" },
      { name: "description", content: "Connectez-vous ou créez votre compte élève ou particulier." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";
type View = "form" | "check-email";

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [view, setView] = useState<View>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Redirect once a session becomes available (signin + signup + OAuth).
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) nav({ to: "/app" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/app" });
    });
    return () => sub.subscription.unsubscribe();
  }, [nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/app",
            data: { display_name: displayName, role: "particulier" },
          },
        });
        if (error) throw error;
        // Show email verification screen instead of redirecting
        setView("check-email");
        setBusy(false);
        return;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      // onAuthStateChange will handle the redirect.
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Une erreur est survenue");
      setBusy(false);
    }
  }

  async function onGoogle() {
    setErr(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/app",
      },
    });
    if (error) {
      setErr(error.message);
      setBusy(false);
    }
  }

  async function resendEmail() {
    setBusy(true);
    setErr(null);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: window.location.origin + "/app" },
      });
      if (error) throw error;
      setErr(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Impossible de renvoyer l'email.");
    } finally {
      setBusy(false);
    }
  }

  // Email verification screen
  if (view === "check-email") {
    return (
      <main className="relative min-h-screen">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/favicon.png" alt="" className="h-10 w-10 rounded-lg" />
            <span className="font-serif text-xl font-medium text-[#1e3a5f]">Les <span className="text-[#4361ee]">10</span> Doigts</span>
          </Link>
        </header>

        <section className="mx-auto grid max-w-md gap-6 px-6 pb-20 pt-10 animate-fade-in">
          <div className="text-center">
            {/* Animated envelope icon */}
            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-copper/15 animate-bounce" style={{ animationDuration: "2s" }}>
              <span className="text-4xl">✉️</span>
            </div>

            <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">
              vérification requise
            </p>
            <h1 className="mt-3 font-serif text-3xl">Vérifiez votre boîte mail</h1>
            <p className="mt-4 text-ink-soft">
              Nous avons envoyé un lien de confirmation à :
            </p>
            <p className="mt-2 rounded-md border border-rule bg-card px-4 py-2 font-mono text-sm text-foreground">
              {email}
            </p>
            <p className="mt-4 text-sm text-ink-soft">
              Cliquez sur le lien dans l&apos;email pour activer votre compte et commencer votre apprentissage.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-xl border border-rule bg-card p-4">
              <p className="text-sm font-medium">💡 Vous ne trouvez pas l&apos;email ?</p>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                <li>· Vérifiez votre dossier <strong>spam</strong> ou <strong>courrier indésirable</strong></li>
                <li>· L&apos;email peut prendre quelques minutes</li>
                <li>· Vérifiez que l&apos;adresse est correcte</li>
              </ul>
            </div>

            <button
              onClick={resendEmail}
              disabled={busy}
              className="rounded-md border border-rule px-4 py-2.5 text-sm font-medium transition hover:bg-paper-deep disabled:opacity-60"
            >
              {busy ? "Envoi en cours…" : "Renvoyer l'email de vérification"}
            </button>

            {err && <p className="text-center text-sm text-destructive">{err}</p>}

            <button
              type="button"
              className="text-sm text-ink-soft underline-offset-4 hover:underline"
              onClick={() => {
                setView("form");
                setMode("signup");
              }}
            >
              ← Utiliser une autre adresse email
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col bg-gradient-to-b from-white to-[#f5f7fb]">
      {busy && <LoadingOverlay mode={mode} />}

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-3">
          <img src="/favicon.png" alt="" className="h-10 w-10 rounded-lg" />
          <span className="font-serif text-xl font-medium text-[#1e3a5f]">Les <span className="text-[#4361ee]">10</span> Doigts</span>
        </Link>
        <Link to="/ecoles" className="text-sm text-[#5a7a9a] underline-offset-4 hover:underline">
          Vous êtes une école ?
        </Link>
      </header>

      <section className="mx-auto grid w-full max-w-md gap-6 px-6 pb-20 pt-8">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#4361ee]">
            {mode === "signup" ? "créer un compte" : "se connecter"}
          </p>
          <h1 className="mt-3 font-serif text-3xl text-[#1e3a5f]">
            {mode === "signup" ? "Rejoignez la méthode." : "Bienvenue."}
          </h1>
        </div>

        {/* Voice guide for new users */}
        <div className="flex justify-center">
          <VoiceGuide page="auth" />
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={onGoogle}
          className="flex items-center justify-center gap-3 rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continuer avec Google
        </button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[#94a3b8]">
          <span className="h-px flex-1 bg-[#e2e8f0]" /> ou <span className="h-px flex-1 bg-[#e2e8f0]" />
        </div>

        <form onSubmit={onSubmit} className="grid gap-4">
          {mode === "signup" && (
            <>
              <label className="grid gap-1.5 text-sm">
                <span className="text-ink-soft">Nom affiché</span>
                <input
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 shadow-sm transition focus:border-[#4361ee] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/20"
                />
              </label>
              <p className="text-xs text-ink-soft">
                Ce formulaire est réservé aux <strong>particuliers</strong>.
                Les élèves d&apos;une école reçoivent leurs identifiants
                directement de leur enseignant·e.{" "}
                <Link to="/ecoles" className="underline">
                  En savoir plus
                </Link>
                .
              </p>
            </>
          )}
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-soft">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 shadow-sm transition focus:border-[#4361ee] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/20"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-soft">Mot de passe</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 shadow-sm transition focus:border-[#4361ee] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/20"
            />
          </label>

          {err && <p className="text-sm text-destructive">{err}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#4361ee] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#4361ee]/20 transition hover:-translate-y-0.5 hover:bg-[#3451d1] hover:shadow-lg disabled:opacity-60"
          >
            {busy && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-paper/40 border-t-paper" />
            )}
            {mode === "signup" ? "Créer le compte" : "Se connecter"}
          </button>
        </form>

        <button
          type="button"
          className="text-sm text-ink-soft underline-offset-4 hover:underline"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
        >
          {mode === "signup" ? "Déjà inscrit ? Se connecter" : "Pas encore de compte ? Créer un compte"}
        </button>
      </section>
    </main>
  );
}

/** Enhanced loading overlay with progressive contextual messages */
function LoadingOverlay({ mode }: { mode: Mode }) {
  const [step, setStep] = useState(0);

  const messages = mode === "signup"
    ? [
        "Création du compte…",
        "Configuration de votre espace…",
        "Presque terminé…",
      ]
    : [
        "Connexion en cours…",
        "Chargement de votre espace…",
      ];

  useEffect(() => {
    const timers = messages.slice(1).map((_, i) =>
      setTimeout(() => setStep(i + 1), (i + 1) * 1500),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-paper/85 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-rule bg-card px-8 py-6 shadow-lg">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-copper/30 border-t-copper" />
        <span className="font-mono text-sm text-ink-soft transition-all duration-300">
          {messages[Math.min(step, messages.length - 1)]}
        </span>
        {/* Progress bar */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-rule">
          <div
            className="h-full rounded-full bg-copper transition-all duration-700 ease-out"
            style={{ width: `${Math.min(((step + 1) / messages.length) * 100, 95)}%` }}
          />
        </div>
        {/* Progress dots */}
        <div className="flex gap-1.5">
          {messages.map((_, i) => (
            <span
              key={i}
              className={
                "h-1.5 w-1.5 rounded-full transition-colors duration-300 " +
                (i <= step ? "bg-copper" : "bg-rule")
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

