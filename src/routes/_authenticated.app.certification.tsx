import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  bestPerLevel,
  progressFor,
  tierFor,
  weakLevelsFor,
  nextTierTarget,
  TIER_COLOR,
  TIER_LABEL,
  TIER_ICON,
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
  const best = bestPerLevel(attempts);
  const target = nextTierTarget(attempts);
  const targetRule = TIER_RULES[target];
  const weak = weakLevelsFor(attempts, target);
  const avgMpm = best.size === 0 ? 0 : Math.round([...best.values()].reduce((s, a) => s + a.mpm, 0) / best.size);
  const avgAcc = best.size === 0 ? 0 : Math.round([...best.values()].reduce((s, a) => s + a.accuracy, 0) / best.size);

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">
          certification
        </p>
        <h1 className="mt-2 font-serif text-3xl">Votre bilan de maîtrise</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          La certification ne se donne pas. Elle se mérite par la régularité, la précision et la vitesse.
          Chaque palier exige que <strong>chaque niveau</strong> atteigne les seuils requis — sans exception.
        </p>
      </div>

      {loaded && (
        <>
          {/* Current tier banner */}
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
                  {tier ? `${TIER_ICON[tier]} ${TIER_LABEL[tier]}` : "Aucun palier"}
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  {tier === "or"
                    ? `Félicitations ${name || ""}! Vous êtes un maître du clavier. 🎉`
                    : tier
                      ? `Bravo ${name || ""}! Visez maintenant le ${TIER_LABEL[target]}.`
                      : `Validez les ${TIER_RULES.bronze.levels} premiers niveaux pour obtenir le Bronze.`}
                </p>
              </div>
              <Medal tier={tier} />
            </div>
          </div>

          {/* Global stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Niveaux travaillés" value={`${best.size} / 100`} />
            <StatCard label="Vitesse moyenne" value={`${avgMpm} MPM`} accent={avgMpm >= targetRule.avgMpm} />
            <StatCard label="Précision moyenne" value={`${avgAcc}%`} accent={avgAcc >= targetRule.accuracy} />
          </div>

          {/* 3 tiers progress */}
          <div className="grid gap-5 lg:grid-cols-3">
            {(["bronze", "argent", "or"] as const).map((t) => {
              const rule = TIER_RULES[t];
              const p = progressFor(attempts, t);
              const pct = Math.round((p.done / p.total) * 100);
              const achieved = (tier === t) || (tier === "argent" && t === "bronze") || (tier === "or");
              return (
                <div key={t} className={"rounded-2xl border bg-card p-6 " + (achieved ? "border-2" : "border-rule")} style={achieved ? { borderColor: TIER_COLOR[t] } : undefined}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: TIER_COLOR[t] }}
                      />
                      <h2 className="font-serif text-2xl" style={{ color: TIER_COLOR[t] }}>
                        {TIER_ICON[t]} {TIER_LABEL[t]}
                      </h2>
                    </div>
                    {achieved && (
                      <span className="rounded-full bg-[#ecfdf5] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#10b981]">
                        ✓ obtenu
                      </span>
                    )}
                  </div>
                  <ul className="mt-4 space-y-1 text-sm text-ink-soft">
                    <li>· {rule.levels} niveaux validés</li>
                    <li>· ≥ {rule.mpm} MPM par niveau</li>
                    <li>· ≥ {rule.accuracy}% précision par niveau</li>
                    <li>· ≥ {rule.avgMpm} MPM de moyenne globale</li>
                  </ul>
                  <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-paper-deep">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: TIER_COLOR[t] }}
                    />
                  </div>
                  <p className="mt-2 font-mono text-xs text-ink-soft">
                    {p.done}/{p.total} niveaux validés ({pct}%)
                  </p>
                </div>
              );
            })}
          </div>

          {/* Weak levels to improve */}
          {weak.length > 0 && tier !== "or" && (
            <div className="rounded-2xl border border-rule bg-card p-6">
              <h2 className="font-serif text-xl">
                📋 Niveaux à retravailler pour le {TIER_LABEL[target]}
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                {weak.length} niveau{weak.length > 1 ? "x" : ""} ne{weak.length > 1 ? " " : " "}
                {weak.length > 1 ? "remplissent" : "remplit"} pas encore les exigences.
                Retravaillez-les pour valider votre certification.
              </p>
              <div className="mt-4 max-h-[320px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
                    <tr>
                      <th className="py-2 text-left">Niveau</th>
                      <th className="text-right">Votre MPM</th>
                      <th className="text-right">Requis</th>
                      <th className="text-right">Votre précision</th>
                      <th className="text-right">Requise</th>
                      <th className="text-center">Problème</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weak.slice(0, 30).map((w) => (
                      <tr key={w.level} className="border-t border-rule/60">
                        <td className="py-2">
                          <Link
                            to="/app/train"
                            search={{ level: w.level }}
                            className="text-copper-deep underline-offset-4 hover:underline"
                          >
                            Niveau {w.level}
                          </Link>
                        </td>
                        <td className={"text-right " + (w.needsMpm ? "text-destructive font-medium" : "text-foreground")}>
                          {w.mpm || "—"}
                        </td>
                        <td className="text-right text-ink-soft">≥ {targetRule.mpm}</td>
                        <td className={"text-right " + (w.needsAcc ? "text-destructive font-medium" : "text-foreground")}>
                          {w.accuracy ? `${w.accuracy}%` : "—"}
                        </td>
                        <td className="text-right text-ink-soft">≥ {targetRule.accuracy}%</td>
                        <td className="text-center">
                          {w.mpm === 0 ? "🚫 Pas tenté" : w.needsMpm && w.needsAcc ? "⚡ + 🎯" : w.needsMpm ? "⚡ Vitesse" : "🎯 Précision"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {weak.length > 30 && (
                  <p className="mt-2 text-center text-xs text-ink-soft">
                    … et {weak.length - 30} autre(s) niveau(x)
                  </p>
                )}
              </div>
              <Link
                to="/app/train"
                search={{}}
                className="mt-6 inline-block rounded-md bg-copper px-5 py-2.5 text-sm font-medium text-paper transition hover:-translate-y-0.5 hover:bg-copper-deep"
              >
                🔁 Reprendre l'entraînement
              </Link>
            </div>
          )}

          {/* Gold achieved — congratulations */}
          {tier === "or" && (
            <div className="rounded-2xl border-2 border-[#c9a227] bg-gradient-to-br from-[#fdf7e4] to-[#fef9ec] p-8 text-center">
              <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-[#c9a227] text-4xl text-white shadow-lg">
                🏆
              </div>
              <h2 className="font-serif text-3xl text-[#8a6d1b]">Maître du clavier !</h2>
              <p className="mt-2 text-[#a88a2f]">
                {name || "Vous"} avez atteint l'excellence. 100 niveaux maîtrisés avec vitesse et précision.
                Votre certificat Or est mérité.
              </p>
              <Link
                to="/app/exam"
                className="mt-6 inline-block rounded-md bg-[#c9a227] px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#a88a2f]"
              >
                🎓 Passer l'examen final
              </Link>
            </div>
          )}

          {/* Tips */}
          {tier !== "or" && (
            <div className="rounded-2xl border border-rule bg-card p-6 text-sm text-ink-soft">
              <h3 className="font-serif text-base text-foreground mb-2">💡 Conseils pour progresser</h3>
              <ul className="space-y-1.5">
                <li>· <strong>Régularité</strong> : 10 min par jour valent mieux qu'une heure le weekend.</li>
                <li>· <strong>Précision d'abord</strong> : tapez lentement mais sans erreur. La vitesse viendra.</li>
                <li>· <strong>Ne regardez pas</strong> : gardez les yeux sur l'écran, pas sur le clavier.</li>
                <li>· <strong>Retravaillez</strong> : les niveaux en rouge ci-dessus sont vos priorités.</li>
              </ul>
            </div>
          )}
        </>
      )}

      {!loaded && (
        <div className="grid min-h-[200px] place-items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e2e8f0] border-t-copper" />
        </div>
      )}
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

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-rule bg-card p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">{label}</p>
      <p className={"mt-2 font-serif text-3xl " + (accent ? "text-[#10b981]" : "text-foreground")}>{value}</p>
    </div>
  );
}
