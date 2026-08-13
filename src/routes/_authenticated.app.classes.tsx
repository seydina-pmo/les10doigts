import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchRole, type AppRole } from "@/lib/auth";
import { bestPerLevel, tierFor, TIER_LABEL, TIER_COLOR } from "@/lib/certification";

export const Route = createFileRoute("/_authenticated/app/classes")({
  head: () => ({ meta: [{ title: "Classes, La Méthode des 10 Doigts" }] }),
  component: ClassesPage,
});

type ClassRow = { id: string; name: string; join_code: string; created_at: string };

function ClassesPage() {
  const [role, setRole] = useState<AppRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      setRole(await fetchRole(data.user.id));
    });
  }, []);

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">
          {role === "formateur" ? "espace formateur" : "ma classe"}
        </p>
        <h1 className="mt-2 font-serif text-3xl">
          {role === "formateur" ? "Mes classes" : "Rejoindre une classe"}
        </h1>
      </div>

      {!userId ? (
        <p className="font-mono text-sm text-ink-soft">chargement…</p>
      ) : role === "formateur" ? (
        <FormateurView userId={userId} />
      ) : (
        <EleveView userId={userId} />
      )}
    </section>
  );
}

// ---------- Formateur ----------

function FormateurView({ userId }: { userId: string }) {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("classes")
      .select("id, name, join_code, created_at")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });
    setClasses((data as ClassRow[] | null) ?? []);
    if (data && data[0] && !selected) setSelected(data[0].id);
  }, [userId, selected]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createClass(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setErr(null);
    const code = Array.from({ length: 6 }, () =>
      "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)],
    ).join("");
    const { error } = await supabase
      .from("classes")
      .insert({ owner_id: userId, name: name.trim(), join_code: code });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setName("");
    await load();
  }

  async function removeClass(id: string) {
    if (!confirm("Supprimer cette classe ?")) return;
    await supabase.from("classes").delete().eq("id", id);
    if (selected === id) setSelected(null);
    await load();
  }

  return (
    <>
      <form
        onSubmit={createClass}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-rule bg-card p-5"
      >
        <div className="flex-1">
          <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            Nom de la classe
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="6e B, Atelier saisie, Promo 2026…"
            className="mt-1 w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm"
          />
        </div>
        <button
          disabled={busy}
          className="rounded-md bg-copper px-4 py-2 text-sm font-medium text-paper hover:bg-copper-deep disabled:opacity-50"
        >
          Créer la classe
        </button>
        {err && <p className="basis-full text-sm text-destructive">{err}</p>}
      </form>

      {classes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-rule bg-card p-8 text-center text-ink-soft">
          Aucune classe pour l&apos;instant. Créez votre première classe ci-dessus.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <ul className="space-y-2">
            {classes.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setSelected(c.id)}
                  className={
                    "w-full rounded-xl border bg-card px-4 py-3 text-left transition " +
                    (selected === c.id
                      ? "border-copper"
                      : "border-rule hover:border-ink-soft")
                  }
                >
                  <p className="font-serif text-lg">{c.name}</p>
                  <p className="mt-1 font-mono text-xs text-ink-soft">
                    code : <span className="text-foreground">{c.join_code}</span>
                  </p>
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <ClassDetail
              classRow={classes.find((c) => c.id === selected)!}
              onDelete={() => removeClass(selected)}
            />
          )}
        </div>
      )}
    </>
  );
}

