import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  getMySchool,
  createFormateur,
  createSchoolClass,
  deleteSchoolClass,
  createStudents,
  requestSchoolUpgrade,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/app/ecole")({
  head: () => ({ meta: [{ title: "Mon école, La Méthode des 10 Doigts" }] }),
  component: EcolePage,
});

type Member = {
  id: string;
  display_name: string | null;
  school_id: string | null;
  role: string | null;
};

type ClassRow = {
  id: string;
  name: string;
  join_code: string;
  owner_id: string;
  student_count: number;
  owner_name: string;
};

type School = {
  id: string;
  name: string;
  contact_name: string;
  contact_email: string;
  nb_classes: number;
  nb_students: number;
  billing_cycle: string;
  current_period_end: string | null;
  upgrade_requested_at: string | null;
};

type Data = {
  school: School;
  members: Member[];
  classes: ClassRow[];
  totals: { formateurs: number; eleves: number; classes: number };
};

function EcolePage() {
  const get = useServerFn(getMySchool);
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"classes" | "formateurs" | "plan">("classes");

  async function load() {
    setErr(null);
    try {
      const r = await get();
      setD(r as unknown as Data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (err && !d)
    return (
      <section className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-sm text-destructive">{err}</p>
      </section>
    );
  if (!d)
    return (
      <section className="mx-auto max-w-3xl px-6 py-10 text-sm text-ink-soft">
        Chargement…
      </section>
    );

  const { school, totals } = d;
  const seatsUsed = totals.eleves;
  const seatsPlan = school.nb_students || 0;
  const pct = seatsPlan > 0 ? Math.min(100, (seatsUsed / seatsPlan) * 100) : 0;

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10 animate-fade-in">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">
          espace école
        </p>
        <h1 className="mt-3 font-serif text-3xl">{school.name}</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Responsable : {school.contact_name} · {school.contact_email}
        </p>
      </header>

      {/* Stats + seat gauge */}
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Classes" value={String(totals.classes)} sub={`plan : ${school.nb_classes}`} />
        <Stat label="Formateurs" value={String(totals.formateurs)} />
        <Stat label="Élèves créés" value={String(seatsUsed)} sub={`plan : ${seatsPlan}`} />
        <div className="rounded-xl border border-rule bg-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
            sièges utilisés
          </p>
          <p className="mt-2 font-serif text-2xl">
            {seatsUsed}
            <span className="text-ink-soft"> / {seatsPlan}</span>
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-paper-deep">
            <div
              className={
                "h-full rounded-full transition-all " +
                (pct > 90 ? "bg-destructive" : "bg-copper")
              }
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex gap-1 border-b border-rule">
        {(["classes", "formateurs", "plan"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "px-4 py-2.5 text-sm capitalize transition-colors " +
              (tab === t
                ? "border-b-2 border-copper font-medium text-ink"
                : "text-ink-soft hover:text-ink")
            }
          >
            {t === "plan" ? "Mon plan" : t}
          </button>
        ))}
      </nav>

      {tab === "classes" && <ClassesTab data={d} reload={load} />}
      {tab === "formateurs" && <FormateursTab data={d} reload={load} />}
      {tab === "plan" && <PlanTab data={d} reload={load} />}
    </section>
  );
}

/* ---------------- Classes ---------------- */

function ClassesTab({ data, reload }: { data: Data; reload: () => void }) {
  const createCls = useServerFn(createSchoolClass);
  const delCls = useServerFn(deleteSchoolClass);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [openStudents, setOpenStudents] = useState<ClassRow | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await createCls({ data: { name: name.trim() } });
      setName("");
      reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }
  async function onDelete(c: ClassRow) {
    if (!confirm(`Supprimer la classe « ${c.name} » ?`)) return;
    await delCls({ data: { classId: c.id } });
    reload();
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
      <div className="rounded-xl border border-rule bg-card p-6">
        <h2 className="font-serif text-xl">Créer une classe</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Ex : « CM2 A », « 6ème 3 ». Vous pourrez y ajouter des élèves ensuite.
        </p>
        <form onSubmit={onCreate} className="mt-4 grid gap-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de la classe"
            className="rounded-md border border-rule bg-paper px-3 py-2"
          />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button
            disabled={busy}
            className="rounded-md bg-copper px-4 py-2.5 text-sm font-medium text-white hover:bg-copper-deep disabled:opacity-60"
          >
            Créer la classe
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-rule bg-card p-6">
        <h2 className="font-serif text-xl">Classes ({data.classes.length})</h2>
        {data.classes.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">Aucune classe pour l&apos;instant.</p>
        ) : (
          <ul className="mt-4 divide-y divide-rule">
            {data.classes.map((c) => (
              <li key={c.id} className="grid gap-1 py-3 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-ink-soft">
                    {c.student_count} élève{c.student_count > 1 ? "s" : ""} · code{" "}
                    <span className="font-mono">{c.join_code}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOpenStudents(c)}
                    className="rounded-md border border-rule px-3 py-1.5 text-xs hover:bg-paper-deep"
                  >
                    + Élèves
                  </button>
                  <button
                    onClick={() => onDelete(c)}
                    className="rounded-md border border-destructive/40 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/5"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {openStudents && (
        <StudentDialog
          klass={openStudents}
          onClose={() => {
            setOpenStudents(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

function StudentDialog({ klass, onClose }: { klass: ClassRow; onClose: () => void }) {
  const create = useServerFn(createStudents);
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState("eleve");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<
    { username: string; email: string; password: string }[] | null
  >(null);

  async function onGo() {
    setBusy(true);
    setErr(null);
    try {
      const r = await create({ data: { classId: klass.id, count, prefix } });
      setResult(r.students);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function copyAll() {
    if (!result) return;
    const txt = result
      .map((s) => `${s.username}\t${s.password}`)
      .join("\n");
    navigator.clipboard.writeText(txt);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-paper p-6 shadow-2xl">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-copper-deep">
              nouveaux comptes élèves
            </p>
            <h3 className="font-serif text-2xl">{klass.name}</h3>
          </div>
          <button onClick={onClose} className="text-ink-soft hover:text-ink">
            ✕
          </button>
        </div>

        {!result && (
          <div className="mt-5 grid gap-4">
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink-soft">Préfixe des identifiants</span>
              <input
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="rounded-md border border-rule bg-card px-3 py-2 font-mono"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink-soft">Combien d&apos;élèves ? (max 60)</span>
              <input
                type="number"
                min={1}
                max={60}
                value={count}
                onChange={(e) => setCount(Number(e.target.value) || 1)}
                className="rounded-md border border-rule bg-card px-3 py-2"
              />
            </label>
            <p className="text-xs text-ink-soft">
              Les élèves se connectent avec leur <strong>identifiant</strong>{" "}
              (pas d&apos;email personnel) et le mot de passe imprimé ci-dessous.
              Les identifiants ne sont plus affichés une fois cette fenêtre fermée.
            </p>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <button
              disabled={busy}
              onClick={onGo}
              className="rounded-md bg-copper px-4 py-2.5 text-sm font-medium text-paper hover:bg-copper-deep disabled:opacity-60"
            >
              {busy ? "Création…" : `Créer ${count} compte${count > 1 ? "s" : ""}`}
            </button>
          </div>
        )}

        {result && (
          <div className="mt-5 grid gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-soft">
                {result.length} compte{result.length > 1 ? "s" : ""} créé
                {result.length > 1 ? "s" : ""}.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={copyAll}
                  className="rounded-md border border-rule px-3 py-1.5 text-xs hover:bg-paper-deep"
                >
                  Copier
                </button>
                <button
                  onClick={() => window.print()}
                  className="rounded-md border border-rule px-3 py-1.5 text-xs hover:bg-paper-deep"
                >
                  Imprimer
                </button>
              </div>
            </div>
            <div className="max-h-72 overflow-auto rounded-md border border-rule">
              <table className="w-full text-sm">
                <thead className="bg-paper-deep text-left text-xs uppercase tracking-wider text-ink-soft">
                  <tr>
                    <th className="px-3 py-2">Identifiant</th>
                    <th className="px-3 py-2">Mot de passe</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {result.map((s) => (
                    <tr key={s.username} className="border-t border-rule">
                      <td className="px-3 py-2">{s.username}</td>
                      <td className="px-3 py-2">{s.password}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={onClose}
              className="rounded-md bg-copper px-4 py-2.5 text-sm font-medium text-white hover:bg-copper-deep"
            >
              J&apos;ai imprimé, fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Formateurs ---------------- */

function FormateursTab({ data, reload }: { data: Data; reload: () => void }) {
  const create = useServerFn(createFormateur);
  const [form, setForm] = useState({ displayName: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [gen, setGen] = useState<{ email: string; password: string } | null>(null);
  const formateurs = data.members.filter((m) => m.role === "formateur");

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await create({
        data: {
          email: form.email.trim(),
          displayName: form.displayName.trim(),
          password: form.password.trim() || undefined,
        },
      });
      setGen({ email: r.email, password: r.password });
      setForm({ displayName: "", email: "", password: "" });
      reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
      <div className="rounded-xl border border-rule bg-card p-6">
        <h2 className="font-serif text-xl">Ajouter un formateur</h2>
        <form onSubmit={onCreate} className="mt-4 grid gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-soft">Nom de l&apos;enseignant·e</span>
            <input
              required
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="rounded-md border border-rule bg-paper px-3 py-2"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-soft">Email professionnel</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-md border border-rule bg-paper px-3 py-2"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-soft">Mot de passe (laisser vide pour générer)</span>
            <input
              type="text"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-md border border-rule bg-paper px-3 py-2 font-mono"
            />
          </label>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button
            disabled={busy}
            className="rounded-md bg-copper px-4 py-2.5 text-sm font-medium text-paper hover:bg-copper-deep disabled:opacity-60"
          >
            Créer le compte formateur
          </button>
        </form>
        {gen && (
          <div className="mt-4 rounded-md border border-copper bg-paper-deep p-3 text-sm">
            <p className="font-mono text-[10px] uppercase tracking-wider text-copper-deep">
              identifiants à transmettre
            </p>
            <p className="mt-1">
              <span className="text-ink-soft">Email : </span>
              {gen.email}
            </p>
            <p>
              <span className="text-ink-soft">Mot de passe : </span>
              <strong className="font-mono">{gen.password}</strong>
            </p>
            <button
              onClick={() => setGen(null)}
              className="mt-2 text-xs text-ink-soft underline"
            >
              Fermer
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-rule bg-card p-6">
        <h2 className="font-serif text-xl">Formateurs ({formateurs.length})</h2>
        {formateurs.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">
            Aucun formateur pour l&apos;instant.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-rule">
            {formateurs.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-3 text-sm">
                <span>{m.display_name ?? "—"}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                  formateur
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------- Plan ---------------- */

function PlanTab({ data, reload }: { data: Data; reload: () => void }) {
  const req = useServerFn(requestSchoolUpgrade);
  const [msg, setMsg] = useState(
    `Nous souhaitons passer à ${data.school.nb_classes + 5} classes environ.`,
  );
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const s = data.school;
  const requested = s.upgrade_requested_at;

  async function onSend() {
    setBusy(true);
    setErr(null);
    try {
      await req({ data: { message: msg } });
      setOk(true);
      reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-rule bg-card p-6">
        <h2 className="font-serif text-xl">Plan actuel</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <Row k="Formule" v={s.billing_cycle === "yearly" ? "Annuelle (9 mois)" : "Mensuelle"} />
          <Row k="Prix" v={s.billing_cycle === "yearly" ? "1 150 € / an" : "115 € / mois"} />
          <Row k="Classes incluses" v={`${s.nb_classes} (élèves illimités par classe*)`} />
          <Row k="Prochaine échéance" v={s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("fr-FR") : "—"} />
        </dl>
        <p className="mt-4 text-xs text-ink-soft">
          * Prix indépendant du nombre d&apos;élèves. Seul le nombre de classes
          détermine la formule.
        </p>
      </div>

      <div className="rounded-xl border border-rule bg-card p-6">
        <h2 className="font-serif text-xl">Ajouter des classes</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Envoyez-nous votre besoin. Nous ajustons votre plan manuellement
          (règlement hors ligne pour l&apos;instant).
        </p>
        {requested && !ok ? (
          <p className="mt-4 rounded-md border border-copper bg-paper-deep p-3 text-sm">
            Demande envoyée le{" "}
            {new Date(requested).toLocaleDateString("fr-FR")}. Nous revenons
            vers vous sous 48h.
          </p>
        ) : ok ? (
          <p className="mt-4 rounded-md border border-copper bg-paper-deep p-3 text-sm">
            Merci, votre demande est bien enregistrée.
          </p>
        ) : (
          <>
            <textarea
              rows={5}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="mt-4 w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm"
            />
            {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
            <button
              disabled={busy}
              onClick={onSend}
              className="mt-3 w-full rounded-md bg-copper px-4 py-2.5 text-sm font-medium text-paper hover:bg-copper-deep disabled:opacity-60"
            >
              Envoyer la demande
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-rule bg-card p-5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-rule/60 pb-2 last:border-0 last:pb-0">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
        {k}
      </dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}
