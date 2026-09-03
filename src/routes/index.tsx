import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KeyboardFR, FINGER_LEGEND } from "@/components/KeyboardFR";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

const OG_IMAGE = "https://les10doigts.com/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Méthode des 10 Doigts — écrire les yeux fermés" },
      {
        name: "description",
        content:
          "La saisie n'est pas un talent, c'est une méthode. Parcours en 100 niveaux pour les écoles (primaire, secondaire) et les particuliers (pros, autodidactes).",
      },
      { property: "og:title", content: "Méthode des 10 Doigts — écrire les yeux fermés" },
      {
        property: "og:description",
        content: "Écrivez les yeux fermés. Une méthode progressive, mesurable, certifiante en 100 niveaux.",
      },
      { property: "og:url", content: "https://les10doigts.com/" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: "https://les10doigts.com/" }],
  }),
  component: Landing,
});


const PHRASE = "la saisie n'est pas un talent, c'est une méthode.";

function Landing() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <Hero />
      <VideoSection />
      <Manifesto />
      <Audiences />
      <CTA />
      <SiteFooter />
    </main>
  );
}

function Hero() {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % (PHRASE.length + 30);
      setTyped(PHRASE.slice(0, Math.min(i, PHRASE.length)));
    }, 75);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#f5f7fb] pb-24 pt-12 md:pt-20">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#4361ee]">
          cahier d&apos;apprentissage, version 2026
        </p>
        <h1 className="mx-auto mt-6 max-w-4xl font-serif text-4xl leading-[1.1] text-[#1e3a5f] sm:text-5xl md:text-6xl lg:text-7xl">
          Apprenez à écrire{" "}
          <span className="relative inline-block">
            <span className="relative z-10">les yeux fermés</span>
            <span className="absolute bottom-1 left-0 -z-0 h-3 w-full bg-[#4361ee]/10 md:bottom-2 md:h-4" />
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#5a7a9a]">
          Une méthode progressive en 100 niveaux, du repos des doigts sur ASDF aux textes professionnels.
          Pensée pour les classes et pour celles et ceux qui veulent enfin lâcher le clavier des yeux.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/auth"
            className="rounded-full bg-[#4361ee] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4361ee]/25 transition hover:-translate-y-0.5 hover:bg-[#3451d1] hover:shadow-xl hover:shadow-[#4361ee]/30"
          >
            Commencer le test de positionnement
          </Link>
          <Link
            to="/methode"
            className="rounded-full border-2 border-[#1e3a5f]/15 px-7 py-3.5 text-sm font-semibold text-[#1e3a5f] transition hover:-translate-y-0.5 hover:border-[#4361ee]/30 hover:text-[#4361ee]"
          >
            Voir la méthode
          </Link>
        </div>
      </div>

      {/* Keyboard card with glow */}
      <div className="mx-auto mt-16 max-w-5xl px-6">
        <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_25px_60px_-15px_rgba(30,58,95,0.12)]">
          <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-[#f8fafc] px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-[#5a7a9a]">
            <span>leçon 01 · rangée de repos</span>
            <span>MPM 32 · précision 98%</span>
          </div>
          <div className="px-6 py-10 font-mono text-2xl leading-relaxed text-[#b0bec5] md:text-3xl text-center">
            <span className="text-[#1e3a5f]">{typed}</span>
            <span className="ml-0.5 inline-block h-7 w-[2px] translate-y-1 animate-pulse bg-[#4361ee]" />
            <span>{PHRASE.slice(typed.length)}</span>
          </div>
          <KeyboardPreview />
        </div>
      </div>
    </section>
  );
}

