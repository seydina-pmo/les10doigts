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
  const containerRef = useRef<HTMLDivElement>(null);

  // Use refs to always have fresh values in the global keydown handler
  const typedRef = useRef(typed);
  typedRef.current = typed;
  const stateRef = useRef(state);
  stateRef.current = state;
  const errorsRef = useRef(errors);
  errorsRef.current = errors;
  const startedAtRef = useRef(startedAt);
  startedAtRef.current = startedAt;

  // Reset on level change
  useEffect(() => {
    setTyped("");
    setErrors(0);
    setKeyErrors({});
    setStartedAt(null);
    setState("ready");
    setSaved(false);
  }, [level]);

  // Global keydown handler — captures ALL keyboard input on the page
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const st = stateRef.current;
      if (st === "done") return;

      // Ignore if user is typing in another input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Only handle printable chars, backspace, enter
      if (e.key.length !== 1 && e.key !== "Backspace" && e.key !== "Enter") return;

      // Ignore keyboard shortcuts (Ctrl+C, Cmd+V, etc.)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      e.preventDefault();

      const currentTyped = typedRef.current;

      // Start on first keypress
      if (st === "ready" && e.key !== "Backspace") {
        setState("typing");
        setStartedAt(Date.now());
      }

      // Backspace
      if (e.key === "Backspace") {
        setTyped(currentTyped.slice(0, -1));
        return;
      }

      const expected = text[currentTyped.length];
      if (!expected) return;

      const key = e.key === "Enter" ? "\n" : e.key;

      if (key !== expected) {
        setErrors((n) => n + 1);
        const id = keyIdFor(expected);
        setKeyErrors((m) => ({ ...m, [id]: (m[id] ?? 0) + 1 }));
        return;
      }

      // Correct!
      const next = currentTyped + key;
      setTyped(next);
      if (next.length === text.length) {
        setState("done");
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [text]); // Only re-bind if text changes

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed.length, errors, startedAt]);

  // Save attempt when done
  const levelRef = useRef(level);
  levelRef.current = level;
  const keyErrorsRef = useRef(keyErrors);
  keyErrorsRef.current = keyErrors;

  useEffect(() => {
    if (state !== "done" || saved) return;

    const elapsed = startedAt ? (Date.now() - startedAt) / 1000 : 0;
    const words = typed.length / 5;
    const mpm = elapsed > 0 ? Math.round((words / elapsed) * 60) : 0;
    const acc =
      typed.length === 0
        ? 100
        : Math.max(0, Math.round(((typed.length - errors) / (typed.length + errors)) * 100));
    const duration = Math.round(elapsed * 1000);
    const errs = { ...keyErrorsRef.current };
    const lvl = levelRef.current;

    setSaved(true);

    void (async () => {
      try {
        const { data: s } = await supabase.auth.getSession();
        if (!s.session?.user) {
          console.warn("[TypingEngine] No session — cannot save");
          return;
        }
        const { error } = await supabase.from("lesson_attempts").insert({
          user_id: s.session.user.id,
          level: lvl,
          mpm,
          accuracy: acc,
          duration_ms: duration,
          key_errors: errs,
        });
        if (error) {
          console.error("[TypingEngine] Save error:", error.message);
          setSaved(false);
        } else {
          console.log("[TypingEngine] ✅ Saved level", lvl, "mpm:", mpm, "acc:", acc);
        }
      } catch (err) {
        console.error("[TypingEngine] Save exception:", err);
        setSaved(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-2xl border border-rule bg-card"
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

      {/* Ready overlay + Text area */}
      <div className="relative min-h-[180px]">
        {state === "ready" && (
          <div
            className="absolute inset-0 z-10 grid place-items-center bg-card/95 backdrop-blur-[2px]"
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
