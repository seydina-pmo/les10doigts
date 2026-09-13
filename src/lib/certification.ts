// Système de certification: Bronze / Argent / Or.
// Barres volontairement exigeantes — l'Or n'est pas un cadeau.
// Conçu pour ~3 mois d'entraînement régulier avant d'obtenir l'Or.

export type Tier = "or" | "argent" | "bronze" | null;

export type Attempt = {
  level: number;
  mpm: number;
  accuracy: number;
};

// Règles exigeantes:
// Bronze: maîtriser les 30 premiers niveaux avec précision et vitesse correcte
// Argent: maîtriser les 70 premiers niveaux avec des exigences accrues
// Or:     maîtriser les 100 niveaux avec excellence — vitesse rapide + quasi-zéro erreurs
export const TIER_RULES = {
  bronze: { levels: 30, mpm: 25, accuracy: 95, avgMpm: 28 },
  argent: { levels: 70, mpm: 40, accuracy: 97, avgMpm: 45 },
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

/** Returns niveaux that need improvement for a given tier */
export function weakLevelsFor(
  attempts: Attempt[],
  tier: keyof typeof TIER_RULES,
): { level: number; mpm: number; accuracy: number; needsMpm: boolean; needsAcc: boolean }[] {
  const rule = TIER_RULES[tier];
  const best = bestPerLevel(attempts);
  const weak: { level: number; mpm: number; accuracy: number; needsMpm: boolean; needsAcc: boolean }[] = [];
  for (let l = 1; l <= rule.levels; l++) {
    const a = best.get(l);
    if (!a) {
      weak.push({ level: l, mpm: 0, accuracy: 0, needsMpm: true, needsAcc: true });
    } else if (a.mpm < rule.mpm || a.accuracy < rule.accuracy) {
      weak.push({ level: l, mpm: a.mpm, accuracy: a.accuracy, needsMpm: a.mpm < rule.mpm, needsAcc: a.accuracy < rule.accuracy });
    }
  }
  return weak;
}

/** Compute the next tier to target */
export function nextTierTarget(attempts: Attempt[]): keyof typeof TIER_RULES {
  const current = tierFor(attempts);
  if (!current) return "bronze";
  if (current === "bronze") return "argent";
  if (current === "argent") return "or";
  return "or"; // Already gold, still show Or
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

export const TIER_ICON: Record<Exclude<Tier, null>, string> = {
  bronze: "🥉",
  argent: "🥈",
  or: "🥇",
};