function KeyboardPreview() {
  return (
    <div className="border-t border-[#e2e8f0] bg-gradient-to-b from-[#f0f4f8] to-[#e8edf3] px-6 py-8">
      <div className="flex justify-center">
        <KeyboardFR size="sm" showHands={false} />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5a7a9a]">
        {FINGER_LEGEND.map((l) => (
          <span key={l.label} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm border border-[#d0d5dd]" style={{ backgroundColor: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function VideoSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#4361ee]">
          comment ça marche
        </p>
        <h2 className="mt-4 font-serif text-3xl text-[#1e3a5f] md:text-4xl">
          Découvrez la méthode en vidéo
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[#5a7a9a]">
          Deux minutes pour comprendre comment passer d&apos;une saisie lente
          à une frappe rapide et précise, sans regarder le clavier.
        </p>

        <div className="mx-auto mt-10 aspect-video max-w-3xl overflow-hidden rounded-2xl border border-[#e2e8f0] shadow-[0_25px_60px_-15px_rgba(30,58,95,0.15)]">
          <iframe
            src="https://www.youtube.com/embed/2zX_D3feycI?rel=0&modestbranding=1"
            title="Présentation de la Méthode des 10 Doigts"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-6 text-left sm:grid-cols-3">
          {[
            { icon: "🖐️", step: "01", title: "Positionnez", desc: "Placez vos doigts sur QSDF et JKLM, la rangée de repos." },
            { icon: "⌨️", step: "02", title: "Tapez", desc: "Suivez le texte à l'écran sans regarder le clavier. 10 minutes par jour." },
            { icon: "🏅", step: "03", title: "Certifiez", desc: "Passez les 100 niveaux et décrochez vos certifications Bronze, Argent, Or." },
          ].map((s, i) => (
            <div
              key={s.title}
              className="group rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#4361ee]/8"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#4361ee]/10 text-lg">{s.icon}</span>
              <p className="mt-4 font-mono text-xs text-[#4361ee]">étape {s.step}</p>
              <h3 className="mt-1 font-serif text-xl text-[#1e3a5f]">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5a7a9a]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Manifesto() {
  const lines = useMemo(
    () => [
      "La saisie n'est pas un talent, c'est une méthode.",
      "Tout ce que vous écrivez chaque jour peut se taper les yeux fermés.",
      "On ne mémorise pas un clavier, on l'apprend doigt par doigt.",
      "Dix minutes par jour suffisent à changer votre rapport à l'écrit.",
    ],
    [],
  );
  return (
    <section className="bg-[#f8fafc] py-24">
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-[#4361ee]">manifeste</p>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {lines.map((l, i) => (
            <div
              key={i}
              className="flex gap-5 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="font-serif text-4xl font-light text-[#4361ee]/30">{String(i + 1).padStart(2, "0")}</span>
              <p className="font-serif text-xl leading-snug text-[#1e3a5f] md:text-2xl">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Audiences() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#4361ee]">à qui s&apos;adresse la méthode</p>
        <h2 className="mt-4 font-serif text-3xl text-[#1e3a5f] md:text-5xl">Deux publics, une même rigueur.</h2>

        <div className="mt-14 grid gap-8 text-left md:grid-cols-2">
          <AudienceCard
            to="/ecoles"
            tag="Écoles"
            title="Classes du primaire et du secondaire"
            body="Un parcours structuré, sous le regard d'un enseignant. Création de classe, comptes élèves sans email obligatoire, suivi de cohorte."
            cta="Découvrir l'espace école"
          />
          <AudienceCard
            to="/particuliers"
            tag="Particuliers"
            title="Pros, étudiants, autodidactes"
            body="Vous écrivez tous les jours mais regardez encore le clavier ? Cette méthode est conçue pour vous faire passer le cap."
            cta="Découvrir l'offre particulier"
          />
        </div>
      </div>
    </section>
  );
}

function AudienceCard({
  to,
  tag,
  title,
  body,
  cta,
}: {
  to: "/ecoles" | "/particuliers";
  tag: string;
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-[#4361ee]/30 hover:shadow-lg hover:shadow-[#4361ee]/8"
    >
      <span className="inline-block rounded-full bg-[#4361ee]/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] font-semibold text-[#4361ee]">
        {tag}
      </span>
      <h3 className="mt-5 font-serif text-2xl text-[#1e3a5f] md:text-3xl">{title}</h3>
      <p className="mt-3 leading-relaxed text-[#5a7a9a]">{body}</p>
      <p className="mt-6 text-sm font-semibold text-[#4361ee] transition group-hover:translate-x-1">
        {cta} →
      </p>
    </Link>
  );
}

function CTA() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setLoggedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <section className="bg-[#1e3a5f] py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#4361ee]">commencer</p>
        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-3xl text-white md:text-5xl lg:text-6xl">
          Dix minutes aujourd&apos;hui, un clavier maîtrisé dans trois mois.
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {loggedIn ? (
            <>
              <Link
                to="/app/train"
                className="rounded-full bg-[#4361ee] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#4361ee]/30 transition hover:-translate-y-0.5 hover:bg-[#3451d1] hover:shadow-xl"
              >
                🚀 S&apos;entraîner maintenant
              </Link>
              <Link
                to="/app"
                className="rounded-full border-2 border-white/20 px-8 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/5"
              >
                Mon tableau de bord
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="rounded-full bg-[#4361ee] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[#4361ee]/30 transition hover:-translate-y-0.5 hover:bg-[#3451d1] hover:shadow-xl"
              >
                Créer un compte particulier
              </Link>
              <Link
                to="/auth/ecole"
                className="rounded-full border-2 border-white/20 px-8 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/5"
              >
                Ouvrir un compte école
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
