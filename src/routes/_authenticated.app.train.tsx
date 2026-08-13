import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { TypingEngine } from "@/components/TypingEngine";
import { FINGER_LEGEND } from "@/components/KeyboardFR";
import { VoiceGuide } from "@/components/VoiceGuide";
import { Paywall } from "@/components/Paywall";
import { useSubscription, canAccessLevel } from "@/lib/subscription";
import { lessonFor } from "@/lib/exercises";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/train")({
  head: () => ({ meta: [{ title: "S'entraîner, La Méthode des 10 Doigts" }] }),
  component: TrainPage,
});

function TrainPage() {
  const [level, setLevel] = useState(1);
  const [focusMode, setFocusMode] = useState(false);
  const focusContainerRef = useRef<HTMLDivElement>(null);
  const { subscription } = useSubscription();

  // Resume at the highest level already attempted.
  useEffect(() => {
    void (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("lesson_attempts")
        .select("level")
        .eq("user_id", u.user.id)
        .order("level", { ascending: false })
        .limit(1);
      if (data && data[0]) setLevel(Math.min(100, (data[0].level as number) + 1));
    })();
  }, []);

  // Toggle focus mode + fullscreen
  const toggleFocus = useCallback(() => {
    if (!focusMode) {
      setFocusMode(true);
      // Request browser fullscreen
      if (focusContainerRef.current?.requestFullscreen) {
        focusContainerRef.current.requestFullscreen().catch(() => {
          // Fullscreen denied — still show focus mode without it
        });
      }
    } else {
      setFocusMode(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [focusMode]);

  // Exit focus mode when ESC exits fullscreen
  useEffect(() => {
    function onFullscreenChange() {
      if (!document.fullscreenElement && focusMode) {
        setFocusMode(false);
      }
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [focusMode]);

  // ESC key handler (when fullscreen is not available)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && focusMode && !document.fullscreenElement) {
        setFocusMode(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [focusMode]);

  const lesson = lessonFor(level);
  const hasAccess = canAccessLevel(subscription, level);

  // Focus mode: immersive view with only text + keyboard
  if (focusMode) {
    return (
      <div
        ref={focusContainerRef}
        className="focus-mode fixed inset-0 z-50 flex flex-col bg-[oklch(0.15_0.01_55)]"
      >
        {/* Minimal top bar */}
        <div className="flex items-center justify-between px-6 py-3">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-paper/50">
            {lesson.title}
          </span>
          <button
            onClick={toggleFocus}
            className="rounded-md border border-paper/20 px-3 py-1.5 font-mono text-xs text-paper/60 transition hover:bg-paper/10 hover:text-paper"
            title="Quitter le mode focus (Échap)"
          >
            ✕ Quitter
          </button>
        </div>

        {/* Centered engine */}
        <div className="flex flex-1 items-center justify-center px-6 pb-10">
          <div className="w-full max-w-4xl">
            <TypingEngine
              key={`focus-${level}`}
              level={level}
              text={lesson.text}
              onNext={() => setLevel((l) => Math.min(100, l + 1))}
              focusMode
            />
          </div>
        </div>
      </div>
    );
  }

  // Normal mode
  return (
    <section ref={focusContainerRef} className="mx-auto grid max-w-6xl gap-8 px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">
            moteur d&apos;exercice
          </p>
          <h1 className="mt-2 font-serif text-3xl">{lesson.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <VoiceGuide page="train" />
          <button
            onClick={toggleFocus}
            className="flex items-center gap-2 rounded-md border border-rule bg-card px-3 py-2 text-sm transition hover:bg-paper-deep"
            title="Mode Focus — plein écran sans distraction"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            Mode Focus
          </button>
          <LevelPicker level={level} setLevel={setLevel} />
        </div>
      </div>

      {hasAccess ? (
        <TypingEngine
          key={level}
          level={level}
          text={lesson.text}
          onNext={() => setLevel((l) => Math.min(100, l + 1))}
        />
      ) : (
        <Paywall currentLevel={level} />
      )}

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
        {FINGER_LEGEND.map((l) => (
          <span key={l.label} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-sm border border-rule"
              style={{ backgroundColor: l.color }}
            />
            {l.label}
          </span>
        ))}
      </div>
    </section>
  );
}

function LevelPicker({ level, setLevel }: { level: number; setLevel: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-rule bg-card px-3 py-2 text-sm">
      <button onClick={() => setLevel(Math.max(1, level - 1))} className="px-2">
        ‹
      </button>
      <span className="font-mono">Niveau {String(level).padStart(3, "0")} / 100</span>
      <button onClick={() => setLevel(Math.min(100, level + 1))} className="px-2">
        ›
      </button>
    </div>
  );
}

