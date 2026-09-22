import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/leaderboard")({
  head: () => ({ meta: [{ title: "Classement, La Méthode des 10 Doigts" }] }),
  component: LeaderboardPage,
});

type LeaderEntry = {
  user_id: string;
  name: string;
  avg_mpm: number;
  avg_accuracy: number;
  levels_done: number;
  tier: string | null;
};

type Period = "all" | "month" | "week";

function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("all");
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"mpm" | "accuracy">("mpm");

  useEffect(() => {
    void (async () => {
      const { data: s } = await supabase.auth.getSession();
      if (s.session?.user) setMyUserId(s.session.user.id);
    })();
  }, []);

  useEffect(() => {
    setLoading(true);
    void (async () => {
      try {
        // Build date filter
        let dateFilter: string | null = null;
        const now = new Date();
        if (period === "week") {
          const d = new Date(now);
          d.setDate(d.getDate() - 7);
          dateFilter = d.toISOString();
        } else if (period === "month") {
          const d = new Date(now);
          d.setMonth(d.getMonth() - 1);
          dateFilter = d.toISOString();
        }

        // Fetch all attempts (filtered by date if needed)
        let query = supabase
          .from("lesson_attempts")
          .select("user_id, level, mpm, accuracy");

        if (dateFilter) {
          query = query.gte("created_at", dateFilter);
        }

        const { data: attempts, error } = await query;
        if (error || !attempts) {
          console.error("Leaderboard query error:", error?.message);
          setLoading(false);
          return;
        }

        // Fetch profiles for display names
        const userIds = [...new Set(attempts.map((a) => a.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", userIds.slice(0, 200));

        const profileMap = new Map(
          (profiles || []).map((p) => [p.id, p.display_name || "Utilisateur"])
        );

        // Aggregate per user: best per level, then avg
        const userMap = new Map<
          string,
          { bestPerLevel: Map<number, { mpm: number; accuracy: number }> }
        >();

        for (const a of attempts) {
          if (!userMap.has(a.user_id)) {
            userMap.set(a.user_id, { bestPerLevel: new Map() });
          }
          const u = userMap.get(a.user_id)!;
          const prev = u.bestPerLevel.get(a.level);
          if (!prev || a.mpm + a.accuracy > prev.mpm + prev.accuracy) {
            u.bestPerLevel.set(a.level, { mpm: a.mpm, accuracy: a.accuracy });
          }
        }

        // Compute leaderboard entries
        const list: LeaderEntry[] = [];
        for (const [userId, data] of userMap) {
          const levels = [...data.bestPerLevel.values()];
          if (levels.length === 0) continue;
          const avgMpm = Math.round(
            levels.reduce((s, l) => s + l.mpm, 0) / levels.length
          );
          const avgAcc = Math.round(
            levels.reduce((s, l) => s + l.accuracy, 0) / levels.length
          );

          // Determine tier
          let tier: string | null = null;
          const best = data.bestPerLevel;
          if (checkTier(best, 100, 55, 98)) tier = "or";
          else if (checkTier(best, 70, 40, 97)) tier = "argent";
          else if (checkTier(best, 30, 25, 95)) tier = "bronze";

          list.push({
            user_id: userId,
            name: profileMap.get(userId) || "Utilisateur",
            avg_mpm: avgMpm,
            avg_accuracy: avgAcc,
            levels_done: levels.length,
            tier,
          });
        }

        // Sort
        list.sort((a, b) =>
          sortBy === "mpm"
            ? b.avg_mpm - a.avg_mpm
            : b.avg_accuracy - a.avg_accuracy
        );

        setEntries(list.slice(0, 100));
      } catch (err) {
        console.error("Leaderboard error:", err);
      }
      setLoading(false);
    })();
  }, [period, sortBy]);

  const TIER_ICONS: Record<string, string> = {
    bronze: "🥉",
    argent: "🥈",
    or: "🥇",
  };

  const RANK_STYLES = [
    "text-2xl font-bold text-[#c9a227]", // 1st — gold
    "text-xl font-bold text-[#9aa3ad]", // 2nd — silver
    "text-lg font-bold text-[#a87149]", // 3rd — bronze
  ];

  return (
    <section className="mx-auto grid max-w-4xl gap-8 px-6 py-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">
          classement
        </p>
        <h1 className="mt-2 font-serif text-3xl">Classement des meilleurs</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Les dactylos les plus rapides et les plus précis. Entraînez-vous pour monter !
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex rounded-lg border border-rule bg-card text-sm">
          {([
            ["all", "Tout le temps"],
            ["month", "Ce mois"],
            ["week", "Cette semaine"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={
                "px-4 py-2 transition " +
                (period === key
                  ? "bg-copper text-paper font-medium"
                  : "text-ink-soft hover:text-foreground")
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-rule bg-card text-sm">
          {([
            ["mpm", "⚡ Vitesse (MPM)"],
            ["accuracy", "🎯 Précision"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortBy(key as "mpm" | "accuracy")}
              className={
                "px-4 py-2 transition " +
                (sortBy === key
                  ? "bg-copper text-paper font-medium"
                  : "text-ink-soft hover:text-foreground")
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard table */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-copper border-t-transparent" />
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-rule bg-card p-12 text-center">
          <p className="text-lg text-ink-soft">Aucun résultat pour cette période.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-rule bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-rule bg-paper-deep/60 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
              <tr>
                <th className="px-4 py-3 text-center w-16">Rang</th>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-center">Palier</th>
                <th className="px-4 py-3 text-center">Niveaux</th>
                <th className="px-4 py-3 text-center">
                  <span className={sortBy === "mpm" ? "text-copper-deep font-bold" : ""}>
                    MPM moy.
                  </span>
                </th>
                <th className="px-4 py-3 text-center">
                  <span className={sortBy === "accuracy" ? "text-copper-deep font-bold" : ""}>
                    Précision
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => {
                const isMe = e.user_id === myUserId;
                return (
                  <tr
                    key={e.user_id}
                    className={
                      "border-t border-rule/40 transition " +
                      (isMe
                        ? "bg-copper/5 font-medium"
                        : i < 3
                          ? "bg-paper-deep/30"
                          : "hover:bg-paper-deep/20")
                    }
                  >
                    <td className="px-4 py-3 text-center">
                      {i < 3 ? (
                        <span className={RANK_STYLES[i]}>
                          {i === 0 ? "🏆" : i === 1 ? "🥈" : "🥉"}
                        </span>
                      ) : (
                        <span className="font-mono text-ink-soft">{i + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={isMe ? "text-copper-deep" : ""}>
                        {e.name}
                        {isMe && (
                          <span className="ml-2 rounded-full bg-copper/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-copper-deep">
                            vous
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {e.tier ? TIER_ICONS[e.tier] : "—"}
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      {e.levels_done}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-semibold">
                      {e.avg_mpm}
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      {e.avg_accuracy}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function checkTier(
  best: Map<number, { mpm: number; accuracy: number }>,
  levels: number,
  mpmReq: number,
  accReq: number
): boolean {
  for (let l = 1; l <= levels; l++) {
    const a = best.get(l);
    if (!a || a.mpm < mpmReq || a.accuracy < accReq) return false;
  }
  return true;
}