function ClassDetail({ classRow, onDelete }: { classRow: ClassRow; onDelete: () => void }) {
  type Member = {
    user_id: string;
    display_name: string | null;
    attempts: { level: number; mpm: number; accuracy: number }[];
  };
  const [members, setMembers] = useState<Member[] | null>(null);

  useEffect(() => {
    void (async () => {
      setMembers(null);
      const { data: mems } = await supabase
        .from("class_members")
        .select("user_id")
        .eq("class_id", classRow.id);
      const ids = (mems ?? []).map((m) => m.user_id as string);
      if (ids.length === 0) {
        setMembers([]);
        return;
      }
      const [{ data: profiles }, { data: attempts }] = await Promise.all([
        supabase.from("profiles").select("id, display_name").in("id", ids),
        supabase
          .from("lesson_attempts")
          .select("user_id, level, mpm, accuracy")
          .in("user_id", ids),
      ]);
      const byUser = new Map<string, Member>();
      ids.forEach((id) =>
        byUser.set(id, {
          user_id: id,
          display_name: profiles?.find((p) => p.id === id)?.display_name ?? null,
          attempts: [],
        }),
      );
      (attempts ?? []).forEach((a) => {
        const m = byUser.get(a.user_id as string);
        if (m) m.attempts.push({ level: a.level, mpm: a.mpm, accuracy: Number(a.accuracy) });
      });
      setMembers([...byUser.values()]);
    })();
  }, [classRow.id]);

  return (
    <div className="rounded-2xl border border-rule bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl">{classRow.name}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Code d&apos;invitation :{" "}
            <span className="rounded bg-paper-deep px-2 py-0.5 font-mono text-foreground">
              {classRow.join_code}
            </span>
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            Communiquez ce code à vos élèves pour qu&apos;ils rejoignent la classe.
          </p>
        </div>
        <button
          onClick={onDelete}
          className="rounded-md border border-rule px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
        >
          Supprimer
        </button>
      </div>

      <div className="mt-6">
        {members === null ? (
          <p className="font-mono text-sm text-ink-soft">chargement…</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-ink-soft">Aucun élève inscrit pour l&apos;instant.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
              <tr>
                <th className="py-2">Élève</th>
                <th>Niveaux validés</th>
                <th>MPM moyen</th>
                <th>Précision</th>
                <th>Certification</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const best = bestPerLevel(m.attempts);
                const avgM =
                  best.size === 0
                    ? 0
                    : Math.round(
                        [...best.values()].reduce((s, a) => s + a.mpm, 0) / best.size,
                      );
                const avgA =
                  best.size === 0
                    ? 0
                    : Math.round(
                        [...best.values()].reduce((s, a) => s + a.accuracy, 0) / best.size,
                      );
                const t = tierFor(m.attempts);
                return (
                  <tr key={m.user_id} className="border-t border-rule/60">
                    <td className="py-2">{m.display_name ?? "élève"}</td>
                    <td>{best.size} / 100</td>
                    <td>{avgM}</td>
                    <td>{avgA}%</td>
                    <td>
                      {t ? (
                        <span style={{ color: TIER_COLOR[t] }}>{TIER_LABEL[t]}</span>
                      ) : (
                        <span className="text-ink-soft">–</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ---------- Élève / particulier ----------

function EleveView({ userId }: { userId: string }) {
  type Mine = { class_id: string; classes: { name: string; join_code: string } | null };
  const [mine, setMine] = useState<Mine[]>([]);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("class_members")
      .select("class_id, classes (name, join_code)")
      .eq("user_id", userId);
    setMine((data as unknown as Mine[]) ?? []);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const c = code.trim().toUpperCase();
    const { error } = await supabase.rpc("join_class_by_code", { _code: c });
    setBusy(false);
    if (error) {
      setErr(error.message.includes("code_not_found") ? "Code introuvable." : error.message);
      return;
    }
    setCode("");
    await load();
  }


  async function leave(classId: string) {
    await supabase.from("class_members").delete().eq("class_id", classId).eq("user_id", userId);
    await load();
  }

  return (
    <>
      <form
        onSubmit={join}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-rule bg-card p-5"
      >
        <div className="flex-1">
          <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            Code d&apos;invitation
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            className="mt-1 w-full rounded-md border border-rule bg-paper px-3 py-2 font-mono uppercase tracking-widest"
          />
        </div>
        <button
          disabled={busy}
          className="rounded-md bg-copper px-4 py-2 text-sm font-medium text-paper hover:bg-copper-deep disabled:opacity-50"
        >
          Rejoindre
        </button>
        {err && <p className="basis-full text-sm text-destructive">{err}</p>}
      </form>

      {mine.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-rule bg-card p-8 text-center text-ink-soft">
          Vous n&apos;êtes inscrit à aucune classe. Demandez son code à votre formateur.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {mine.map((m) => (
            <li
              key={m.class_id}
              className="flex items-center justify-between rounded-2xl border border-rule bg-card p-5"
            >
              <div>
                <p className="font-serif text-lg">{m.classes?.name ?? "Classe"}</p>
                <p className="mt-1 font-mono text-xs text-ink-soft">
                  code : {m.classes?.join_code}
                </p>
              </div>
              <button
                onClick={() => leave(m.class_id)}
                className="rounded-md border border-rule px-3 py-1.5 text-sm hover:bg-paper-deep"
              >
                Quitter
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
