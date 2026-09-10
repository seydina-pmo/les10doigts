import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/methode", label: "La méthode" },
  { to: "/ecoles", label: "Écoles" },
  { to: "/particuliers", label: "Particuliers" },
  { to: "/tarifs", label: "Tarifs" },
  { to: "/guide", label: "Guide" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setLoggedIn(!!s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e2e8f0]/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src="/favicon.png" alt="" className="h-10 w-10 rounded-lg" />
          <span className="font-serif text-xl font-medium text-[#1e3a5f]">
            Les <span className="text-[#4361ee]">10</span> Doigts
          </span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{
                className:
                  "rounded-full bg-[#4361ee] px-4 py-1.5 text-white font-medium transition",
              }}
              inactiveProps={{
                className:
                  "rounded-full px-4 py-1.5 text-[#5a7a9a] transition hover:bg-[#f1f5f9] hover:text-[#1e3a5f]",
              }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          to={loggedIn ? "/app" : "/auth"}
          className="rounded-full bg-[#4361ee] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#4361ee]/20 transition hover:-translate-y-0.5 hover:bg-[#3451d1] hover:shadow-md"
        >
          {loggedIn ? "Mon espace" : "Essayer"}
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e2e8f0] bg-[#f8fafc]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Trust numbers */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
          {[
            { n: "1 247", label: "apprenants formés" },
            { n: "230+", label: "écoles partenaires" },
            { n: "98%", label: "taux de satisfaction" },
            { n: "100", label: "niveaux progressifs" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-serif text-2xl font-bold text-[#4361ee]">{s.n}</p>
              <p className="mt-1 text-xs text-[#5a7a9a]">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6 text-sm text-[#5a7a9a] md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/favicon.png" alt="" className="h-8 w-8 rounded-lg" />
            <span className="font-serif text-base text-[#1e3a5f]">
              Les <span className="text-[#4361ee]">10</span> Doigts
            </span>
          </Link>

          <nav className="flex flex-wrap gap-4 text-xs">
            <Link to="/ecoles" className="hover:text-[#1e3a5f] transition">Écoles</Link>
            <Link to="/particuliers" className="hover:text-[#1e3a5f] transition">Particuliers</Link>
            <Link to="/tarifs" className="hover:text-[#1e3a5f] transition">Tarifs</Link>
            <Link to="/contact" className="hover:text-[#1e3a5f] transition">Contact</Link>
            <Link to="/confidentialite" className="hover:text-[#1e3a5f] transition">Confidentialité</Link>
            <Link to="/conditions" className="hover:text-[#1e3a5f] transition">Conditions d&apos;utilisation</Link>
          </nav>

          <p className="text-xs">&copy; 2026, tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
