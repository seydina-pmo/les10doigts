// Système de certification: Bronze / Argent / Or.
// Barres volontairement exigeantes — l'Or n'est pas un cadeau.

export type Tier = "or" | "argent" | "bronze" | null;

export type Attempt = {
  level: number;
  mpm: number;
  accuracy: number;
};

// Règles : niveaux à valider + seuils minimaux par niveau.
// L'Or impose en plus une moyenne MPM globale et zéro niveau en dessous du seuil.
export const TIER_RULES = {
  bronze: { levels: 30, mpm: 22, accuracy: 94, avgMpm: 22 },
  argent: { levels: 70, mpm: 38, accuracy: 96, avgMpm: 40 },
  or:     { levels: 100, mpm: 55, accuracy: 98, avgMpm: 60 },
} as const;

export function bestPerLevel(attempts: Attempt[]): Map<number, Attempt> {
  const m = new Map<number, Attempt>();
  for (const a of attempts) {
    const prev = m.get(a.level);
    if (!prev || a.mpm + a.accuracy > prev.mpm + prev.accuracy) m.set(a.level, a);
  }
  return m;
}

function meets(
  attempts: Attempt[],
  rule: { levels: number; mpm: number; accuracy: number; avgMpm: number },
) {
  const best = bestPerLevel(attempts);
  let ok = 0;
  let sumMpm = 0;
  for (let l = 1; l <= rule.levels; l++) {
    const a = best.get(l);
    if (!a) return false; // chaque niveau doit avoir été tenté ET validé
    if (a.mpm < rule.mpm || a.accuracy < rule.accuracy) return false;
    sumMpm += a.mpm;
    ok++;
  }
  if (ok < rule.levels) return false;
  return sumMpm / rule.levels >= rule.avgMpm;
}

export function tierFor(attempts: Attempt[]): Tier {
  if (meets(attempts, TIER_RULES.or)) return "or";
  if (meets(attempts, TIER_RULES.argent)) return "argent";
  if (meets(attempts, TIER_RULES.bronze)) return "bronze";
  return null;
}

export function progressFor(
  attempts: Attempt[],
  tier: keyof typeof TIER_RULES,
): { done: number; total: number } {
  const rule = TIER_RULES[tier];
  const best = bestPerLevel(attempts);
  let done = 0;
  for (let l = 1; l <= rule.levels; l++) {
    const a = best.get(l);
    if (a && a.mpm >= rule.mpm && a.accuracy >= rule.accuracy) done++;
  }
  return { done, total: rule.levels };
}

export const TIER_LABEL: Record<Exclude<Tier, null>, string> = {
  bronze: "Bronze",
  argent: "Argent",
  or: "Or",
};

export const TIER_COLOR: Record<Exclude<Tier, null>, string> = {
  bronze: "#a87149",
  argent: "#9aa3ad",
  or: "#c9a227",
};
