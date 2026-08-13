import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  progressFor,
  tierFor,
  TIER_COLOR,
  TIER_LABEL,
  TIER_RULES,
  type Attempt,
  type Tier,
} from "@/lib/certification";

export const Route = createFileRoute("/_authenticated/app/certification")({
  head: () => ({ meta: [{ title: "Certification, La Méthode des 10 Doigts" }] }),
  component: CertificationPage,
});

function CertificationPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    void (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [{ data: at }, { data: pr }] = await Promise.all([
        supabase
          .from("lesson_attempts")
          .select("level, mpm, accuracy")
          .eq("user_id", u.user.id),
        supabase.from("profiles").select("display_name").eq("id", u.user.id).maybeSingle(),
      ]);
      setAttempts((at as Attempt[] | null) ?? []);
      setName(pr?.display_name ?? "");
      setLoaded(true);
    })();
  }, []);

  const tier = tierFor(attempts);

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">
          certification
        </p>
        <h1 className="mt-2 font-serif text-3xl">Trois paliers, une méthode</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Chaque palier se valide en réussissant les niveaux requis avec la vitesse et la
          précision attendues. Pas de hasard, pas de chance : c&apos;est de la régularité.
        </p>
      </div>

      {loaded && (
        <div
          className="rounded-2xl border-2 bg-card p-8"
          style={{ borderColor: tier ? TIER_COLOR[tier] : "rgba(0,0,0,0.08)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                Palier obtenu
              </p>
              <p
                className="mt-2 font-serif text-4xl"
                style={{ color: tier ? TIER_COLOR[tier] : undefined }}
              >
                {tier ? TIER_LABEL[tier] : "Aucun palier"}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {tier
                  ? `Bravo ${name || ""}, continuez pour viser le palier supérieur.`
                  : "Validez les 25 premiers niveaux pour obtenir le Bronze."}
              </p>
            </div>
            <Medal tier={tier} />
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {(["bronze", "argent", "or"] as const).map((t) => {
          const rule = TIER_RULES[t];
          const p = progressFor(attempts, t);
          const pct = Math.round((p.done / p.total) * 100);
          return (
            <div key={t} className="rounded-2xl border border-rule bg-card p-6">
              <div className="flex items-center gap-3">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: TIER_COLOR[t] }}
                />
                <h2 className="font-serif text-2xl" style={{ color: TIER_COLOR[t] }}>
                  {TIER_LABEL[t]}
                </h2>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-ink-soft">
                <li>· {rule.levels} premiers niveaux validés</li>
                <li>· {rule.mpm} MPM minimum</li>
                <li>· {rule.accuracy}% de précision minimum</li>
              </ul>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-paper-deep">
                <div
                  className="h-full"
                  style={{ width: `${pct}%`, backgroundColor: TIER_COLOR[t] }}
                />
              </div>
              <p className="mt-2 font-mono text-xs text-ink-soft">
                {p.done}/{p.total} niveaux validés
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-rule bg-card p-6 text-sm text-ink-soft">
        <p>
          Astuce : un niveau est validé dès qu&apos;une de vos tentatives atteint les seuils
          d&apos;un palier. Visez la régularité plutôt que la vitesse pure.
        </p>
        <Link
          to="/app/train"
          className="mt-4 inline-block rounded-md bg-copper px-4 py-2 text-sm font-medium text-paper hover:bg-copper-deep"
        >
          Continuer l&apos;entraînement
        </Link>
      </div>
    </section>
  );
}

function Medal({ tier }: { tier: Tier }) {
  const color = tier ? TIER_COLOR[tier] : "#d6d3cf";
  const letter = tier ? TIER_LABEL[tier][0] : "–";
  return (
    <div
      className="grid h-24 w-24 place-items-center rounded-full font-serif text-3xl text-paper shadow-inner"
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {letter}
    </div>
  );
}
