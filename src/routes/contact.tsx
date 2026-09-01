import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Méthode des 10 Doigts" },
      { name: "description", content: "Une question, un partenariat, un devis école ? Écrivez-nous, nous répondons sous 48h." },
      { property: "og:title", content: "Contact — Méthode des 10 Doigts" },
      { property: "og:description", content: "Questions, partenariats, presse, ouverture d'un compte école." },
      { property: "og:url", content: "https://les10doigts.com/contact" },
    ],
    links: [{ rel: "canonical", href: "https://les10doigts.com/contact" }],
  }),
  component: Page,
});

const CONTACT_EMAIL = "contact@les10doigts.com";

function Page() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact — ${name}`);
    const body = encodeURIComponent(`${msg}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto grid max-w-4xl gap-10 px-6 pb-16 pt-6 md:pt-12 md:grid-cols-[1.1fr_1fr] animate-fade-in">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">contact</p>
          <h1 className="mt-4 font-serif text-4xl md:text-5xl">Parlons de votre projet.</h1>
          <p className="mt-4 text-ink-soft">
            Question sur la méthode, partenariat, ouverture d&apos;un compte
            école, presse : nous répondons sous 48h.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            <li>
              <span className="font-mono text-xs uppercase tracking-wider text-ink-soft">Email</span>
              <p className="mt-1">{CONTACT_EMAIL}</p>
            </li>
            <li>
              <span className="font-mono text-xs uppercase tracking-wider text-ink-soft">Écoles</span>
              <p className="mt-1">Ouvrir un compte école depuis la page dédiée.</p>
            </li>
          </ul>
        </div>

        {sent ? (
          /* ── Success confirmation ── */
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-rule bg-card p-10 text-center animate-fade-in">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl">Message envoyé !</h2>
            <p className="text-sm text-ink-soft max-w-xs">
              Votre client mail s&apos;est ouvert avec le message pré-rempli.
              Si ce n&apos;est pas le cas, envoyez-nous un mail directement à :
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-copper hover:text-copper-deep underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>
            <button
              onClick={() => { setSent(false); setName(""); setEmail(""); setMsg(""); }}
              className="mt-4 rounded-md border border-rule px-4 py-2 text-sm transition hover:bg-paper-deep"
            >
              Envoyer un autre message
            </button>
          </div>
        ) : (
          /* ── Contact form ── */
          <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-rule bg-card p-6">
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink-soft">Nom</span>
              <input
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md border border-rule bg-paper px-3 py-2"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink-soft">Email</span>
              <input
                required
                type="email"
                maxLength={200}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md border border-rule bg-paper px-3 py-2"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink-soft">Message</span>
              <textarea
                required
                maxLength={1500}
                rows={5}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                className="rounded-md border border-rule bg-paper px-3 py-2"
              />
            </label>
            <button
              type="submit"
              aria-label="Envoyer le message"
              className="rounded-md bg-copper px-4 py-2.5 text-sm font-medium text-white transition hover:bg-copper-deep"
            >
              Envoyer
            </button>
          </form>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
