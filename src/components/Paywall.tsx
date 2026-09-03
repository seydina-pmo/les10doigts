import { Link } from "@tanstack/react-router";

const STRIPE_URL = "https://buy.stripe.com/test_14A7sE0q95agd2kbJW8N200";

/**
 * Paywall — displayed when a free user tries to access level > 3.
 * Uses explicit colors to be readable on both light and dark backgrounds.
 */
export function Paywall({ currentLevel }: { currentLevel: number }) {
  return (
    <div className="rounded-2xl border-2 border-[#4361ee]/40 bg-white p-8 text-center shadow-2xl animate-fade-in">
      {/* Lock icon */}
      <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-[#4361ee]/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#4361ee]"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4361ee]">
        contenu premium
      </p>
      <h2 className="mt-3 font-serif text-3xl text-[#1e3a5f]">
        Bravo, vous avez terminé les 3 niveaux gratuits !
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[#5a7a9a]">
        Le niveau {currentLevel} fait partie du parcours complet (100 niveaux).
        Abonnez-vous pour continuer votre progression et décrocher vos certifications.
      </p>

      {/* What you get */}
      <div className="mx-auto mt-8 grid max-w-sm gap-2 text-left text-sm">
        {["100 niveaux progressifs", "Certifications Bronze · Argent · Or", "Heatmap des touches à retravailler", "Mode Focus plein écran"].map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
            <span className="text-[#4361ee] font-bold">✓</span>
            <span className="text-[#1e3a5f]">{item}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href={STRIPE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-[#4361ee] px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#3451d1]"
        >
          S&apos;abonner — 10 €/mois
        </a>
        <Link
          to="/app"
          className="rounded-md border border-[#e2e8f0] px-5 py-3 text-sm text-[#5a7a9a] transition hover:bg-[#f1f5f9]"
        >
          Retour au tableau de bord
        </Link>
      </div>

      <p className="mt-6 text-xs text-[#5a7a9a]">
        Paiement sécurisé par carte bancaire ou Mobile Money.
      </p>
    </div>
  );
}

/**
 * KickedBanner — displayed when a user is disconnected because
 * their account is active on too many devices.
 */
export function KickedBanner() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-paper/90 backdrop-blur-sm animate-fade-in">
      <div className="mx-4 max-w-md rounded-2xl border-2 border-destructive/30 bg-card p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-destructive/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-destructive"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl">Session déplacée</h2>
        <p className="mt-3 text-sm text-ink-soft">
          Votre compte est utilisé sur un autre appareil.
          Vous avez été déconnecté car la limite de 2 appareils simultanés est atteinte.
        </p>
        <Link
          to="/auth"
          className="mt-6 inline-block rounded-md bg-copper px-5 py-2.5 text-sm font-medium text-white transition hover:bg-copper-deep"
        >
          Se reconnecter
        </Link>
      </div>
    </div>
  );
}
