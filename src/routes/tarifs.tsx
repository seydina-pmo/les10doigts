import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs — Méthode des 10 Doigts" },
      { name: "description", content: "Découverte gratuite, abonnement particulier, licence école — tarifs en euros." },
      { property: "og:title", content: "Tarifs — Méthode des 10 Doigts" },
      { property: "og:description", content: "Trois formules : Découverte gratuite, Particulier, Licence école." },
      { property: "og:url", content: "https://les10doigts.com/tarifs" },
    ],
    links: [{ rel: "canonical", href: "https://les10doigts.com/tarifs" }],
  }),
  component: Page,
});


const plans: { name: string; price: string; note: string; bullets: string[]; cta: string; to?: string; href?: string; featured?: boolean }[] = [
  {
    name: "Découverte",
    price: "Gratuit",
    note: "3 premiers niveaux",
    bullets: ["Test de positionnement", "Clavier coloré par doigt", "Statistiques de base"],
    cta: "Commencer",
    to: "/auth" as const,
  },
  {
    name: "Particulier",
    price: "10 €",
    note: "par mois",
    bullets: [
      "100 niveaux, 10 paliers",
      "Heatmap des touches fragiles",
      "Certifications Bronze · Argent · Or",
    ],
    cta: "S'abonner",
    href: "https://buy.stripe.com/test_14A7sE0q95agd2kbJW8N200",
    featured: true,
  },
  {
    name: "École",
    price: "115 €",
    note: "par mois · classes et élèves illimités",
    bullets: [
      "Comptes formateurs et élèves créés par l'école",
      "Aucun email d'élève requis (identifiants imprimables)",
      "Suivi de cohorte, exports PDF et CSV",
      "1 150 € / an (soit 2 mois offerts)",
    ],
    cta: "Ouvrir un compte école",
    to: "/auth/ecole" as const,
  },
];


function Page() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-6 md:pt-12 animate-fade-in">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">tarifs</p>
        <h1 className="mt-4 font-serif text-4xl md:text-6xl">Simple, honnête, sans engagement.</h1>
        <p className="mt-4 text-sm text-ink-soft">Tarifs en euros, hors taxes.</p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-20 md:grid-cols-3">
        {plans.map((p, i) => (
          <article
            key={p.name}
            className={
              "rounded-2xl border bg-card p-7 transition-transform hover:-translate-y-1 animate-fade-in " +
              (p.featured ? "border-copper shadow-[0_30px_60px_-30px_rgba(59,130,246,0.35)]" : "border-rule")
            }
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-copper-deep">{p.name}</p>
            <p className="mt-3 font-serif text-4xl">{p.price}</p>
            <p className="text-sm text-ink-soft">{p.note}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {p.bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
                  {b}
                </li>
              ))}
            </ul>
            {p.href ? (
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  "mt-8 inline-block w-full rounded-md px-4 py-2.5 text-center text-sm font-medium transition " +
                  (p.featured
                    ? "bg-copper text-paper hover:bg-copper-deep"
                    : "border border-rule hover:bg-paper-deep")
                }
              >
                {p.cta}
              </a>
            ) : (
              <Link
                to={p.to!}
                className={
                  "mt-8 inline-block w-full rounded-md px-4 py-2.5 text-center text-sm font-medium transition " +
                  (p.featured
                    ? "bg-copper text-paper hover:bg-copper-deep"
                    : "border border-rule hover:bg-paper-deep")
                }
              >
                {p.cta}
              </Link>
            )}
          </article>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
