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

  // Reset on level change
  useEffect(() => {
    setTyped("");
    setErrors(0);
    setKeyErrors({});
    setStartedAt(null);
    setState("ready");
    setSaved(false);
    // Re-focus the hidden input
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [level]);

  // Auto-focus on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Re-focus when clicking anywhere in the container
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Core key handler — runs on every keydown in the hidden input
  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (state === "done") return;

    // Only handle printable chars, backspace, enter
    if (e.key.length !== 1 && e.key !== "Backspace" && e.key !== "Enter") return;

    e.preventDefault();
    e.stopPropagation();

    // Start on first keypress
    if (state === "ready" && e.key !== "Backspace") {
      setState("typing");
      setStartedAt(Date.now());
    }

    // Backspace
    if (e.key === "Backspace") {
      setTyped((t) => t.slice(0, -1));
      return;
    }

    const expected = text[typed.length];
    if (!expected) return;

    const key = e.key === "Enter" ? "\n" : e.key;

    if (key !== expected) {
      setErrors((n) => n + 1);
      const id = keyIdFor(expected);
      setKeyErrors((m) => ({ ...m, [id]: (m[id] ?? 0) + 1 }));
      return;
    }

    // Correct!
    const next = typed + key;
    setTyped(next);
    if (next.length === text.length) {
      setState("done");
    }
  }

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

  // Save attempt when done
  useEffect(() => {
    if (state !== "done" || saved) return;
    void (async () => {
      try {
        const { data: s } = await supabase.auth.getSession();
        if (!s.session?.user) {
          console.warn("[TypingEngine] No session");
          return;
        }
        const { error } = await supabase.from("lesson_attempts").insert({
          user_id: s.session.user.id,
          level,
          mpm: stats.mpm,
          accuracy: stats.acc,
          duration_ms: stats.elapsedMs,
          key_errors: keyErrors,
        });
        if (error) {
          console.error("[TypingEngine] Save error:", error.message);
        } else {
          console.log("[TypingEngine] Saved attempt for level", level);
          setSaved(true);
        }
      } catch (err) {
        console.error("[TypingEngine] Save exception:", err);
      }
    })();
  }, [state, saved, level, stats, keyErrors]);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-rule bg-card cursor-text"
      onClick={focusInput}
    >
      {/* Hidden input — all keyboard events go through here */}
      <input
        ref={inputRef}
        type="text"
        className="fixed -top-[9999px] -left-[9999px] h-0 w-0 opacity-0"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        onKeyDown={handleKey}
        onBlur={() => {
          // Re-focus after a short delay (prevents losing focus)
          if (state !== "done") {
            setTimeout(() => inputRef.current?.focus(), 10);
          }
        }}
      />

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

      {/* Ready overlay + Text area */}
      <div className="relative min-h-[180px]">
        {state === "ready" && (
          <div
            className="absolute inset-0 z-10 grid place-items-center bg-card/95 backdrop-blur-[2px] cursor-text"
            onClick={focusInput}
          >
            <div className="text-center animate-fade-in px-4">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-copper/15">
                <span className="text-2xl">⌨️</span>
              </div>
              <p className="font-serif text-lg text-foreground">
                Placez vos doigts sur le clavier
              </p>
              <p className="mt-1.5 text-sm text-ink-soft">
                Main gauche sur <strong className="font-mono text-foreground">Q S D F</strong> · Main droite sur <strong className="font-mono text-foreground">J K L M</strong>
              </p>
              <p className="mt-3 animate-pulse font-mono text-xs uppercase tracking-[0.2em] text-copper">
                tapez la première lettre pour commencer
              </p>
            </div>
          </div>
        )}

        {/* Text area */}
        <div
          className={"px-6 py-10 font-mono text-2xl leading-relaxed md:text-3xl" + (focusMode ? " text-3xl md:text-4xl" : "")}
          style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
        >
          {text.split("").map((c, i) => {
            const s =
              i < typed.length
                ? typed[i] === c
                  ? "ok"
                  : "ko"
                : i === typed.length
                  ? "cur"
                  : "future";
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
      </div>

      {/* Keyboard */}
      <div className="border-t border-rule bg-paper-deep/40 px-6 py-6">
        <div className="flex justify-center">
          <KeyboardFR highlight={highlight} showHands={false} size={focusMode ? "lg" : "md"} />
        </div>
      </div>

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
