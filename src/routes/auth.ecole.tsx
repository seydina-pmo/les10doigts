import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/auth/ecole")({
  head: () => ({
    meta: [
      { title: "Ouvrir un compte école, La Méthode des 10 Doigts" },
      {
        name: "description",
        content:
          "Demande d'ouverture d'un compte établissement. Étude du dossier, abonnement, puis activation manuelle par notre équipe.",
      },
    ],
  }),
  component: SchoolRequest,
});

type Form = {
  name: string;
  contact_name: string;
  contact_role: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  nb_classes: number;
  nb_students: number;
  message: string;
};

const STEPS = ["Établissement", "Responsable", "Effectifs", "Confirmation"] as const;

function SchoolRequest() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>({
    name: "",
    contact_name: "",
    contact_role: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    nb_classes: 1,
    nb_students: 25,
    message: "",
  });
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function canNext(): boolean {
    if (step === 0) return form.name.trim().length > 1 && form.address.trim().length > 1;
    if (step === 1)
      return (
        form.contact_name.trim().length > 1 &&
        /.+@.+\..+/.test(form.contact_email)
      );
    if (step === 2) return form.nb_classes > 0 && form.nb_students >= 0;
    return true;
  }

  async function submit() {
    setErr(null);
    setBusy(true);
    try {
      const { error } = await supabase.from("schools").insert({
        name: form.name,
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        address: form.address,
        nb_classes: form.nb_classes,
        nb_students: form.nb_students,
        message: form.contact_role
          ? `[${form.contact_role}] ${form.message}`
          : form.message,
        status: "pending",
        admin_user_id: null,
      });
      setBusy(false);
      if (error) return setErr(error.message);
      setOk(true);
    } catch (e) {
      setBusy(false);
      setErr("Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez.");
    }
  }

  if (ok) {
    return (
      <Shell>
        <div className="mx-auto grid max-w-lg gap-6 py-16 text-center text-paper animate-fade-in">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-paper/25 bg-paper/5">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
            </svg>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-copper">
            demande reçue · dossier #{Math.random().toString(36).slice(2, 8).toUpperCase()}
          </p>
          <h1 className="font-serif text-4xl">Merci. Votre dossier est ouvert.</h1>
          <p className="text-paper/70">
            Notre équipe étudie votre demande et vous recontacte sous 48h ouvrées
            avec les modalités d&apos;abonnement. Une fois validé, votre espace
            établissement est activé et vous recevez les identifiants du
            responsable.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-block rounded-md bg-copper px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-copper-deep"
            >
              ← Retour à l&apos;accueil
            </Link>
            <Link
              to="/contact"
              className="inline-block rounded-md border border-paper/40 px-5 py-2.5 text-sm text-paper transition hover:bg-paper/10"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto grid w-full max-w-5xl gap-10 py-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start lg:py-16">
        {/* Left rail */}
        <aside className="grid gap-8 text-paper">
          <Link to="/" className="flex items-center gap-3">
            <img src="/favicon.png" alt="" className="h-10 w-10 rounded-lg brightness-0 invert" />
            <span className="font-serif text-xl font-medium text-white">Les <span className="text-[#4361ee]">10</span> Doigts</span>
          </Link>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-copper">
              espace établissement
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight">
              Ouvrir un compte&nbsp;école.
            </h1>
            <p className="mt-3 max-w-sm text-sm text-paper/70">
              Un dossier, pas un formulaire d&apos;inscription. Nous étudions
              chaque demande manuellement — les comptes élèves ne sont créés
              qu&apos;après validation de l&apos;abonnement.
            </p>
          </div>

          <ol className="grid gap-3 text-sm">
            {STEPS.map((label, i) => {
              const state = i === step ? "current" : i < step ? "done" : "todo";
              return (
                <li key={label} className="flex items-center gap-3">
                  <span
                    className={[
                      "grid h-7 w-7 place-items-center rounded-full font-mono text-[11px]",
                      state === "current"
                        ? "bg-copper text-paper"
                        : state === "done"
                          ? "bg-paper text-ink"
                          : "border border-paper/25 text-paper/50",
                    ].join(" ")}
                  >
                    {state === "done" ? "✓" : i + 1}
                  </span>
                  <span
                    className={
                      state === "todo" ? "text-paper/45" : "text-paper"
                    }
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>

          <Link
            to="/auth"
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-paper/20 px-3 py-1.5 text-xs text-paper/70 hover:bg-paper/5"
          >
            <span>←</span> Je suis un particulier
          </Link>
        </aside>

        {/* Card */}
        <section className="rounded-2xl bg-paper text-ink shadow-2xl">
          <header className="flex items-center justify-between border-b border-rule px-6 py-4 md:px-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink-soft">
              étape {step + 1} / {STEPS.length} · {STEPS[step]}
            </p>
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={[
                    "h-1 w-8 rounded-full transition-all",
                    i <= step ? "bg-copper" : "bg-rule",
                  ].join(" ")}
                />
              ))}
            </div>
          </header>

          <div className="px-6 py-8 md:px-10 md:py-10">
            {step === 0 && (
              <div className="grid gap-5 animate-fade-in">
                <Field label="Nom de l'établissement" hint="Ex : Collège Saint-Exupéry">
                  <input
                    autoFocus
                    maxLength={120}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className={input}
                  />
                </Field>
                <Field label="Adresse">
                  <input
                    maxLength={240}
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    className={input}
                    placeholder="Rue, ville, pays"
                  />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-5 animate-fade-in">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Nom du responsable">
                    <input
                      autoFocus
                      maxLength={120}
                      value={form.contact_name}
                      onChange={(e) => set("contact_name", e.target.value)}
                      className={input}
                    />
                  </Field>
                  <Field label="Fonction">
                    <input
                      maxLength={120}
                      value={form.contact_role}
                      onChange={(e) => set("contact_role", e.target.value)}
                      className={input}
                      placeholder="Directeur·rice, référent…"
                    />
                  </Field>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Email professionnel">
                    <input
                      type="email"
                      maxLength={200}
                      value={form.contact_email}
                      onChange={(e) => set("contact_email", e.target.value)}
                      className={input}
                    />
                  </Field>
                  <Field label="Téléphone">
                    <input
                      maxLength={40}
                      value={form.contact_phone}
                      onChange={(e) => set("contact_phone", e.target.value)}
                      className={input}
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-6 animate-fade-in">
                <NumberDial
                  label="Nombre de classes"
                  value={form.nb_classes}
                  min={1}
                  max={200}
                  step={1}
                  onChange={(v) => set("nb_classes", v)}
                />
                <NumberDial
                  label="Élèves (estimation totale)"
                  value={form.nb_students}
                  min={0}
                  max={5000}
                  step={5}
                  onChange={(v) => set("nb_students", v)}
                />
                <Field label="Un mot pour nous (optionnel)">
                  <textarea
                    rows={4}
                    maxLength={1500}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    className={input}
                    placeholder="Contexte, calendrier, questions particulières…"
                  />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-5 animate-fade-in">
                <p className="text-sm text-ink-soft">
                  Vérifiez avant envoi. Aucun compte n&apos;est créé
                  automatiquement.
                </p>
                <dl className="grid gap-3 rounded-lg border border-rule bg-paper-deep/50 p-5 text-sm">
                  <Row k="Établissement" v={form.name} />
                  <Row k="Adresse" v={form.address} />
                  <Row
                    k="Responsable"
                    v={
                      form.contact_role
                        ? `${form.contact_name} — ${form.contact_role}`
                        : form.contact_name
                    }
                  />
                  <Row k="Email" v={form.contact_email} />
                  <Row k="Téléphone" v={form.contact_phone || "—"} />
                  <Row
                    k="Effectifs"
                    v={`${form.nb_classes} classe(s) · ~${form.nb_students} élèves`}
                  />
                </dl>
                {err && <p className="text-sm text-destructive">{err}</p>}
                <p className="text-xs text-ink-soft">
                  En envoyant, vous acceptez que ces informations soient
                  utilisées pour vous recontacter au sujet de l&apos;abonnement
                  établissement.
                </p>
              </div>
            )}
          </div>

          <footer className="flex items-center justify-between border-t border-rule px-6 py-4 md:px-8">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || busy}
              className="text-sm text-ink-soft underline-offset-4 hover:underline disabled:opacity-40"
            >
              ← Précédent
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="rounded-md bg-copper px-5 py-2.5 text-sm font-medium text-white hover:bg-copper-deep disabled:opacity-40"
              >
                Continuer →
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="flex items-center gap-2 rounded-md bg-copper px-5 py-2.5 text-sm font-medium text-paper hover:bg-copper-deep disabled:opacity-60"
              >
                {busy && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-paper/40 border-t-paper" />
                )}
                Envoyer le dossier
              </button>
            )}
          </footer>
        </section>
      </div>
    </Shell>
  );
}

const input =
  "w-full rounded-md border border-rule bg-paper px-3.5 py-2.5 text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/20";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-rule/60 pb-2 last:border-0 last:pb-0">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
        {k}
      </dt>
      <dd className="text-right font-serif text-base">{v || "—"}</dd>
    </div>
  );
}

function NumberDial({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          className="grid h-11 w-11 place-items-center rounded-md border border-rule bg-paper text-xl hover:bg-paper-deep"
        >
          −
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
          className="w-24 rounded-md border border-rule bg-paper px-3 py-2.5 text-center font-serif text-2xl outline-none focus:border-copper focus:ring-2 focus:ring-copper/20"
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          className="grid h-11 w-11 place-items-center rounded-md border border-rule bg-paper text-xl hover:bg-paper-deep"
        >
          +
        </button>
        <span className="ml-2 text-xs text-ink-soft">
          entre {min} et {max}
        </span>
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-card">
      {/* subtle grid backdrop */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--paper) 1px, transparent 1px), linear-gradient(90deg, var(--paper) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6">{children}</div>
    </main>
  );
}
