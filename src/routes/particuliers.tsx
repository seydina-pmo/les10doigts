import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

const STRIPE_URL = "https://buy.stripe.com/test_14A7sE0q95agd2kbJW8N200";

export const Route = createFileRoute("/particuliers")({
  head: () => ({
    meta: [
      { title: "Particuliers — pros, étudiants, autodidactes" },
      {
        name: "description",
        content:
          "Vous écrivez tous les jours mais regardez encore le clavier ? Une méthode pour passer le cap, à votre rythme.",
      },
      { property: "og:title", content: "Apprendre à taper au clavier — offre particulier" },
      {
        property: "og:description",
        content: "Test de positionnement, sessions courtes, certifications Bronze, Argent, Or.",
      },
      { property: "og:url", content: "https://les10doigts.com/particuliers" },
    ],
    links: [{ rel: "canonical", href: "https://les10doigts.com/particuliers" }],
  }),
  component: Page,
});


const freeFeatures = [
  "Test de positionnement de 90 secondes",
  "3 premiers niveaux d'entraînement",
  "Clavier coloré par doigt",
  "Statistiques de base",
];

const premiumFeatures = [
  "100 niveaux progressifs",
  "Heatmap des touches fragiles",
  "Mode Focus plein écran",
  "Certifications Bronze · Argent · Or",
  "Examens de certification chronométrés",
  "Suivi détaillé de votre progression",
  "Guide vocal d'accompagnement",
];

const steps = [
  {
    number: "01",
    title: "Essayez gratuitement",
    desc: "Créez un compte en 30 secondes et testez les 3 premiers niveaux sans engagement.",
  },
  {
    number: "02",
    title: "Progressez à votre rythme",
    desc: "10 minutes par jour suffisent. La méthode s'adapte à vos points faibles.",
  },
  {
    number: "03",
    title: "Abonnez-vous pour aller plus loin",
    desc: "Débloquez les 100 niveaux et préparez vos certifications Bronze, Argent, Or.",
  },
  {
    number: "04",
    title: "Décrochez votre certificat",
    desc: "Passez l'examen final et obtenez un certificat téléchargeable et vérifiable.",
  },
];


function Page() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-6 md:pt-12 animate-fade-in">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">particuliers</p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl md:text-6xl">
          Vous tapez tous les jours. Faites-le sans regarder.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-soft">
          Dix minutes par jour pour transformer votre rapport au clavier.
          La saisie n&apos;est pas un talent, c&apos;est une méthode.
        </p>

        {/* Two clear CTAs */}
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/auth"
            className="rounded-md bg-[#4361ee] px-6 py-3.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#3451d1]"
          >
            🚀 Essai gratuit — 3 niveaux offerts
          </Link>
          <a
            href={STRIPE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-copper/40 bg-copper/5 px-6 py-3.5 text-sm font-medium text-copper-deep transition hover:-translate-y-0.5 hover:bg-copper/10"
          >
            💳 S&apos;abonner — 10 € / mois
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-rule bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">
            comment ça marche
          </p>
          <h2 className="mt-4 font-serif text-3xl md:text-4xl">
            De l&apos;essai au certificat, en 4 étapes.
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div
                key={s.number}
                className="rounded-xl border border-rule bg-card p-6 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="font-serif text-3xl text-copper/60">{s.number}</span>
                <h3 className="mt-3 font-serif text-xl">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison: Free vs Premium */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">
          choisissez votre formule
        </p>
        <h2 className="mt-4 font-serif text-3xl md:text-4xl">
          Essayez d&apos;abord, payez quand vous êtes prêt.
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Free plan */}
          <div className="rounded-2xl border border-rule bg-card p-8">
            <span className="inline-block rounded-full border border-rule bg-paper-deep px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
              découverte
            </span>
            <p className="mt-4 font-serif text-4xl">Gratuit</p>
            <p className="text-sm text-ink-soft">gratuit, sans engagement</p>

            <ul className="mt-6 space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 text-copper">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/auth"
              className="mt-8 block rounded-md border border-rule px-4 py-2.5 text-center text-sm font-medium transition hover:bg-paper-deep"
            >
              Commencer l&apos;essai gratuit
            </Link>
          </div>

          {/* Premium plan */}
          <div className="rounded-2xl border-2 border-copper bg-card p-8 shadow-[0_30px_60px_-30px_rgba(59,130,246,0.25)]">
            <span className="inline-block rounded-full border border-copper/40 bg-copper/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-copper-deep">
              particulier ⭐
            </span>
            <p className="mt-4 font-serif text-4xl">10 €</p>
            <p className="text-sm text-ink-soft">par mois, sans engagement</p>

            <ul className="mt-6 space-y-3">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 text-copper">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <a
              href={STRIPE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 block rounded-md bg-[#4361ee] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#3451d1]"
            >
              S&apos;abonner maintenant
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-soft">
          Paiement sécurisé par carte bancaire ou Mobile Money. Résiliation à tout moment.
        </p>
      </section>

      {/* FAQ */}
      <section className="border-t border-rule bg-card">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">
            questions fréquentes
          </p>
          <h2 className="mt-4 font-serif text-3xl">Avant de vous lancer.</h2>

          <div className="mt-10 grid gap-4">
            <FAQ
              q="Puis-je essayer avant de payer ?"
              a="Oui ! Les 3 premiers niveaux sont entièrement gratuits. Vous pouvez créer un compte et tester la méthode sans engagement. L'abonnement ne sera requis que pour accéder aux niveaux 4 à 100."
            />
            <FAQ
              q="Combien de temps faut-il pour apprendre ?"
              a="Avec 10 minutes par jour, comptez environ 3 mois pour atteindre le niveau Bronze (30 niveaux). La régularité est plus importante que la durée de chaque séance."
            />
            <FAQ
              q="Puis-je utiliser mon compte sur plusieurs ordinateurs ?"
              a="Votre abonnement est personnel et limité à 2 appareils simultanés maximum. Si une connexion est détectée sur un 3ème appareil, la session la plus ancienne sera déconnectée."
            />
            <FAQ
              q="Comment obtenir une certification ?"
              a="Après avoir validé les niveaux requis, passez l'examen de certification chronométré. L'examen évalue votre vitesse (MPM) et votre précision. En cas de réussite, un certificat téléchargeable vous est délivré."
            />
            <FAQ
              q="Quels moyens de paiement acceptez-vous ?"
              a="Carte bancaire (Visa, Mastercard) et Mobile Money. Tous les paiements sont sécurisés et sans engagement — vous pouvez annuler à tout moment."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-rule bg-[#1a1a1a]">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl md:text-5xl">
            Prêt à ne plus jamais regarder votre clavier ?
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/auth"
              className="rounded-md bg-[#4361ee] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#3451d1]"
            >
              Essai gratuit — 3 niveaux offerts
            </Link>
            <a
              href={STRIPE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-white/20 px-6 py-3 text-sm font-medium text-foreground transition hover:bg-white/5"
            >
              S&apos;abonner — 10 €/mois
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}


function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border border-rule bg-paper-deep">
      <summary className="flex cursor-pointer items-center justify-between p-5 text-sm font-medium transition hover:bg-card">
        <span>{q}</span>
        <span className="ml-4 text-ink-soft transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="border-t border-rule px-5 pb-5 pt-3 text-sm text-ink-soft">
        {a}
      </div>
    </details>
  );
}
