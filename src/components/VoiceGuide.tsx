import { useEffect, useRef, useState } from "react";

/** Messages vocaux contextuels par page */
const VOICE_SCRIPTS: Record<string, string> = {
  dashboard:
    "Bienvenue dans la Méthode des 10 Doigts ! Vous êtes sur votre tableau de bord. " +
    "Ici, vous pouvez voir votre progression, vos statistiques et votre niveau de certification. " +
    "Cliquez sur S'entraîner dans le menu pour commencer votre première leçon.",
  train:
    "Bienvenue dans l'espace d'entraînement. " +
    "Placez vos doigts sur la rangée de repos : les touches Q, S, D, F pour la main gauche, " +
    "et J, K, L, M pour la main droite. " +
    "Le texte à taper s'affiche à l'écran. Tapez chaque lettre sans regarder le clavier. " +
    "Vous pouvez activer le mode Focus pour vous concentrer sans distraction.",
  certification:
    "La page certification vous montre les trois paliers à atteindre : Bronze, Argent et Or. " +
    "Chaque palier demande de valider un nombre de niveaux avec une vitesse et une précision minimales. " +
    "Continuez à vous entraîner régulièrement pour progresser.",
  auth:
    "Bienvenue sur la Méthode des 10 Doigts ! " +
    "Pour commencer, créez votre compte en remplissant le formulaire. " +
    "Si vous avez déjà un compte, connectez-vous avec votre email et mot de passe. " +
    "Après la création de votre compte, vérifiez votre boîte mail pour activer votre accès. " +
    "Les 3 premiers niveaux sont gratuits, profitez-en !",
  exam:
    "Bienvenue sur la page d'examen. " +
    "Pour obtenir une certification, vous devez passer un examen chronométré. " +
    "Choisissez votre palier : Bronze, Argent ou Or. " +
    "L'examen mesure votre vitesse en mots par minute et votre précision. " +
    "Préparez-vous bien avant de vous lancer, et bonne chance !",
  ecole:
    "Bienvenue dans l'espace école. " +
    "Ici, vous pouvez gérer vos classes, ajouter des formateurs et créer des comptes élèves. " +
    "Les élèves n'ont pas besoin d'email : vous leur distribuez leurs identifiants imprimés. " +
    "Utilisez l'onglet Mon plan pour gérer votre abonnement.",
};

/**
 * VoiceGuide — utilise l'API Web Speech Synthesis pour guider
 * vocalement les nouveaux utilisateurs.
 *
 * Le guide se joue automatiquement une seule fois par page,
 * et peut être relancé ou coupé manuellement.
 */
export function VoiceGuide({ page, compact = false }: { page: keyof typeof VOICE_SCRIPTS; compact?: boolean }) {
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const storageKey = `voice_guide_played_${page}`;

  // Check if voice has already been played for this page
  useEffect(() => {
    if (typeof window === "undefined") return;
    const played = localStorage.getItem(storageKey);
    if (played) {
      setHasPlayed(true);
    }
  }, [storageKey]);

  // Auto-play on first visit (after a short delay)
  useEffect(() => {
    if (hasPlayed || muted) return;
    if (!("speechSynthesis" in window)) return;

    const timer = setTimeout(() => {
      speak();
    }, 1500); // Small delay to let the page render

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPlayed, muted]);

  function speak() {
    if (!("speechSynthesis" in window)) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const script = VOICE_SCRIPTS[page];
    if (!script) return;

    const utter = new SpeechSynthesisUtterance(script);
    utter.lang = "fr-FR";
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.volume = 0.8;

    // Try to find a French voice
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(
      (v) => v.lang.startsWith("fr") && v.name.includes("Google"),
    ) ?? voices.find((v) => v.lang.startsWith("fr"));
    if (frVoice) utter.voice = frVoice;

    utter.onstart = () => setSpeaking(true);
    utter.onend = () => {
      setSpeaking(false);
      setHasPlayed(true);
      localStorage.setItem(storageKey, "1");
    };
    utter.onerror = () => {
      setSpeaking(false);
    };

    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }

  function stop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  function toggle() {
    if (speaking) {
      stop();
    } else {
      speak();
    }
  }

  function toggleMute() {
    if (speaking) stop();
    setMuted((m) => !m);
  }

  // Don't render if speech synthesis is not supported
  if (typeof window !== "undefined" && !("speechSynthesis" in window)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Play/Stop button */}
      <button
        onClick={toggle}
        className={
          "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition " +
          (speaking
            ? "border-copper bg-copper/10 text-copper-deep"
            : "border-rule bg-card text-ink-soft hover:bg-paper-deep hover:text-foreground")
        }
        title={speaking ? "Arrêter le guide vocal" : "Lancer le guide vocal"}
      >
        {speaking ? (
          <>
            <SpeakerWaveIcon />
            <span className="hidden sm:inline">Guide vocal en cours…</span>
            <span className="sm:hidden">🔊</span>
          </>
        ) : (
          <>
            <SpeakerIcon />
            <span className="hidden sm:inline">
              {hasPlayed ? "Réécouter le guide" : "Écouter le guide vocal"}
            </span>
          </>
        )}
      </button>

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        className={
          "rounded-lg border p-2 text-xs transition " +
          (muted
            ? "border-destructive/30 text-destructive"
            : "border-rule text-ink-soft hover:bg-paper-deep")
        }
        title={muted ? "Réactiver le guide vocal" : "Désactiver le guide vocal"}
      >
        {muted ? <SpeakerMutedIcon /> : <SpeakerSmallIcon />}
      </button>
    </div>
  );
}

// --- SVG Icons ---

function SpeakerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SpeakerWaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SpeakerMutedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function SpeakerSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}
