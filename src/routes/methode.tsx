import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { KeyboardFR } from "@/components/KeyboardFR";

export const Route = createFileRoute("/methode")({
  head: () => ({
    meta: [
      { title: "La méthode — 100 niveaux pour taper sans regarder" },
      {
        name: "description",
        content:
          "Une progression en 10 paliers et 100 niveaux : doigt par doigt, lettre par lettre, jusqu'à la frappe à l'aveugle.",
      },
      { property: "og:title", content: "La méthode — 100 niveaux pour taper sans regarder" },
      {
        property: "og:description",
        content: "Précision, vitesse, régularité. Trois critères tenus en même temps, sur 100 niveaux.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://les10doigts.com/methode" },
    ],
    links: [{ rel: "canonical", href: "https://les10doigts.com/methode" }],
  }),
  component: Page,
});


const paliers = [
  { n: "01", t: "Fondations", d: "Position des doigts, rangée de repos ASDF / JKL;" },
  { n: "02", t: "Rangée haute", d: "AZERTYUIOP, enchaînements" },
  { n: "03", t: "Rangée basse", d: "WXCVBN et combinaisons" },
  { n: "04", t: "Chiffres", d: "Rangée numérique, ponctuation de base" },
  { n: "05", t: "Mots courants", d: "Digrammes et trigrammes du français" },
  { n: "06", t: "Phrases", d: "Majuscules, accentuation, rythme naturel" },
  { n: "07", t: "Ponctuation", d: "Accents, cédille, symboles AZERTY" },
  { n: "08", t: "Vitesse", d: "Objectifs de MPM croissants" },
  { n: "09", t: "Précision", d: "Tolérance zéro, correction à l'aveugle" },
  { n: "10", t: "Maîtrise", d: "Textes pros, préparation à la certification" },
];

function Page() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-6 md:pt-12 animate-fade-in">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">la méthode</p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl md:text-6xl">
          100 niveaux, 10 paliers, un seul cap : taper sans regarder.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-soft">
          Chaque niveau se valide sur trois critères tenus en même temps : précision supérieure à 95%,
          vitesse minimale du palier, et régularité de frappe (pas de pause au-delà de 3 secondes).
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <ol className="grid gap-px overflow-hidden rounded-xl border border-rule bg-rule md:grid-cols-2">
          {paliers.map((p, i) => (
            <li
              key={p.n}
              className="flex gap-6 bg-card p-6 transition hover:bg-paper-deep/40 animate-fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="font-serif text-4xl text-copper">{p.n}</span>
              <div>
                <h3 className="font-serif text-xl">{p.t}</h3>
                <p className="mt-1 text-sm text-ink-soft">{p.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-rule bg-paper-deep/40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">le clavier</p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              Un clavier coloré par doigt, pas par touche.
            </h2>
            <p className="mt-4 text-ink-soft">
              La mémoire musculaire s&apos;installe à la place de la mémoire visuelle.
              C&apos;est ce qui vous permet, plus tard, de fermer les yeux.
            </p>
            <Link
              to="/auth"
              className="mt-8 inline-block rounded-md bg-copper px-5 py-3 text-sm font-medium text-paper transition hover:bg-copper-deep"
            >
              Démarrer le test de positionnement
            </Link>
          </div>
          <div className="rounded-xl border border-rule bg-card p-6">
            <KeyboardFR size="sm" showHands />
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
