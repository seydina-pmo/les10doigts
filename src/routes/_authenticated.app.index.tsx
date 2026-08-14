import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { VoiceGuide } from "@/components/VoiceGuide";
import { bestPerLevel, progressFor, tierFor, TIER_LABEL, TIER_COLOR, type Attempt } from "@/lib/certification";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [{ title: "Tableau de bord, La Méthode des 10 Doigts" }] }),
  component: Dashboard,
});

type Row = Attempt & { created_at: string; key_errors: Record<string, number> };

function Dashboard() {
  const { user, isFirstVisit } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const { data } = await supabase
          .from("lesson_attempts")
          .select("level, mpm, accuracy, created_at, key_errors")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(500);
        setRows((data as Row[] | null) ?? []);
      } catch (err) {
        console.warn("[Dashboard] Failed to load attempts:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const best = bestPerLevel(rows);
  const lessonsDone = best.size;
  const avgMpm =
    best.size === 0
      ? 0
      : Math.round([...best.values()].reduce((s, a) => s + a.mpm, 0) / best.size);
  const avgAcc =
    best.size === 0
      ? 0
      : Math.round([...best.values()].reduce((s, a) => s + a.accuracy, 0) / best.size);
  const tier = tierFor(rows);
  const bronze = progressFor(rows, "bronze");
  const argent = progressFor(rows, "argent");
  const or = progressFor(rows, "or");

  // Heatmap: somme des erreurs par touche
  const heat: Record<string, number> = {};
  for (const r of rows) {
    for (const [k, v] of Object.entries(r.key_errors ?? {})) {
      heat[k] = (heat[k] ?? 0) + (v as number);
    }
  }
  const weak = Object.entries(heat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxWeak = weak[0]?.[1] ?? 1;

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">
            tableau de bord
          </p>
          <h1 className="mt-2 font-serif text-3xl">Votre progression</h1>
        </div>
        {isFirstVisit && <VoiceGuide page="dashboard" />}
      </div>

      {loading ? (
        <p className="font-mono text-sm text-ink-soft">chargement…</p>
      ) : rows.length === 0 ? (
        <EmptyState isFirstVisit={isFirstVisit} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Niveaux travaillés" value={`${lessonsDone} / 100`} />
            <Stat label="Vitesse moyenne" value={`${avgMpm} MPM`} />
            <Stat label="Précision moyenne" value={`${avgAcc} %`} />
            <Stat
              label="Certification"
              value={tier ? TIER_LABEL[tier] : "Non obtenue"}
              color={tier ? TIER_COLOR[tier] : undefined}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-rule bg-card p-6">
              <h2 className="font-serif text-xl">Touches à retravailler</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Le rouge signale les touches qui résistent encore. Visez-les en priorité.
              </p>
              {weak.length === 0 ? (
                <p className="mt-6 font-mono text-sm text-ink-soft">
                  Aucune erreur enregistrée pour l&apos;instant.
                </p>
              ) : (
                <ul className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-8">
                  {weak.map(([k, n]) => {
                    const intensity = n / maxWeak;
                    return (
                      <li
                        key={k}
                        className="flex flex-col items-center gap-1 rounded-md border border-rule p-2 font-mono"
                        style={{
                          backgroundColor: `rgba(190, 60, 60, ${0.1 + intensity * 0.5})`,
                        }}
                      >
                        <span className="text-lg uppercase">{k === " " ? "␣" : k}</span>
                        <span className="text-[10px] text-ink-soft">{n} err.</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-rule bg-card p-6">
              <h2 className="font-serif text-xl">Vers la certification</h2>
              <div className="mt-6 space-y-5">
                <TierBar label="Bronze" color={TIER_COLOR.bronze} {...bronze} />
                <TierBar label="Argent" color={TIER_COLOR.argent} {...argent} />
                <TierBar label="Or" color={TIER_COLOR.or} {...or} />
              </div>
              <Link
                to="/app/certification"
                className="mt-6 inline-block text-sm text-copper-deep underline-offset-4 hover:underline"
              >
                Voir les règles de certification →
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-rule bg-card p-6">
            <h2 className="font-serif text-xl">Dernières séances</h2>
            <table className="mt-4 w-full text-sm">
              <thead className="text-left font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
                <tr>
                  <th className="py-2">Date</th>
                  <th>Niveau</th>
                  <th>MPM</th>
                  <th>Précision</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 8).map((r, i) => (
                  <tr key={i} className="border-t border-rule/60">
                    <td className="py-2 text-ink-soft">
                      {new Date(r.created_at).toLocaleString("fr-FR")}
                    </td>
                    <td>{r.level}</td>
                    <td>{r.mpm}</td>
                    <td>{r.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-rule bg-card p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">{label}</p>
      <p className="mt-2 font-serif text-2xl" style={color ? { color } : undefined}>
        {value}
      </p>
    </div>
  );
}

function TierBar({
  label,
  color,
  done,
  total,
}: {
  label: string;
  color: string;
  done: number;
  total: number;
}) {
  const pct = Math.round((done / total) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium" style={{ color }}>
          {label}
        </span>
        <span className="font-mono text-xs text-ink-soft">
          {done}/{total} niveaux validés ({pct}%)
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper-deep">
        <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function EmptyState({ isFirstVisit }: { isFirstVisit: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-rule bg-card p-10 text-center animate-fade-in">
      {isFirstVisit && (
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-copper/15">
          <span className="text-3xl">👋</span>
        </div>
      )}
      <p className="font-serif text-2xl">
        {isFirstVisit ? "Bienvenue dans la Méthode des 10 Doigts !" : "Aucune séance pour le moment."}
      </p>
      <p className="mt-2 text-ink-soft">
        {isFirstVisit
          ? "Commencez par placer vos doigts sur les touches QSDF et JKLM, puis lancez votre première leçon. Dix minutes suffisent !"
          : "Lancez votre premier niveau, dix minutes suffisent pour démarrer."}
      </p>
      {isFirstVisit && (
        <div className="mx-auto mt-6 grid max-w-sm gap-2 text-left text-sm">
          <div className="flex items-start gap-3 rounded-lg border border-rule bg-paper-deep p-3">
            <span className="mt-0.5 font-serif text-copper">01</span>
            <span>Main gauche sur <strong className="font-mono">Q S D F</strong></span>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-rule bg-paper-deep p-3">
            <span className="mt-0.5 font-serif text-copper">02</span>
            <span>Main droite sur <strong className="font-mono">J K L M</strong></span>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-rule bg-paper-deep p-3">
            <span className="mt-0.5 font-serif text-copper">03</span>
            <span>Tapez le texte affiché <strong>sans regarder le clavier</strong></span>
          </div>
        </div>
      )}
      <Link
        to="/app/train"
        className="mt-6 inline-block rounded-md bg-copper px-5 py-2.5 text-sm font-medium text-paper shadow-sm transition hover:-translate-y-0.5 hover:bg-copper-deep"
      >
        {isFirstVisit ? "🚀 Lancer ma première leçon" : "Commencer maintenant"}
      </Link>
    </div>
  );
}
