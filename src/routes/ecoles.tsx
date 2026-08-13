import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const Route = createFileRoute("/ecoles")({
  head: () => ({
    meta: [
      { title: "Écoles — ouvrir un compte établissement" },
      {
        name: "description",
        content:
          "L'établissement s'abonne, puis crée les comptes formateurs et élèves depuis son espace dédié. Aucun email d'élève requis.",
      },
      { property: "og:title", content: "La Méthode des 10 Doigts pour les écoles" },
      {
        property: "og:description",
        content: "Comptes classe et élèves sans email, suivi de cohorte, licence établissement.",
      },
      { property: "og:url", content: "https://les10doigts.com/ecoles" },
    ],
    links: [{ rel: "canonical", href: "https://les10doigts.com/ecoles" }],
  }),
  component: Page,
});


const steps = [
  {
    n: "01",
    t: "L'école soumet une demande d'ouverture",
    d: "Nom de l'établissement, nombre de classes et d'élèves, responsable. Aucun compte n'est encore créé à ce stade.",
  },
  {
    n: "02",
    t: "Nous validons et activons le compte école",
    d: "Après paiement de l'abonnement annuel, nous activons le compte et transmettons les identifiants du responsable d'établissement.",
  },
  {
    n: "03",
    t: "L'école crée les comptes formateurs",
    d: "Depuis l'espace école, le responsable ajoute chaque enseignant·e. Aucune inscription publique de formateur n'est possible.",
  },
  {
    n: "04",
    t: "Les formateurs créent leurs élèves",
    d: "Chaque enseignant·e génère les comptes de ses élèves : identifiant + mot de passe imprimable. Aucun email d'élève requis.",
  },
];

function Page() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pb-12 pt-6 md:pt-12 animate-fade-in">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">écoles</p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl md:text-6xl">
          Un compte par établissement. Vous gardez la main.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-soft">
          Pas d&apos;inscription publique de formateurs ni d&apos;élèves : l&apos;école
          s&apos;abonne, puis crée ses propres comptes depuis son espace. Zéro
          collecte d&apos;email d&apos;élève.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/auth/ecole"
            className="rounded-md bg-copper px-5 py-3 text-sm font-medium text-paper transition hover:bg-copper-deep"
          >
            Ouvrir un compte école
          </Link>
          <Link
            to="/contact"
            className="rounded-md border border-rule bg-card px-5 py-3 text-sm font-medium transition hover:bg-paper-deep"
          >
            Nous contacter
          </Link>
        </div>
      </section>

      <section className="mx-6 grid gap-px overflow-hidden rounded-xl border border-rule bg-rule md:mx-auto md:max-w-6xl md:grid-cols-2">
        {steps.map((s, i) => (
          <article
            key={s.n}
            className="bg-card p-7 animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="font-serif text-3xl text-copper">{s.n}</span>
            <h3 className="mt-3 font-serif text-xl">{s.t}</h3>
            <p className="mt-2 text-sm text-ink-soft">{s.d}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-2xl border border-rule bg-card p-8">
          <h2 className="font-serif text-2xl md:text-3xl">Vous êtes enseignant·e à titre individuel ?</h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Sans compte école, vous ne pouvez pas créer de classe sur la
            plateforme : les classes appartiennent à un établissement abonné.
            Parlez-en à votre direction, ou soumettez la demande vous-même
            depuis le bouton ci-dessus.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
