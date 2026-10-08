import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/merci-paiement")({
  head: () => ({
    meta: [{ title: "Paiement reçu — La Méthode des 10 Doigts" }],
  }),
  component: MerciPaiement,
});

function MerciPaiement() {
  return (
    <main className="min-h-screen grid place-items-center px-6 py-20">
      <div className="max-w-lg text-center animate-fade-in">
        {/* Success icon */}
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-[#ecfdf5]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-[#10b981]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-serif text-3xl text-[#1e3a5f]">
          Merci pour votre paiement !
        </h1>

        <p className="mt-4 text-lg text-[#5a7a9a] leading-relaxed">
          Votre paiement a bien été reçu. Votre abonnement est activé
          <strong className="text-[#1e3a5f]"> automatiquement</strong>.
        </p>

        <p className="mt-3 text-[#5a7a9a]">
          Si vous n'êtes pas connecté sur cet appareil, connectez-vous avec le même compte pour accéder à vos niveaux.
        </p>

        {/* What's next */}
        <div className="mt-8 rounded-xl border border-[#e2e8f0] bg-white p-6 text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#a0714f] font-semibold">
            Et maintenant ?
          </p>
          <ul className="mt-3 space-y-3 text-sm text-[#5a7a9a]">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#10b981]">1.</span>
              <span>Connectez-vous avec le compte utilisé pour le paiement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#10b981]">2.</span>
              <span>Les <strong>100 niveaux</strong> sont débloqués</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-[#10b981]">3.</span>
              <span>Vous pourrez viser les certifications <strong>Bronze, Argent et Or</strong></span>
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/app"
            className="rounded-lg bg-[#a0714f] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#8b5e3c]"
          >
            Acceder a mon espace
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-[#e2e8f0] px-6 py-3 text-sm font-medium text-[#5a7a9a] transition hover:bg-[#f8fafc]"
          >
            Retour a l'accueil
          </Link>
        </div>

        <p className="mt-10 text-xs text-[#94a3b8]">
          Une question ? Contactez-nous a{" "}
          <a href="mailto:contact@les10doigts.com" className="text-[#a0714f] hover:underline">
            contact@les10doigts.com
          </a>
        </p>
      </div>
    </main>
  );
}
