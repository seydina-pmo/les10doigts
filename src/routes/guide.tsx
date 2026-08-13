import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Guide utilisateur — Méthode des 10 Doigts" },
      {
        name: "description",
        content:
          "Apprenez à utiliser la Méthode des 10 Doigts : position des doigts, exercices, statistiques et certification.",
      },
    ],
    links: [{ rel: "canonical", href: "https://les10doigts.com/guide" }],
  }),
  component: GuidePage,
});


const sections = [
  {
    id: "position",
    number: "01",
    icon: "🖐️",
    title: "Position des doigts",
    content: [
      "Chaque doigt a des touches attitrées. La rangée de repos est votre point de départ :",
      "Main gauche : Q (auriculaire), S (annulaire), D (majeur), F (index)",
      "Main droite : J (index), K (majeur), L (annulaire), M (auriculaire)",
      "Les pouces se partagent la barre d'espace",
      "Vos doigts doivent toujours revenir sur ces touches entre chaque frappe. C'est la base de la dactylographie.",
    ],
  },
  {
    id: "exercice",
    number: "02",
    icon: "⌨️",
    title: "Démarrer un exercice",
    content: [
      "Connectez-vous et cliquez sur « S'entraîner » dans le menu",
      "Un texte apparaît à l'écran avec un clavier coloré en dessous",
      "Placez vos doigts sur la rangée de repos (QSDF / JKLM)",
      "Tapez la première lettre pour lancer l'exercice : le chronomètre démarre",
      "Tapez chaque caractère sans regarder le clavier. Les erreurs sont surlignées en rouge",
      "À la fin du texte, vos résultats s'affichent (vitesse MPM et précision %)",
      "Astuce : utilisez le Mode Focus (bouton plein écran) pour vous concentrer sans distraction.",
    ],
  },
  {
    id: "stats",
    number: "03",
    icon: "📊",
    title: "Comprendre vos statistiques",
    content: [
      "MPM (Mots Par Minute) : mesure votre vitesse de frappe. Un mot = 5 caractères",
      "Précision (%) : ratio entre frappes correctes et totales. Visez 95% minimum",
      "Heatmap des erreurs : le tableau de bord montre les touches qui vous posent problème",
      "Niveaux validés : un niveau est validé quand vous atteignez les seuils de vitesse ET de précision",
      "Conseil : privilégiez la précision à la vitesse. La vitesse viendra naturellement avec la pratique.",
    ],
  },
  {
    id: "certification",
    number: "04",
    icon: "🏅",
    title: "Le système de certification",
    content: [
      "Trois paliers de certification, du plus accessible au plus exigeant :",
      "",
      "🥉 Bronze : 30 niveaux validés, 22 MPM minimum, 94% de précision",
      "🥈 Argent : 70 niveaux validés, 38 MPM minimum, 96% de précision",
      "🥇 Or : 100 niveaux validés, 55 MPM minimum, 98% de précision",
      "",
      "Un examen final est requis pour obtenir chaque certification. L'examen teste votre vitesse et votre précision sur un texte plus long, en conditions chronométrées.",
    ],
  },
  {
    id: "conseils",
    number: "05",
    icon: "💡",
    title: "Conseils pour progresser",
    content: [
      "Régularité : 10 minutes par jour valent mieux qu'une heure le week-end",
      "Ne regardez pas le clavier : c'est la règle n°1. Acceptez les erreurs au début",
      "Travaillez vos points faibles : la heatmap du tableau de bord montre vos touches fragiles",
      "Position correcte : dos droit, poignets au niveau du clavier, coudes à 90°",
      "Pauses : faites une pause toutes les 20 minutes pour reposer vos yeux et vos doigts",
      "Patience : la dactylographie s'apprend en semaines, pas en jours. Chaque séance compte.",
    ],
  },
];


