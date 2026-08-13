import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardFR } from "@/components/KeyboardFR";
import { keyIdFor } from "@/lib/exercises";
import { supabase } from "@/integrations/supabase/client";

type EngineState = "ready" | "typing" | "done";

export function TypingEngine({
  level,
  text,
  onNext,
  focusMode = false,
}: {
  level: number;
  text: string;
  onNext: () => void;
  focusMode?: boolean;
}) {
  const [typed, setTyped] = useState("");
  const [errors, setErrors] = useState(0);
  const [keyErrors, setKeyErrors] = useState<Record<string, number>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [state, setState] = useState<EngineState>("ready");
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Robust focus: try multiple times to ensure the hidden input is focused
  // This fixes the bug where new users can't start exercises after login
  useEffect(() => {
    setTyped("");
    setErrors(0);
    setKeyErrors({});
    setStartedAt(null);
    setState("ready");
    setSaved(false);

    function tryFocus() {
      if (inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    }
    tryFocus();
    // Retry aggressively: SSR hydration, AuthProvider loading, route transitions
    const timers = [50, 150, 300, 500, 800, 1200, 2000].map((ms) =>
      setTimeout(tryFocus, ms),
    );
    const raf = requestAnimationFrame(tryFocus);

    // Also re-focus when tab becomes visible (user switched tabs)
    function onVisibility() {
      if (document.visibilityState === "visible") tryFocus();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [level]);

  const nextChar = typed.length < text.length ? text[typed.length] : null;
  const highlight = nextChar ? keyIdFor(nextChar) : null;

  const stats = useMemo(() => {
    const elapsed = startedAt ? (Date.now() - startedAt) / 1000 : 0;
    const words = typed.length / 5;
    const mpm = elapsed > 0 ? Math.round((words / elapsed) * 60) : 0;
    const acc =
      typed.length === 0
        ? 100
        : Math.max(0, Math.round(((typed.length - errors) / (typed.length + errors)) * 100));
    return { mpm, acc, elapsedMs: Math.round(elapsed * 1000) };
  }, [typed, errors, startedAt]);

  const onKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (state === "done") return;
      if (e.key.length !== 1 && e.key !== "Backspace" && e.key !== "Enter") return;
      e.preventDefault();

      // First keypress starts the exercise
      if (state === "ready" && e.key !== "Backspace") {
        setState("typing");
        setStartedAt(Date.now());
      }

      if (e.key === "Backspace") {
        setTyped((t) => t.slice(0, -1));
        return;
      }
      const expected = text[typed.length];
      const key = e.key === "Enter" ? "\n" : e.key;
      if (key !== expected) {
        setErrors((n) => n + 1);
        const id = keyIdFor(expected);
        setKeyErrors((m) => ({ ...m, [id]: (m[id] ?? 0) + 1 }));
        return;
      }
      const nt = typed + key;
      setTyped(nt);
      if (nt.length === text.length) setState("done");
    },
    [state, text, typed],
  );

  // Save attempt when done
  useEffect(() => {
    if (state !== "done" || saved) return;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      await supabase.from("lesson_attempts").insert({
        user_id: data.user.id,
        level,
        mpm: stats.mpm,
        accuracy: stats.acc,
        duration_ms: stats.elapsedMs,
        key_errors: keyErrors,
      });
      setSaved(true);
    })();
  }, [state, saved, level, stats, keyErrors]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-2xl border border-rule bg-card cursor-text"
      onClick={() => {
        inputRef.current?.focus({ preventScroll: true });
      }}
      onTouchStart={() => {
        inputRef.current?.focus({ preventScroll: true });
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-rule bg-paper-deep/60 px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">
        <span>leçon {String(level).padStart(2, "0")}</span>
        <span>
          {state === "ready" ? (
            <span className="animate-pulse text-copper">en attente…</span>
          ) : (
            <>MPM {stats.mpm} · précision {stats.acc}% · erreurs {errors}</>
          )}
        </span>
      </div>

      {/* Ready overlay — shown before first keypress. Clicking anywhere focuses the input. */}
      {state === "ready" && (
        <div
          className="relative cursor-text"
          onClick={() => inputRef.current?.focus({ preventScroll: true })}
        >
          <div className="absolute inset-0 z-10 grid place-items-center bg-card/90 backdrop-blur-[2px]">
            <div className="text-center animate-fade-in">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-copper/15">
                <span className="text-2xl">⌨️</span>
              </div>
              <p className="font-serif text-xl text-foreground">
                Placez vos doigts sur le clavier
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Main gauche sur <strong className="font-mono text-foreground">Q S D F</strong> · Main droite sur <strong className="font-mono text-foreground">J K L M</strong>
              </p>
              <p className="mt-4 animate-pulse font-mono text-xs uppercase tracking-[0.2em] text-copper">
                tapez la première lettre pour commencer
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Text area */}
      <div className={"px-6 py-10 font-mono text-2xl leading-relaxed md:text-3xl" + (focusMode ? " text-3xl md:text-4xl" : "")}>
        {text.split("").map((c, i) => {
          const s =
            i < typed.length
              ? typed[i] === c
                ? "ok"
                : "ko"
              : i === typed.length
                ? "cur"
                : "todo";
          return (
            <span
              key={i}
              className={
                s === "ok"
                  ? "text-foreground"
                  : s === "ko"
                    ? "rounded-sm bg-destructive/20 text-destructive"
                    : s === "cur"
                      ? "rounded-sm bg-copper/30 text-foreground"
                      : "text-ink-soft/60"
              }
            >
              {c === " " ? "\u00A0" : c}
            </span>
          );
        })}
        {state === "typing" && (
          <span className="ml-0.5 inline-block h-7 w-[2px] translate-y-1 animate-pulse bg-copper" />
        )}
      </div>

      {/* Keyboard */}
      <div className="border-t border-rule bg-paper-deep/40 px-6 py-6">
        <div className="flex justify-center">
          <KeyboardFR highlight={highlight} showHands={false} size={focusMode ? "lg" : "md"} />
        </div>
      </div>

      {/* Hidden input for capturing keystrokes */}
      <input
        ref={inputRef}
        onKeyDown={onKey}
        className="sr-only"
        autoFocus
        aria-label="Zone de saisie de l'exercice"
        value=""
        onChange={() => {}}
        // Prevent mobile keyboards from showing autocomplete
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {/* Done banner */}
      {state === "done" && (
        <div className="flex items-center justify-between gap-4 border-t border-rule bg-card px-6 py-5 animate-fade-in">
          <p className="text-sm">
            Niveau terminé · <strong>{stats.mpm} MPM</strong> ·{" "}
            <strong>{stats.acc}%</strong> de précision.
            {saved && <span className="ml-2 text-ink-soft">enregistré ✓</span>}
          </p>
          <button
            onClick={onNext}
            className="rounded-md bg-copper px-4 py-2 text-sm font-medium text-paper hover:bg-copper-deep"
          >
            Niveau suivant →
          </button>
        </div>
      )}
    </div>
  );
}

