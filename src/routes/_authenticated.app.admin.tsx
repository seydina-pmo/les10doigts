import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  bootstrapSuperAdmin,
  listSchools,
  activateSchool,
  rejectSchool,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/app/admin")({
  head: () => ({ meta: [{ title: "Admin, La Méthode des 10 Doigts" }] }),
  component: AdminPage,
});

type School = {
  id: string;
  name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  nb_classes: number;
  nb_students: number;
  message: string | null;
  status: string;
  admin_user_id: string | null;
  activated_at: string | null;
  created_at: string;
};

function AdminPage() {
  const list = useServerFn(listSchools);
  const bootstrap = useServerFn(bootstrapSuperAdmin);
  const activate = useServerFn(activateSchool);
  const reject = useServerFn(rejectSchool);

  const [schools, setSchools] = useState<School[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  async function load() {
    setErr(null);
    try {
      const d = await list();
      setSchools(d as School[]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onBootstrap() {
    setBusy(true);
    setErr(null);
    try {
      await bootstrap();
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onActivate(id: string) {
    if (!confirm("Activer cette école et générer les identifiants du responsable ?")) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await activate({ data: { schoolId: id } });
      setCredentials({ email: r.email, password: r.password });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onReject(id: string) {
    if (!confirm("Refuser définitivement cette demande ?")) return;
    setBusy(true);
    try {
      await reject({ data: { schoolId: id } });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const notSuperAdmin =
    err && err.toLowerCase().includes("forbidden");

  return (
    <section className="mx-auto max-w-6xl px-6 py-10 animate-fade-in">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">
        super admin
      </p>
      <h1 className="mt-3 font-serif text-3xl">Demandes d&apos;école</h1>

      {notSuperAdmin && (
        <div className="mt-6 rounded-xl border border-rule bg-card p-6">
          <p className="text-sm text-ink-soft">
            Aucun accès super admin détecté. Si vous êtes la première personne
            à ouvrir cette page (bootstrap), cliquez ci-dessous — c&apos;est un
            usage unique.
          </p>
          <button
            onClick={onBootstrap}
            disabled={busy}
            className="mt-4 rounded-md bg-copper px-4 py-2 text-sm font-medium text-white hover:bg-copper-deep disabled:opacity-60"
          >
            Devenir super admin
          </button>
          {err && !notSuperAdmin && (
            <p className="mt-3 text-sm text-destructive">{err}</p>
          )}
        </div>
      )}

      {credentials && (
        <div className="mt-6 rounded-xl border border-copper bg-card p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-copper-deep">
            identifiants générés — à transmettre à l&apos;école
          </p>
          <div className="mt-3 grid gap-1 font-mono text-sm">
            <div>
              <span className="text-ink-soft">Email : </span>
              {credentials.email}
            </div>
            <div>
              <span className="text-ink-soft">Mot de passe : </span>
              <strong>{credentials.password}</strong>
            </div>
          </div>
          <button
            onClick={() => setCredentials(null)}
            className="mt-4 text-xs text-ink-soft underline"
          >
            Fermer
          </button>
        </div>
      )}

      {!notSuperAdmin && err && (
        <p className="mt-4 text-sm text-destructive">{err}</p>
      )}

      {schools && (
        <div className="mt-8 grid gap-4">
          {schools.length === 0 && (
            <p className="text-sm text-ink-soft">Aucune demande pour l&apos;instant.</p>
          )}
          {schools.map((s) => (
            <article
              key={s.id}
              className="rounded-xl border border-rule bg-card p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-serif text-lg">{s.name}</h2>
                <StatusBadge status={s.status} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-ink-soft md:grid-cols-4">
                <Info label="Responsable" v={s.contact_name} />
                <Info label="Email" v={s.contact_email} />
                <Info label="Téléphone" v={s.contact_phone ?? "—"} />
                <Info label="Adresse" v={s.address ?? "—"} />
                <Info label="Classes" v={String(s.nb_classes)} />
                <Info label="Élèves" v={String(s.nb_students)} />
                <Info
                  label="Reçue le"
                  v={new Date(s.created_at).toLocaleDateString("fr-FR")}
                />
              </dl>
              {s.message && (
                <p className="mt-3 rounded-md bg-paper-deep p-3 text-sm">
                  « {s.message} »
                </p>
              )}
              {s.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <button
                    disabled={busy}
                    onClick={() => onActivate(s.id)}
                    className="rounded-md bg-copper px-4 py-2 text-sm font-medium text-paper hover:bg-copper-deep disabled:opacity-60"
                  >
                    Activer
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => onReject(s.id)}
                    className="rounded-md border border-rule px-4 py-2 text-sm hover:bg-paper-deep disabled:opacity-60"
                  >
                    Refuser
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Info({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-wider">{label}</dt>
      <dd className="text-foreground">{v}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-paper-deep text-ink-soft",
    active: "bg-copper text-paper",
    rejected: "bg-destructive/10 text-destructive",
  };
  const label: Record<string, string> = {
    pending: "en attente",
    active: "activée",
    rejected: "refusée",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${
        map[status] ?? "bg-paper-deep"
      }`}
    >
      {label[status] ?? status}
    </span>
  );
}
