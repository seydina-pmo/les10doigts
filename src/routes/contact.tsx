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


function Page() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact — ${name}`);
    const body = encodeURIComponent(`${msg}\n\n— ${name} (${email})`);
    window.location.href = `mailto:contact@les10doigts.com?subject=${subject}&body=${body}`;
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
              <p className="mt-1">contact@les10doigts.com</p>
            </li>
            <li>
              <span className="font-mono text-xs uppercase tracking-wider text-ink-soft">Écoles</span>
              <p className="mt-1">Ouvrir un compte école depuis la page dédiée.</p>
            </li>
          </ul>
        </div>

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

          {sent && (
            <p className="text-xs text-ink-soft">
              Votre client mail s&apos;est ouvert. Sinon, écrivez-nous directement à contact@les10doigts.com.
            </p>
          )}
        </form>
      </section>
      <SiteFooter />
    </main>
  );
}
