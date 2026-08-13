// Curriculum: levels 1..100. Each level is a short text to type.
// Progressive: home row → top row → bottom row → digits → words → sentences.

const HOME = "fff jjj fjf jfj ddd kkk dkd kdk sss lll sls lsl aaa mmm";
const TOP = "rrr uuu rur uru ttt yyy tyt yty eee iii eie iei zzz ooo zoz";
const BOT = "vvv nnn vnv nvn ccc xxx cxc xcx www bbb wbw bwb";

const WORDS = [
  "le la les un une des de du et ou ni or car",
  "il elle ils elles nous vous je tu on",
  "matin midi soir nuit jour semaine annee",
  "ecole travail famille amour temps maison",
  "ecrire lire compter parler ecouter penser",
];

const SENTENCES = [
  "la saisie n'est pas un talent, c'est une methode.",
  "on ecrit chaque jour les memes mots, autant les taper sans regarder.",
  "dix minutes par jour suffisent a changer votre rapport au clavier.",
  "on ne memorise pas un clavier, on l'apprend doigt par doigt.",
  "la regularite de frappe vaut mieux que la vitesse brute.",
  "precision avant tout, la vitesse vient seule.",
  "le repos des doigts sur asdf et jklm est le point de depart.",
  "ecrire les yeux fermes commence par accepter de ne pas les baisser.",
];

export function lessonFor(level: number): { title: string; text: string } {
  const L = Math.max(1, Math.min(100, level));
  if (L <= 10) return { title: `Niveau ${L} · Rangée de repos`, text: HOME };
  if (L <= 25) return { title: `Niveau ${L} · Rangée haute`, text: TOP };
  if (L <= 40) return { title: `Niveau ${L} · Rangée basse`, text: BOT };
  if (L <= 60) {
    const w = WORDS[(L - 41) % WORDS.length];
    return { title: `Niveau ${L} · Mots courants`, text: w };
  }
  const s = SENTENCES[(L - 61) % SENTENCES.length];
  return { title: `Niveau ${L} · Phrases`, text: s };
}

// Map a character to the key id used by KeyboardFR (lowercased letters,
// punctuation kept literally, space = " ").
export function keyIdFor(ch: string): string {
  if (ch === " ") return " ";
  return ch.toLowerCase();
}
