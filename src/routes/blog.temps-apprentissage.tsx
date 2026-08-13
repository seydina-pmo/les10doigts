import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

const URL = "https://les10doigts.com/blog/temps-apprentissage";
const TITLE = "Combien de temps pour apprendre à taper au clavier ?";
const DESCRIPTION =
  "Guide complet sur la durée d'apprentissage de la dactylographie : 10 minutes par jour pendant 3 mois avec la méthode des 10 doigts, et les facteurs qui accélèrent ou ralentissent la progression.";

export const Route = createFileRoute("/blog/temps-apprentissage")({
  head: () => ({
    meta: [
      { title: "Combien de temps pour apprendre à taper au clavier — guide" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          inLanguage: "fr",
          author: { "@type": "Organization", name: "La Méthode des 10 Doigts" },
          publisher: { "@type": "Organization", name: "La Méthode des 10 Doigts" },
          mainEntityOfPage: URL,
        }),
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 pb-20 pt-10 md:pt-16 animate-fade-in">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">guide · dactylographie</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
          Combien de temps pour apprendre à taper au clavier ?
        </h1>
        <p className="mt-6 text-lg text-ink-soft">
          Réponse courte : environ <strong>trois mois</strong>, à raison de{" "}
          <strong>dix minutes par jour</strong>, pour taper à l&apos;aveugle avec la méthode
          des 10 doigts. Voici pourquoi, et comment aller plus vite ou éviter les blocages.
        </p>

        <h2 className="mt-12 font-serif text-2xl md:text-3xl">La réponse en une phrase</h2>
        <p className="mt-4 text-ink-soft">
          Avec un entraînement régulier de dix minutes par jour, un débutant atteint une
          frappe fluide sans regarder le clavier en 8 à 12 semaines, et une vitesse
          professionnelle (40 à 60 mots par minute) en 4 à 6 mois.
        </p>

        <h2 className="mt-12 font-serif text-2xl md:text-3xl">Ce qui compte, ce n&apos;est pas le total d&apos;heures</h2>
        <p className="mt-4 text-ink-soft">
          Une heure d&apos;affilée une fois par semaine est moins efficace que dix minutes
          chaque jour. La dactylographie est une compétence motrice : elle s&apos;installe
          par répétition espacée, pas par volume brut. C&apos;est pour cette raison que la
          méthode découpe l&apos;apprentissage en <strong>100 niveaux courts</strong>,
          jouables en une session quotidienne.
        </p>

        <h2 className="mt-12 font-serif text-2xl md:text-3xl">Le calendrier typique</h2>
        <ul className="mt-4 space-y-3 text-ink-soft">
          <li>
            <strong>Semaine 1–2</strong> — rangée de repos (ASDF / JKLM) et premiers
            enchaînements. La main gauche et la main droite retrouvent leurs positions
            sans les yeux.
          </li>
          <li>
            <strong>Semaine 3–5</strong> — rangées haute (AZERTYUIOP) et basse (WXCVBN).
            Les mots courants du français commencent à sortir tout seuls.
          </li>
          <li>
            <strong>Semaine 6–8</strong> — accents, majuscules, ponctuation et chiffres.
            La frappe à l&apos;aveugle devient l&apos;option par défaut.
          </li>
          <li>
            <strong>Semaine 9–12</strong> — phrases longues, textes professionnels, mise
            en régularité de la vitesse (30 à 45 mots par minute).
          </li>
        </ul>

        <h2 className="mt-12 font-serif text-2xl md:text-3xl">Les facteurs qui accélèrent la progression</h2>
        <ul className="mt-4 space-y-3 text-ink-soft">
          <li>
            <strong>La régularité</strong> — six sessions courtes valent mieux
            qu&apos;une session longue.
          </li>
          <li>
            <strong>Le respect des doigts</strong> — chaque touche a un doigt attitré ;
            tricher au début coûte des semaines à corriger ensuite.
          </li>
          <li>
            <strong>Le renoncement à regarder</strong> — c&apos;est la seule règle non
            négociable de la méthode. Les yeux restent sur l&apos;écran, même quand
            c&apos;est frustrant.
          </li>
          <li>
            <strong>Le suivi mesuré</strong> — précision, vitesse et régularité doivent
            être vues, sinon les défauts s&apos;installent.
          </li>
        </ul>

        <h2 className="mt-12 font-serif text-2xl md:text-3xl">Les facteurs qui ralentissent</h2>
        <ul className="mt-4 space-y-3 text-ink-soft">
          <li>Avoir déjà des habitudes à deux ou quatre doigts à défaire (ajoute 2 à 4 semaines).</li>
          <li>Sauter les paliers pour aller « plus vite ».</li>
          <li>Ne pas travailler les lettres et doigts faibles isolément.</li>
        </ul>

        <h2 className="mt-12 font-serif text-2xl md:text-3xl">Enfants et adolescents</h2>
        <p className="mt-4 text-ink-soft">
          En classe, la méthode s&apos;étale généralement sur une année scolaire à
          raison de deux séances par semaine. L&apos;objectif n&apos;est pas la vitesse
          maximale mais la <strong>frappe à l&apos;aveugle stabilisée</strong>, qui
          servira ensuite pour toute leur scolarité.
        </p>

        <h2 className="mt-12 font-serif text-2xl md:text-3xl">Prêt à commencer ?</h2>
        <p className="mt-4 text-ink-soft">
          Le test de positionnement dure 90 secondes et détermine votre point de départ
          exact dans les 100 niveaux.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/auth"
            className="rounded-md bg-copper px-5 py-3 text-sm font-medium text-paper transition hover:bg-copper-deep"
          >
            Faire le test de positionnement
          </Link>
          <Link
            to="/methode"
            className="rounded-md border border-rule bg-card px-5 py-3 text-sm font-medium text-foreground transition hover:bg-paper-deep"
          >
            Voir les 100 niveaux
          </Link>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
