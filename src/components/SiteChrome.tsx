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
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-[#5a7a9a] md:flex-row md:items-center md:justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/favicon.png" alt="" className="h-8 w-8 rounded-lg" />
          <span className="font-serif text-base text-[#1e3a5f]">
            Les <span className="text-[#4361ee]">10</span> Doigts
          </span>
        </Link>
        <p>© 2026, tous droits réservés.</p>
      </div>
    </footer>
  );
}