function GuidePage() {
  function buildGuideHTML() {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Guide utilisateur — Les 10 Doigts</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; max-width: 750px; margin: 0 auto; padding: 48px 28px; color: #1a1a2e; line-height: 1.8; position: relative; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 200px; font-family: Georgia, serif; color: rgba(67, 97, 238, 0.04); font-weight: bold; z-index: 0; pointer-events: none; user-select: none; }
    .content { position: relative; z-index: 1; }
    .header { text-align: center; padding-bottom: 32px; border-bottom: 3px solid #4361ee; margin-bottom: 40px; }
    .header .logo { font-family: Georgia, serif; font-size: 48px; color: #1e3a5f; font-weight: bold; }
    .header .logo span { color: #4361ee; }
    .header h1 { font-size: 28px; color: #1e3a5f; margin-top: 8px; }
    .header p { color: #5a7a9a; font-size: 13px; margin-top: 4px; }
    .section { margin-bottom: 28px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fafbfc; page-break-inside: avoid; }
    .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
    .section-num { font-size: 24px; color: #4361ee; opacity: 0.35; font-weight: bold; font-family: Georgia, serif; }
    .section-icon { font-size: 22px; }
    .section h2 { font-size: 18px; color: #1e3a5f; font-family: Georgia, serif; }
    .section p { margin-bottom: 8px; font-size: 13.5px; color: #334155; }
    .section p:empty { height: 6px; }
    .footer { margin-top: 48px; padding-top: 20px; border-top: 3px solid #4361ee; text-align: center; font-size: 11px; color: #94a3b8; }
    .footer .brand { font-family: Georgia, serif; font-size: 14px; color: #1e3a5f; margin-bottom: 4px; }
    @media print { .watermark { position: fixed; } @page { margin: 2cm; } }
  </style>
</head>
<body>
  <div class="watermark">10</div>
  <div class="content">
    <div class="header">
      <div class="logo">Les <span>10</span> Doigts</div>
      <h1>Guide Utilisateur</h1>
      <p>La méthode pour apprendre à écrire les yeux fermés</p>
      <p style="margin-top:8px;font-size:11px;">les10doigts.com</p>
    </div>
    ${sections.map(s => `
    <div class="section">
      <div class="section-header">
        <span class="section-num">${s.number}</span>
        <span class="section-icon">${s.icon}</span>
        <h2>${s.title}</h2>
      </div>
      ${s.content.map(line => line ? `<p>${line}</p>` : '<p></p>').join('')}
    </div>
    `).join('')}
    <div class="footer">
      <p class="brand">Les <span style="color:#4361ee">10</span> Doigts</p>
      <p>© 2026 — les10doigts.com — Tous droits réservés</p>
      <p>Document généré le ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  </div>
</body>
</html>`;
  }

  function handlePrint() {
    const w = window.open('', '_blank');
    if (!w) return alert("Autorisez les popups pour imprimer le guide.");
    w.document.write(buildGuideHTML());
    w.document.close();
    setTimeout(() => { w.print(); }, 500);
  }

  function handleDownload() {
    const html = buildGuideHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guide-les-10-doigts.html';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-[#f5f7fb] pb-12 pt-12 md:pt-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#4361ee]">
                guide utilisateur
              </p>
              <h1 className="mt-4 font-serif text-4xl text-[#1e3a5f] md:text-5xl">
                Tout ce qu&apos;il faut savoir.
              </h1>
              <p className="mt-4 max-w-2xl text-[#5a7a9a]">
                Ce guide vous accompagne de la première leçon jusqu&apos;à la
                certification Or. Téléchargez-le ou lisez-le directement ici.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 print:hidden">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-full bg-[#4361ee] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#4361ee]/20 transition hover:-translate-y-0.5 hover:bg-[#3451d1] hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Télécharger le guide
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 rounded-full border-2 border-[#e2e8f0] px-6 py-3 text-sm font-semibold text-[#1e3a5f] transition hover:-translate-y-0.5 hover:border-[#4361ee]/30 hover:text-[#4361ee]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Imprimer
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20">
        {/* Table of contents */}
        <nav className="mb-12 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm print:hidden">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#4361ee]">
            sommaire
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-[#f1f5f9]"
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="font-medium text-[#1e3a5f]">{s.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content sections */}
        <div className="grid gap-8">
          {sections.map((s, i) => (
            <article
              key={s.id}
              id={s.id}
              className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition hover:shadow-md md:p-8"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4361ee]/10 text-2xl">
                  {s.icon}
                </span>
                <div>
                  <p className="font-mono text-xs text-[#4361ee]">section {s.number}</p>
                  <h2 className="font-serif text-2xl text-[#1e3a5f]">{s.title}</h2>
                </div>
              </div>
              <div className="mt-6 space-y-3 text-sm leading-relaxed text-[#334155]">
                {s.content.map((line, j) => (
                  <p key={j} className={line === "" ? "h-2" : ""}>
                    {line}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* CTA bottom */}
        <div className="mt-12 rounded-2xl bg-[#1e3a5f] p-10 text-center">
          <p className="font-serif text-2xl text-white md:text-3xl">Prêt à commencer ?</p>
          <p className="mt-3 text-[#94a3b8]">
            Dix minutes par jour pour transformer votre rapport au clavier.
          </p>
          <a
            href="/auth"
            className="mt-6 inline-block rounded-full bg-[#4361ee] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4361ee]/30 transition hover:-translate-y-0.5 hover:bg-[#3451d1]"
          >
            Créer mon compte
          </a>
        </div>
      </section>

      <SiteFooter />

      <style>{`
        @media print {
          header, footer, nav, .print\\:hidden { display: none !important; }
          body { background: white !important; background-image: none !important; }
          section { max-width: 100% !important; }
          article { break-inside: avoid; border: 1px solid #ddd !important; margin-bottom: 1rem; }
          @page { margin: 2cm; }
        }
      `}</style>
    </main>
  );
}
