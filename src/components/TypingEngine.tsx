import { useEffect, useMemo, useRef, useState } from "react";
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

  // Mutable refs for the global keydown handler — updated synchronously
  const stateRef = useRef(state);
  const typedRef = useRef(typed);
  const textRef = useRef(text);
  const errorsRef = useRef(errors);
  const keyErrorsRef = useRef(keyErrors);

  // Keep refs in sync with state
  stateRef.current = state;
  typedRef.current = typed;
  textRef.current = text;
  errorsRef.current = errors;
  keyErrorsRef.current = keyErrors;

  // Reset state when level changes
  useEffect(() => {
    setTyped("");
    setErrors(0);
    setKeyErrors({});
    setStartedAt(null);
    setState("ready");
    setSaved(false);
    // Also reset refs immediately
    typedRef.current = "";
    stateRef.current = "ready";
    errorsRef.current = 0;
    keyErrorsRef.current = {};
  }, [level]);

  // Update text ref when text prop changes
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  // GLOBAL keydown handler — works even if no element has focus
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      // Don't capture if user is typing in another real input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        return; // Let other inputs work normally
      }

      const curState = stateRef.current;
      const curTyped = typedRef.current;
      const curText = textRef.current;

      if (curState === "done") return;
      if (e.key.length !== 1 && e.key !== "Backspace" && e.key !== "Enter") return;

      // Prevent default browser behavior
      e.preventDefault();

      // First keypress starts the exercise
      if (curState === "ready" && e.key !== "Backspace") {
        stateRef.current = "typing";
        setState("typing");
        setStartedAt(Date.now());
      }

      if (e.key === "Backspace") {
        const newTyped = curTyped.slice(0, -1);
        typedRef.current = newTyped; // Update ref IMMEDIATELY
        setTyped(newTyped);
        return;
      }

      const expected = curText[curTyped.length];
      if (!expected) return; // Safety check

      const key = e.key === "Enter" ? "\n" : e.key;
      if (key !== expected) {
        const newErrors = errorsRef.current + 1;
        errorsRef.current = newErrors; // Update ref IMMEDIATELY
        setErrors(newErrors);
        const id = keyIdFor(expected);
        const newKeyErrors = { ...keyErrorsRef.current, [id]: (keyErrorsRef.current[id] ?? 0) + 1 };
        keyErrorsRef.current = newKeyErrors;
        setKeyErrors(newKeyErrors);
        return;
      }

      // Correct key!
      const newTyped = curTyped + key;
      typedRef.current = newTyped; // Update ref IMMEDIATELY
      setTyped(newTyped);

      if (newTyped.length === curText.length) {
        stateRef.current = "done";
        setState("done");
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []); // Empty deps — all values read from refs

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
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) {
          console.warn("[TypingEngine] No session, cannot save");
          return;
        }
        const userId = session.session.user.id;
        const { error } = await supabase.from("lesson_attempts").insert({
          user_id: userId,
          level,
          mpm: stats.mpm,
          accuracy: stats.acc,
          duration_ms: stats.elapsedMs,
          key_errors: keyErrors,
        });
        if (error) {
          console.error("[TypingEngine] Save error:", error.message, error.details, error.hint);
        } else {
          setSaved(true);
        }
      } catch (err) {
        console.error("[TypingEngine] Save exception:", err);
      }
    })();
  }, [state, saved, level, stats, keyErrors]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-2xl border border-rule bg-card cursor-text"
      tabIndex={0}
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

      {/* Ready overlay + Text area — wrapped together so overlay only covers text */}
      <div className="relative min-h-[180px]">
        {state === "ready" && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-card/95 backdrop-blur-[2px] cursor-text">
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
