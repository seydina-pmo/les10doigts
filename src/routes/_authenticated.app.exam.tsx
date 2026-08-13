import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardFR } from "@/components/KeyboardFR";
import { keyIdFor } from "@/lib/exercises";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import {
  EXAM_CONFIGS,
  EXAM_TEXTS,
  TIER_ORDER,
  isExamPassed,
  canTakeExam,
  type ExamTier,
  type ExamResult,
} from "@/lib/exam";
import { bestPerLevel, progressFor } from "@/lib/certification";

export const Route = createFileRoute("/_authenticated/app/exam")({
  head: () => ({
    meta: [{ title: "Examen de certification — La Méthode des 10 Doigts" }],
  }),
  component: ExamPage,
});

type ExamState = "select" | "countdown" | "running" | "result";

function ExamPage() {
  const { user } = useAuth();
  const [state, setState] = useState<ExamState>("select");
  const [selectedTier, setSelectedTier] = useState<ExamTier | null>(null);
  const [validatedLevels, setValidatedLevels] = useState(0);
  const [pastResults, setPastResults] = useState<ExamResult[]>([]);

  // Load user data
  useEffect(() => {
    if (!user) return;
    void (async () => {
      // Get validated levels
      const { data: attempts } = await supabase
        .from("lesson_attempts")
        .select("level, mpm, accuracy")
        .eq("user_id", user.id);
      if (attempts) {
        const best = bestPerLevel(attempts as { level: number; mpm: number; accuracy: number }[]);
        const prog = progressFor(best);
        setValidatedLevels(prog.validated);
      }
      // Get past exam results
      const { data: exams } = await supabase
        .from("exam_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (exams) {
        setPastResults(
          exams.map((e) => ({
            tier: e.tier as ExamTier,
            passed: e.passed as boolean,
            mpm: e.mpm as number,
            accuracy: e.accuracy as number,
            durationMs: e.duration_ms as number,
            timestamp: e.created_at as string,
          })),
        );
      }
    })();
  }, [user]);

  if (state === "countdown" && selectedTier) {
    return <Countdown onDone={() => setState("running")} />;
  }

  if (state === "running" && selectedTier) {
    return (
      <ExamRunner
        tier={selectedTier}
        userId={user?.id ?? ""}
        onFinish={(result) => {
          setPastResults((r) => [result, ...r]);
          setState("result");
        }}
      />
    );
  }

  if (state === "result" && pastResults[0]) {
    const r = pastResults[0];
    return (
      <section className="mx-auto grid max-w-2xl gap-8 px-6 py-10 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-copper/15">
            <span className="text-4xl">{r.passed ? "🎉" : "📝"}</span>
          </div>
          <h1 className="font-serif text-4xl">
            {r.passed ? "Félicitations !" : "Pas encore cette fois"}
          </h1>
          <p className="mt-4 text-ink-soft">
            {r.passed
              ? `Vous avez obtenu la certification ${EXAM_CONFIGS[r.tier].label} !`
              : `Continuez à vous entraîner et retentez l'examen ${EXAM_CONFIGS[r.tier].label}.`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-rule bg-card p-5 text-center">
            <p className="font-mono text-xs uppercase text-ink-soft">vitesse</p>
            <p className="mt-2 font-serif text-3xl">{r.mpm} <span className="text-base text-ink-soft">MPM</span></p>
            <p className="mt-1 text-xs text-ink-soft">min. {EXAM_CONFIGS[r.tier].minMpm}</p>
          </div>
          <div className="rounded-xl border border-rule bg-card p-5 text-center">
            <p className="font-mono text-xs uppercase text-ink-soft">précision</p>
            <p className="mt-2 font-serif text-3xl">{r.accuracy}<span className="text-base text-ink-soft">%</span></p>
            <p className="mt-1 text-xs text-ink-soft">min. {EXAM_CONFIGS[r.tier].minAccuracy}%</p>
          </div>
        </div>

        {r.passed && (
          <Link
            to="/app/certification"
            className="mx-auto rounded-md bg-copper px-6 py-3 text-sm font-medium text-paper transition hover:bg-copper-deep"
          >
            Voir mon certificat →
          </Link>
        )}

        <button
          onClick={() => { setState("select"); setSelectedTier(null); }}
          className="mx-auto text-sm text-ink-soft underline-offset-4 hover:underline"
        >
          ← Retour à la sélection
        </button>
      </section>
    );
  }

  // Tier selection screen
  return (
    <section className="mx-auto grid max-w-4xl gap-8 px-6 py-10 animate-fade-in">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">
          examen de certification
        </p>
        <h1 className="mt-2 font-serif text-3xl">Passez votre examen</h1>
        <p className="mt-2 text-ink-soft">
          Niveaux validés : <strong>{validatedLevels}</strong> / 100.
          Sélectionnez un palier pour commencer l&apos;examen.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {TIER_ORDER.map((tier) => {
          const config = EXAM_CONFIGS[tier];
          const eligible = canTakeExam(tier, validatedLevels);
          const alreadyPassed = pastResults.some((r) => r.tier === tier && r.passed);
          const emoji = tier === "bronze" ? "🥉" : tier === "silver" ? "🥈" : "🥇";

          return (
            <div
              key={tier}
              className={
                "rounded-2xl border p-6 transition " +
                (eligible
                  ? "border-copper/40 bg-card hover:-translate-y-1 hover:shadow-lg"
                  : "border-rule bg-card/50 opacity-60")
              }
            >
              <div className="text-center">
                <span className="text-3xl">{emoji}</span>
                <h3 className="mt-3 font-serif text-xl">{config.label}</h3>
                {alreadyPassed && (
                  <span className="mt-1 inline-block rounded-full bg-copper/15 px-2 py-0.5 text-xs text-copper-deep">
                    ✓ Obtenu
                  </span>
                )}
              </div>

              <ul className="mt-4 space-y-1 text-sm text-ink-soft">
                <li>· {config.requiredLevels} niveaux requis</li>
                <li>· {config.minMpm} MPM minimum</li>
                <li>· {config.minAccuracy}% de précision</li>
                <li>· Durée : {Math.round(config.durationSeconds / 60)} minutes</li>
              </ul>

              <button
                disabled={!eligible}
                onClick={() => {
                  setSelectedTier(tier);
                  setState("countdown");
                }}
                className={
                  "mt-5 w-full rounded-md px-4 py-2.5 text-sm font-medium transition " +
                  (eligible
                    ? "bg-copper text-paper hover:bg-copper-deep"
                    : "bg-rule text-ink-soft cursor-not-allowed")
                }
              >
                {alreadyPassed
                  ? "Repasser l'examen"
                  : eligible
                    ? "Commencer l'examen"
                    : `${config.requiredLevels - validatedLevels} niveaux restants`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Past results */}
      {pastResults.length > 0 && (
        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
            historique des examens
          </h2>
          <div className="mt-3 grid gap-2">
            {pastResults.slice(0, 10).map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-rule bg-card px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span>{r.passed ? "✅" : "❌"}</span>
                  <span className="font-medium">{EXAM_CONFIGS[r.tier].label}</span>
                </div>
                <div className="flex items-center gap-4 text-ink-soft">
                  <span>{r.mpm} MPM</span>
                  <span>{r.accuracy}%</span>
                  <span>{new Date(r.timestamp).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** 3-2-1 countdown before the exam starts */
function Countdown({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onDone]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="text-center animate-fade-in">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">
          préparez-vous
        </p>
        <p className="mt-6 font-serif text-[8rem] leading-none text-copper">
          {count}
        </p>
        <p className="mt-4 text-ink-soft">
          Placez vos doigts sur Q S D F · J K L M
        </p>
      </div>
    </div>
  );
}

/** The actual timed exam */
function ExamRunner({
  tier,
  userId,
  onFinish,
}: {
  tier: ExamTier;
  userId: string;
  onFinish: (result: ExamResult) => void;
}) {
  const config = EXAM_CONFIGS[tier];
  const text = EXAM_TEXTS[tier];

  const [typed, setTyped] = useState("");
  const [errors, setErrors] = useState(0);
  const [startedAt] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(config.durationSeconds);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus
  useEffect(() => {
    inputRef.current?.focus();
    const t1 = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t1);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, config.durationSeconds - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0) {
        setFinished(true);
        clearInterval(interval);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [finished, startedAt, config.durationSeconds]);

  // Submit when finished
  useEffect(() => {
    if (!finished) return;
    const elapsed = (Date.now() - startedAt) / 1000;
    const words = typed.length / 5;
    const mpm = elapsed > 0 ? Math.round((words / elapsed) * 60) : 0;
    const acc =
      typed.length === 0
        ? 0
        : Math.max(0, Math.round(((typed.length - errors) / (typed.length + errors)) * 100));
    const passed = isExamPassed(tier, mpm, acc);

    const result: ExamResult = {
      tier,
      passed,
      mpm,
      accuracy: acc,
      durationMs: Math.round(elapsed * 1000),
      timestamp: new Date().toISOString(),
    };

    // Save to Supabase
    void supabase.from("exam_results").insert({
      user_id: userId,
      tier,
      passed,
      mpm,
      accuracy: acc,
      duration_ms: result.durationMs,
    });

    onFinish(result);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const nextChar = typed.length < text.length ? text[typed.length] : null;
  const highlight = nextChar ? keyIdFor(nextChar) : null;

  const stats = useMemo(() => {
    const elapsed = (Date.now() - startedAt) / 1000;
    const words = typed.length / 5;
    const mpm = elapsed > 0 ? Math.round((words / elapsed) * 60) : 0;
    const acc =
      typed.length === 0
        ? 100
        : Math.max(0, Math.round(((typed.length - errors) / (typed.length + errors)) * 100));
    return { mpm, acc };
  }, [typed, errors, startedAt]);

  const onKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (finished) return;
      if (e.key.length !== 1 && e.key !== "Backspace") return;
      e.preventDefault();

      if (e.key === "Backspace") {
        setTyped((t) => t.slice(0, -1));
        return;
      }
      const expected = text[typed.length];
      if (e.key !== expected) {
        setErrors((n) => n + 1);
        return;
      }
      const nt = typed + e.key;
      setTyped(nt);
      if (nt.length === text.length) {
        setFinished(true);
      }
    },
    [finished, text, typed],
  );

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <section
      className="mx-auto grid max-w-4xl gap-6 px-6 py-10"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Timer bar */}
      <div className="flex items-center justify-between rounded-xl border border-rule bg-card px-5 py-3">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">
          Examen {config.label}
        </span>
        <div className="flex items-center gap-6 font-mono text-sm">
          <span>MPM {stats.mpm}</span>
          <span>Précision {stats.acc}%</span>
          <span className={timeLeft < 30 ? "font-bold text-destructive animate-pulse" : "text-copper"}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 overflow-hidden rounded-full bg-rule">
        <div
          className="h-full rounded-full bg-copper transition-all duration-300"
          style={{ width: `${(typed.length / text.length) * 100}%` }}
        />
      </div>

      {/* Text */}
      <div className="rounded-2xl border border-rule bg-card px-6 py-10 font-mono text-2xl leading-relaxed md:text-3xl">
        {text.split("").map((c, i) => {
          const s =
            i < typed.length
              ? typed[i] === c ? "ok" : "ko"
              : i === typed.length ? "cur" : "todo";
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
        <span className="ml-0.5 inline-block h-7 w-[2px] translate-y-1 animate-pulse bg-copper" />
      </div>

      {/* Keyboard */}
      <div className="flex justify-center">
        <KeyboardFR highlight={highlight} showHands={false} size="md" />
      </div>

      <input
        ref={inputRef}
        onKeyDown={onKey}
        className="sr-only"
        autoFocus
        aria-label="Zone de saisie examen"
        value=""
        onChange={() => {}}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    </section>
  );
}
