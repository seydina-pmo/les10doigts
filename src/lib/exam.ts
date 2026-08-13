/**
 * Certification exam system.
 *
 * Each tier (Bronze, Silver, Gold) requires passing a timed exam
 * with minimum WPM and accuracy thresholds.
 */

export type ExamTier = "bronze" | "silver" | "gold";

export interface ExamConfig {
  tier: ExamTier;
  label: string;
  requiredLevels: number;
  minMpm: number;
  minAccuracy: number;
  durationSeconds: number;
  textLength: number; // approx characters
}

export const EXAM_CONFIGS: Record<ExamTier, ExamConfig> = {
  bronze: {
    tier: "bronze",
    label: "Bronze",
    requiredLevels: 30,
    minMpm: 22,
    minAccuracy: 94,
    durationSeconds: 300, // 5 minutes
    textLength: 200,
  },
  silver: {
    tier: "silver",
    label: "Argent",
    requiredLevels: 70,
    minMpm: 38,
    minAccuracy: 96,
    durationSeconds: 420, // 7 minutes
    textLength: 350,
  },
  gold: {
    tier: "gold",
    label: "Or",
    requiredLevels: 100,
    minMpm: 55,
    minAccuracy: 98,
    durationSeconds: 600, // 10 minutes
    textLength: 500,
  },
};

export const TIER_ORDER: ExamTier[] = ["bronze", "silver", "gold"];

/**
 * Exam texts — longer passages for certification exams (French).
 */
export const EXAM_TEXTS: Record<ExamTier, string> = {
  bronze:
    "la saisie est une compétence qui s'apprend avec patience et régularité. " +
    "placez vos doigts sur la rangée de repos et laissez la mémoire musculaire guider chaque frappe. " +
    "les touches qsdf pour la main gauche, jklm pour la main droite. " +
    "ne regardez pas le clavier, faites confiance à vos doigts.",

  silver:
    "dans un monde où tout passe par l'écrit numérique, savoir taper vite et bien " +
    "est un atout considérable. la méthode des dix doigts transforme chaque séance " +
    "d'entraînement en progrès mesurable. les statistiques ne mentent pas. " +
    "votre vitesse augmente, vos erreurs diminuent, et bientôt vous n'aurez plus " +
    "besoin de regarder le clavier pour rédiger un courriel, un rapport ou un message. " +
    "la clé du succès est la constance, pas la vitesse.",

  gold:
    "la dactylographie professionnelle est un art silencieux. les meilleurs dactylos " +
    "produisent des textes impeccables à des vitesses que la plupart considèrent " +
    "impossibles. mais il n'y a rien de magique dans cette performance. elle repose " +
    "sur des milliers de minutes d'entraînement, une position correcte des doigts, " +
    "et un engagement quotidien envers la qualité plutôt que la quantité. " +
    "quand vous atteignez le niveau or, vous avez prouvé que vous maîtrisez " +
    "les cent niveaux de la méthode, que vos doigts connaissent chaque touche " +
    "par cœur, et que vous pouvez écrire les yeux fermés avec une précision " +
    "remarquable. félicitations, vous êtes dactylo certifié.",
};

export interface ExamResult {
  tier: ExamTier;
  passed: boolean;
  mpm: number;
  accuracy: number;
  durationMs: number;
  timestamp: string;
}

/**
 * Check if an exam result meets the passing criteria.
 */
export function isExamPassed(tier: ExamTier, mpm: number, accuracy: number): boolean {
  const config = EXAM_CONFIGS[tier];
  return mpm >= config.minMpm && accuracy >= config.minAccuracy;
}

/**
 * Check eligibility: does the user have enough validated levels?
 */
export function canTakeExam(tier: ExamTier, validatedLevels: number): boolean {
  return validatedLevels >= EXAM_CONFIGS[tier].requiredLevels;
}
