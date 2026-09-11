import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  bootstrapSuperAdmin,
  listSchools,
  activateSchool,
  rejectSchool,
} from "@/lib/admin.functions";
import { replyToMessage, notifySchool } from "@/lib/email.functions";

export const Route = createFileRoute("/_authenticated/app/admin")({
  head: () => ({ meta: [{ title: "Admin — La Méthode des 10 Doigts" }] }),
  component: AdminPage,
});

/* ---------- types ---------- */

type Tab = "overview" | "users" | "subscriptions" | "messages" | "schools";

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

type Profile = {
  id: string;
  display_name: string | null;
  email: string | null;
  created_at: string;
  disabled_at: string | null;
};

type Sub = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
};

type Attempt = {
  user_id: string;
  level: number;
  mpm: number;
  accuracy: number;
  created_at: string;
};

type UserRole = {
  user_id: string;
  role: string;
};

type ContactMsg = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  replied_at: string | null;
  reply_text: string | null;
  created_at: string;
};

/* ---------- main page ---------- */

function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Server functions for schools
  const list = useServerFn(listSchools);
  const bootstrap = useServerFn(bootstrapSuperAdmin);
  const activate = useServerFn(activateSchool);
  const reject = useServerFn(rejectSchool);

  // Data
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [credentials, setCreds] = useState<{ email: string; password: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Check admin role + load data
  useEffect(() => {
    void (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        if (!sess.session) { setIsAdmin(false); return; }
        const uid = sess.session.user.id;

        const { data: r } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid)
          .eq("role", "super_admin")
          .maybeSingle();

        if (!r) { setIsAdmin(false); return; }
        setIsAdmin(true);

        // Load all data in parallel
        const [pRes, rRes, sRes, aRes, mRes] = await Promise.all([
          supabase.from("profiles").select("id, display_name, email, created_at, disabled_at").order("created_at", { ascending: false }),
          supabase.from("user_roles").select("user_id, role"),
          supabase.from("subscriptions").select("id, user_id, plan, status, current_period_end, created_at").order("created_at", { ascending: false }),
          supabase.from("lesson_attempts").select("user_id, level, mpm, accuracy, created_at").order("created_at", { ascending: false }).limit(2000),
          supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
        ]);

        setProfiles((pRes.data as Profile[]) ?? []);
        setRoles((rRes.data as UserRole[]) ?? []);
        setSubs((sRes.data as Sub[]) ?? []);
        setAttempts((aRes.data as Attempt[]) ?? []);
        setMessages((mRes.data as ContactMsg[]) ?? []);

        // Schools via server function
        try {
          const s = await list();
          setSchools(s as School[]);
        } catch { /* ignore if schools fail */ }
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bootstrap handler
  async function onBootstrap() {
    setBusy(true); setErr(null);
    try {
      await bootstrap();
      window.location.reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  // Not admin
  if (isAdmin === false) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-16 text-center animate-fade-in">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-[#4361ee]/10">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#4361ee]" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl text-[#1e3a5f]">Accès réservé</h1>
        <p className="mt-3 text-[#5a7a9a]">
          Cette page est réservée aux super administrateurs.
        </p>
        <button
          onClick={onBootstrap}
          disabled={busy}
          className="mt-6 rounded-md bg-[#4361ee] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#3451d1] disabled:opacity-60"
        >
          Devenir super admin (premier usage)
        </button>
        {err && <p className="mt-3 text-sm text-red-500">{err}</p>}
      </section>
    );
  }

  if (loading || isAdmin === null) {
    return (
      <section className="grid min-h-[400px] place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e2e8f0] border-t-[#4361ee]" />
          <p className="font-mono text-xs text-[#5a7a9a]">chargement admin…</p>
        </div>
      </section>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Vue d'ensemble", icon: "📊" },
    { id: "users", label: "Utilisateurs", icon: "👥" },
    { id: "subscriptions", label: "Abonnements", icon: "💳" },
    { id: "messages", label: `Messages (${messages.length})`, icon: "✉️" },
    { id: "schools", label: "Écoles", icon: "🏫" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-8 animate-fade-in">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4361ee]">super admin</p>
          <h1 className="mt-2 font-serif text-3xl text-[#1e3a5f]">Centre de contrôle</h1>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md border border-[#e2e8f0] px-3 py-1.5 text-xs text-[#5a7a9a] hover:bg-[#f1f5f9]"
        >
          ↻ Rafraîchir
        </button>
      </div>

      {/* Tab bar */}
      <nav className="mt-6 flex gap-1 border-b border-[#e2e8f0]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              "px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px " +
              (tab === t.id
                ? "border-[#4361ee] text-[#4361ee]"
                : "border-transparent text-[#5a7a9a] hover:text-[#1e3a5f]")
            }
          >
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      {err && <p className="mt-4 text-sm text-red-500">{err}</p>}

      {/* Tab content */}
      <div className="mt-6">
        {tab === "overview" && (
          <OverviewTab profiles={profiles} roles={roles} subs={subs} attempts={attempts} schools={schools} messages={messages} />
        )}
        {tab === "users" && (
          <UsersTab profiles={profiles} roles={roles} attempts={attempts} subs={subs} />
        )}
        {tab === "subscriptions" && (
          <SubscriptionsTab subs={subs} profiles={profiles} />
        )}
        {tab === "messages" && (
          <MessagesTab messages={messages} />
        )}
        {tab === "schools" && (
          <SchoolsTab
            schools={schools}
            busy={busy}
            credentials={credentials}
            onActivate={async (id) => {
              setBusy(true); setErr(null);
              try {
                const r = await activate({ data: { schoolId: id } });
                setCreds({ email: r.email, password: r.password });
                const s = await list();
                setSchools(s as School[]);
              } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
              finally { setBusy(false); }
            }}
            onReject={async (id) => {
              if (!confirm("Refuser cette demande ?")) return;
              setBusy(true);
              try {
                await reject({ data: { schoolId: id } });
                const s = await list();
                setSchools(s as School[]);
              } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
              finally { setBusy(false); }
            }}
            onCloseCreds={() => setCreds(null)}
          />
        )}
      </div>
    </section>
  );
}

/* ================================================== */
/*  TAB 1 — OVERVIEW                                  */
/* ================================================== */

function OverviewTab({
  profiles, roles, subs, attempts, schools, messages,
}: {
  profiles: Profile[]; roles: UserRole[]; subs: Sub[]; attempts: Attempt[]; schools: School[]; messages: ContactMsg[];
}) {
  const activeSubs = subs.filter((s) => s.status === "active").length;
  const pendingSchools = schools.filter((s) => s.status === "pending").length;
  const activeSchools = schools.filter((s) => s.status === "active").length;
  const totalLessons = attempts.length;
  const revenue = activeSubs * 10 + activeSchools * 115;

  // Recent signups (last 7 days)
  const week = Date.now() - 7 * 86400000;
  const recentUsers = profiles.filter((p) => new Date(p.created_at).getTime() > week).length;
  const recentAttempts = attempts.filter((a) => new Date(a.created_at).getTime() > week).length;

  const kpis = [
    { label: "Utilisateurs", value: profiles.length, sub: `+${recentUsers} cette semaine`, color: "#4361ee" },
    { label: "Abonnés actifs", value: activeSubs, sub: `${subs.length} total`, color: "#10b981" },
    { label: "Revenus estimés", value: `${revenue} €`, sub: "par mois", color: "#f59e0b" },
    { label: "Niveaux complétés", value: totalLessons, sub: `+${recentAttempts} cette semaine`, color: "#8b5cf6" },
    { label: "Messages", value: messages.length, sub: "messages reçus", color: "#06b6d4" },
    { label: "Écoles actives", value: activeSchools, sub: `${pendingSchools} en attente`, color: "#ec4899" },
  ];

  // Top users by lessons done
  const userLessons: Record<string, number> = {};
  for (const a of attempts) userLessons[a.user_id] = (userLessons[a.user_id] ?? 0) + 1;
  const topUsers = Object.entries(userLessons)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5a7a9a]">{k.label}</p>
            <p className="mt-2 font-serif text-3xl" style={{ color: k.color }}>{k.value}</p>
            <p className="mt-1 text-xs text-[#5a7a9a]">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent activity + Top users side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent signups */}
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
          <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-[#5a7a9a]">
            Dernières inscriptions
          </h3>
          <div className="mt-4 divide-y divide-[#f1f5f9]">
            {profiles.slice(0, 8).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-[#1e3a5f]">{p.display_name || "—"}</p>
                  <p className="text-xs text-[#5a7a9a]">{p.email}</p>
                </div>
                <span className="text-xs text-[#5a7a9a]">
                  {new Date(p.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top active users */}
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
          <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-[#5a7a9a]">
            Utilisateurs les plus actifs
          </h3>
          <div className="mt-4 divide-y divide-[#f1f5f9]">
            {topUsers.map(([uid, count], i) => {
              const p = profiles.find((x) => x.id === uid);
              const isSuperAdmin = roles.some((r) => r.user_id === uid && r.role === "super_admin");
              const displayName = p?.display_name || p?.email || (isSuperAdmin ? "Super Admin" : `Utilisateur (${uid.slice(0, 8)})`);
              return (
                <div key={uid} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#4361ee]/10 text-xs font-bold text-[#4361ee]">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#1e3a5f]">{displayName}</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#4361ee]">{count} niveaux</span>
                </div>
              );
            })}
            {topUsers.length === 0 && (
              <p className="py-4 text-center text-sm text-[#5a7a9a]">Aucune activité encore</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================== */
/*  TAB — MESSAGES                                     */
/* ================================================== */

function MessagesTab({ messages }: { messages: ContactMsg[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const reply = useServerFn(replyToMessage);

  const unreplied = messages.filter((m) => !m.replied_at);
  const replied = messages.filter((m) => !!m.replied_at);

  async function deleteMsg(id: string) {
    if (!confirm("Supprimer ce message définitivement ?")) return;
    setSending(true);
    try {
      await supabase.from("contact_messages").delete().eq("id", id);
      window.location.reload();
    } catch (e) {
      alert("Erreur : " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSending(false);
    }
  }

  async function handleSend(m: ContactMsg) {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await reply({ data: { to: m.email, subject: "Re: " + (m.subject || "Votre message"), body: replyText, originalMessage: m.message } });
      // Mark as replied in DB
      await supabase.from("contact_messages").update({ replied_at: new Date().toISOString(), reply_text: replyText }).eq("id", m.id);
      setReplyTo(null);
      setReplyText("");
      alert("✅ Email envoyé depuis contact@les10doigts.com !");
      window.location.reload();
    } catch (e) {
      alert("❌ Erreur : " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSending(false);
    }
  }

  function renderCard(m: ContactMsg) {
    return (
      <article
        key={m.id}
        className={"rounded-xl border bg-white transition-shadow " + (expanded === m.id ? "border-[#4361ee] shadow-md" : "border-[#e2e8f0]")}
      >
        <button
          onClick={() => setExpanded(expanded === m.id ? null : m.id)}
          className="flex w-full items-center justify-between p-5 text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <p className="font-medium text-[#1e3a5f] truncate">{m.name}</p>
              <span className="text-xs text-[#5a7a9a]">{m.email}</span>
              {m.replied_at && <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-mono uppercase text-[#16a34a]">✓ répondu</span>}
            </div>
            {m.subject && <p className="mt-1 text-sm text-[#5a7a9a] truncate">{m.subject}</p>}
          </div>
          <span className="ml-4 flex shrink-0 items-center gap-2">
            <span className="text-xs text-[#5a7a9a]">
              {new Date(m.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); deleteMsg(m.id); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); deleteMsg(m.id); } }}
              title="Supprimer ce message"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#dc2626] hover:bg-[#fee2e2] transition cursor-pointer"
            >
              🗑
            </span>
          </span>
        </button>
        {expanded === m.id && (
          <div className="border-t border-[#e2e8f0] px-5 py-4">
            <p className="whitespace-pre-wrap text-sm text-[#1e3a5f] leading-relaxed">{m.message}</p>
            {m.reply_text && (
              <div className="mt-3 rounded-md border border-[#10b981]/30 bg-[#ecfdf5] p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#10b981] font-bold mb-1">Votre réponse ({new Date(m.replied_at!).toLocaleDateString("fr-FR")})</p>
                <p className="whitespace-pre-wrap text-sm text-[#1e3a5f]">{m.reply_text}</p>
              </div>
            )}
            {!m.replied_at && (
              replyTo === m.id ? (
                <div className="mt-4 space-y-3">
                  <textarea
                    autoFocus
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Votre réponse..."
                    rows={4}
                    className="w-full rounded-md border border-[#e2e8f0] p-3 text-sm focus:border-[#4361ee] focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={sending || !replyText.trim()}
                      onClick={() => handleSend(m)}
                      className="rounded-md bg-[#4361ee] px-4 py-2 text-sm font-medium text-white hover:bg-[#3451d1] disabled:opacity-60"
                    >
                      {sending ? "Envoi..." : "✉️ Envoyer depuis contact@les10doigts.com"}
                    </button>
                    <button
                      onClick={() => { setReplyTo(null); setReplyText(""); }}
                      className="rounded-md border border-[#e2e8f0] px-3 py-2 text-xs text-[#5a7a9a] hover:bg-[#f1f5f9]"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReplyTo(m.id)}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#4361ee] px-4 py-2 text-sm font-medium text-white hover:bg-[#3451d1]"
                >
                  ✉️ Répondre
                </button>
              )
            )}
          </div>
        )}
      </article>
    );
  }

  return (
    <div>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5a7a9a]">Non lus</p>
          <p className="mt-2 font-serif text-3xl text-[#ef4444]">{unreplied.length}</p>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5a7a9a]">Répondus</p>
          <p className="mt-2 font-serif text-3xl text-[#10b981]">{replied.length}</p>
        </div>
      </div>

      {unreplied.length > 0 && (
        <div className="mb-6">
          <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-[#ef4444] font-bold mb-3">
            📨 Messages non répondus ({unreplied.length})
          </h3>
          <div className="space-y-3">
            {unreplied.map((m) => renderCard(m))}
          </div>
        </div>
      )}

      {replied.length > 0 && (
        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-[#10b981] font-bold mb-3">
            ✅ Messages répondus ({replied.length})
          </h3>
          <div className="space-y-3">
            {replied.map((m) => renderCard(m))}
          </div>
        </div>
      )}

      {messages.length === 0 && (
        <p className="py-8 text-center text-sm text-[#5a7a9a]">Aucun message reçu pour l'instant.</p>
      )}
    </div>
  );
}

/* ================================================== */
/*  TAB 2 — USERS                                     */
/* ================================================== */

function UsersTab({
  profiles, roles, attempts, subs,
}: {
  profiles: Profile[]; roles: UserRole[]; attempts: Attempt[]; subs: Sub[];
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  const roleMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const r of roles) m[r.user_id] = r.role;
    return m;
  }, [roles]);

  const lessonCount = useMemo(() => {
    const m: Record<string, number> = {};
    for (const a of attempts) m[a.user_id] = (m[a.user_id] ?? 0) + 1;
    return m;
  }, [attempts]);

  const subMap = useMemo(() => {
    const m: Record<string, Sub> = {};
    for (const s of subs) if (!m[s.user_id] || s.status === "active") m[s.user_id] = s;
    return m;
  }, [subs]);

  const lastActivity = useMemo(() => {
    const m: Record<string, string> = {};
    for (const a of attempts) if (!m[a.user_id] || a.created_at > m[a.user_id]) m[a.user_id] = a.created_at;
    return m;
  }, [attempts]);

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    const nameMatch = !q || (p.display_name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q));
    const role = roleMap[p.id] ?? "particulier";
    const roleMatch = roleFilter === "all" || role === roleFilter;
    return nameMatch && roleMatch;
  });

  async function toggleDisable(userId: string, currentlyDisabled: boolean) {
    setActionBusy(userId);
    try {
      if (currentlyDisabled) {
        await supabase.from("profiles").update({ disabled_at: null }).eq("id", userId);
      } else {
        await supabase.from("profiles").update({ disabled_at: new Date().toISOString() }).eq("id", userId);
      }
      window.location.reload();
    } catch (e) {
      alert("Erreur : " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setActionBusy(null);
    }
  }

  async function hardDelete(userId: string, email: string | null) {
    if (!confirm(`Supprimer définitivement ${email || userId} ?\n\nToutes ses données (progression, abonnement, rôle) seront perdues.`)) return;
    setActionBusy(userId);
    try {
      // Delete in order to respect foreign keys
      await supabase.from("lesson_attempts").delete().eq("user_id", userId);
      await supabase.from("subscriptions").delete().eq("user_id", userId);
      await supabase.from("user_roles").delete().eq("user_id", userId);
      await supabase.from("profiles").delete().eq("id", userId);
      alert("✅ Utilisateur supprimé.");
      window.location.reload();
    } catch (e) {
      alert("Erreur : " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setActionBusy(null);
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="🔍 Rechercher un utilisateur…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-[#e2e8f0] px-3 py-2 text-sm w-64 focus:border-[#4361ee] focus:outline-none"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-md border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#4361ee] focus:outline-none"
        >
          <option value="all">Tous les rôles</option>
          <option value="particulier">Particulier</option>
          <option value="eleve">Élève</option>
          <option value="formateur">Formateur</option>
          <option value="admin_ecole">Admin école</option>
          <option value="super_admin">Super admin</option>
        </select>
        <span className="text-xs text-[#5a7a9a]">{filtered.length} utilisateur(s)</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#e2e8f0] bg-[#f8fafc]">
            <tr>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#5a7a9a]">Nom</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#5a7a9a]">Email</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#5a7a9a]">Rôle</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#5a7a9a]">Niveaux</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#5a7a9a]">Statut</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#5a7a9a]">Inscrit le</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#5a7a9a]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {filtered.map((p) => {
              const role = roleMap[p.id] ?? "particulier";
              const lessons = lessonCount[p.id] ?? 0;
              const isDisabled = !!p.disabled_at;
              const isSuperAdmin = role === "super_admin";
              const busy = actionBusy === p.id;
              return (
                <tr key={p.id} className={`hover:bg-[#f8fafc] ${isDisabled ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-[#1e3a5f]">
                    {p.display_name || (isSuperAdmin ? "Super Admin" : "—")}
                  </td>
                  <td className="px-4 py-3 text-[#5a7a9a]">{p.email || "—"}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={role} />
                  </td>
                  <td className="px-4 py-3 font-mono text-[#4361ee]">{lessons}</td>
                  <td className="px-4 py-3">
                    {isDisabled ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[10px] font-semibold uppercase text-[#d97706]">
                        ⚠️ Désactivé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[10px] font-semibold uppercase text-[#16a34a]">
                        ✓ Actif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#5a7a9a]">
                    {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    {!isSuperAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          disabled={busy}
                          onClick={() => toggleDisable(p.id, isDisabled)}
                          title={isDisabled ? "Réactiver" : "Désactiver"}
                          className={`rounded px-2 py-1 text-xs font-medium transition disabled:opacity-40 ${
                            isDisabled
                              ? 'bg-[#dcfce7] text-[#16a34a] hover:bg-[#bbf7d0]'
                              : 'bg-[#fef3c7] text-[#d97706] hover:bg-[#fde68a]'
                          }`}
                        >
                          {busy ? '…' : isDisabled ? '✅ Réactiver' : '⏸ Désactiver'}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => hardDelete(p.id, p.email)}
                          title="Supprimer définitivement"
                          className="rounded px-2 py-1 text-xs font-medium bg-[#fee2e2] text-[#dc2626] hover:bg-[#fecaca] transition disabled:opacity-40"
                        >
                          {busy ? '…' : '🗑 Supprimer'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-[#5a7a9a]">Aucun utilisateur trouvé</p>
        )}
      </div>
    </div>
  );
}

/* ================================================== */
/*  TAB 3 — SUBSCRIPTIONS                             */
/* ================================================== */

function SubscriptionsTab({ subs, profiles }: { subs: Sub[]; profiles: Profile[] }) {
  const profileMap = useMemo(() => {
    const m: Record<string, Profile> = {};
    for (const p of profiles) m[p.id] = p;
    return m;
  }, [profiles]);

  const activeSubs = subs.filter((s) => s.status === "active");
  const revenue = activeSubs.length * 10;

  return (
    <div>
      {/* Revenue summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5a7a9a]">Abonnements actifs</p>
          <p className="mt-2 font-serif text-3xl text-[#10b981]">{activeSubs.length}</p>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5a7a9a]">Revenus mensuels</p>
          <p className="mt-2 font-serif text-3xl text-[#f59e0b]">{revenue} €</p>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5a7a9a]">Total abonnements</p>
          <p className="mt-2 font-serif text-3xl text-[#4361ee]">{subs.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#e2e8f0] bg-[#f8fafc]">
            <tr>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#5a7a9a]">Utilisateur</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#5a7a9a]">Plan</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#5a7a9a]">Statut</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#5a7a9a]">Fin de période</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#5a7a9a]">Souscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {subs.map((s) => {
              const p = profileMap[s.user_id];
              return (
                <tr key={s.id} className="hover:bg-[#f8fafc]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1e3a5f]">{p?.display_name || "—"}</p>
                    <p className="text-xs text-[#5a7a9a]">{p?.email || s.user_id.slice(0, 8)}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs uppercase">{s.plan}</td>
                  <td className="px-4 py-3"><SubBadge status={s.status} /></td>
                  <td className="px-4 py-3 text-[#5a7a9a]">
                    {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-4 py-3 text-[#5a7a9a]">
                    {new Date(s.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {subs.length === 0 && (
          <p className="py-8 text-center text-sm text-[#5a7a9a]">Aucun abonnement pour l'instant</p>
        )}
      </div>
    </div>
  );
}

/* ================================================== */
/*  TAB 4 — SCHOOLS (FULL WORKFLOW)                   */
/* ================================================== */

function SchoolsTab({
  schools, busy, credentials, onActivate, onReject, onCloseCreds,
}: {
  schools: School[];
  busy: boolean;
  credentials: { email: string; password: string } | null;
  onActivate: (id: string) => void;
  onReject: (id: string) => void;
  onCloseCreds: () => void;
}) {
  const pending = schools.filter((s) => s.status === "pending");
  const studying = schools.filter((s) => s.status === "studying");
  const paymentSent = schools.filter((s) => s.status === "payment_sent");
  const active = schools.filter((s) => s.status === "active");
  const rejected = schools.filter((s) => s.status === "rejected");

  return (
    <div className="space-y-6">
      {/* Credentials alert */}
      {credentials && (
        <div className="rounded-xl border-2 border-[#10b981] bg-[#ecfdf5] p-5 animate-fade-in">
          <p className="font-mono text-xs uppercase tracking-wider text-[#10b981] font-bold">
            ✓ Identifiants générés — à transmettre à l&apos;école
          </p>
          <div className="mt-3 grid gap-1 font-mono text-sm">
            <div>
              <span className="text-[#5a7a9a]">Email : </span>
              <strong>{credentials.email}</strong>
            </div>
            <div>
              <span className="text-[#5a7a9a]">Mot de passe : </span>
              <strong>{credentials.password}</strong>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`Email: ${credentials.email}\nMot de passe: ${credentials.password}`);
                alert("Identifiants copiés !");
              }}
              className="rounded-md bg-[#10b981] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#059669]"
            >
              📋 Copier les identifiants
            </button>
            <button onClick={onCloseCreds} className="text-xs text-[#5a7a9a] underline">
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Workflow pipeline */}
      <div className="grid gap-4 sm:grid-cols-5">
        <PipelineCard label="Nouvelles" count={pending.length} color="#f59e0b" />
        <PipelineCard label="En étude" count={studying.length} color="#4361ee" />
        <PipelineCard label="Paiement envoyé" count={paymentSent.length} color="#8b5cf6" />
        <PipelineCard label="Actives" count={active.length} color="#10b981" />
        <PipelineCard label="Refusées" count={rejected.length} color="#ef4444" />
      </div>

      {/* Pending */}
      <SchoolSection title="Nouvelles demandes" color="#f59e0b" schools={pending} busy={busy} onActivate={onActivate} onReject={onReject} />
      
      {/* Studying */}
      <SchoolSection title="En cours d'étude" color="#4361ee" schools={studying} busy={busy} onActivate={onActivate} onReject={onReject} />
      
      {/* Payment sent */}
      <SchoolSection title="Paiement envoyé" color="#8b5cf6" schools={paymentSent} busy={busy} onActivate={onActivate} onReject={onReject} />

      {/* Active */}
      <SchoolSection title="Écoles actives" color="#10b981" schools={active} busy={busy} onActivate={onActivate} onReject={onReject} />

      {/* Rejected */}
      <SchoolSection title="Demandes refusées" color="#ef4444" schools={rejected} busy={busy} onActivate={onActivate} onReject={onReject} />

      {schools.length === 0 && (
        <p className="py-8 text-center text-sm text-[#5a7a9a]">Aucune demande d&apos;école pour l&apos;instant.</p>
      )}
    </div>
  );
}

function PipelineCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5a7a9a]">{label}</p>
      <p className="mt-1 font-serif text-2xl" style={{ color }}>{count}</p>
    </div>
  );
}

function SchoolSection({ title, color, schools, busy, onActivate, onReject }: {
  title: string; color: string; schools: School[]; busy: boolean;
  onActivate: (id: string) => void; onReject: (id: string) => void;
}) {
  if (schools.length === 0) return null;
  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-[0.15em] font-bold mb-3" style={{ color }}>{title}</h3>
      <div className="grid gap-4">
        {schools.map((s) => (
          <SchoolCard key={s.id} school={s} busy={busy} onActivate={onActivate} onReject={onReject} />
        ))}
      </div>
    </div>
  );
}

/* ---------- School Card with full workflow ---------- */

const PAYTECH_SCHOOL_LINK = "https://paytech.sn"; // PayTech mobile money payment for schools

function SchoolCard({
  school: s, busy, onActivate, onReject,
}: {
  school: School; busy: boolean;
  onActivate: (id: string) => void; onReject: (id: string) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const notify = useServerFn(notifySchool);

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("schools")
        .update({ status: newStatus })
        .eq("id", s.id);
      if (error) throw error;
      window.location.reload();
    } catch (e) {
      alert("Erreur: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setUpdating(false);
    }
  }

  async function sendNotification(type: "received" | "studying" | "payment" | "rejected") {
    setEmailStatus("envoi...");
    try {
      await notify({ data: { to: s.contact_email, schoolName: s.name, contactName: s.contact_name, type, paymentLink: PAYTECH_SCHOOL_LINK } });
      setEmailStatus("✅ Email envoyé !");
      setTimeout(() => setEmailStatus(null), 3000);
    } catch (e) {
      setEmailStatus("❌ " + (e instanceof Error ? e.message : String(e)));
    }
  }

  return (
    <article className="rounded-xl border border-[#e2e8f0] bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-serif text-lg text-[#1e3a5f]">{s.name}</h2>
        <StatusBadge status={s.status} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm md:grid-cols-4">
        <Info label="Responsable" v={s.contact_name} />
        <Info label="Email" v={s.contact_email} />
        <Info label="Téléphone" v={s.contact_phone ?? "—"} />
        <Info label="Adresse" v={s.address ?? "—"} />
        <Info label="Classes" v={String(s.nb_classes)} />
        <Info label="Élèves" v={String(s.nb_students)} />
        <Info label="Reçue le" v={new Date(s.created_at).toLocaleDateString("fr-FR")} />
        {s.activated_at && <Info label="Activée le" v={new Date(s.activated_at).toLocaleDateString("fr-FR")} />}
      </dl>
      {s.message && (
        <p className="mt-3 rounded-md bg-[#f8fafc] p-3 text-sm text-[#5a7a9a] italic">
          « {s.message} »
        </p>
      )}

      {/* Stored credentials (always visible for active schools) */}
      {s.status === "active" && (s as Record<string, unknown>).admin_credentials_email && (
        <div className="mt-3 rounded-md border border-[#10b981]/30 bg-[#ecfdf5] p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#10b981] font-bold mb-1">Identifiants admin école</p>
          <div className="font-mono text-sm">
            <span className="text-[#5a7a9a]">Email : </span>
            <strong>{String((s as Record<string, unknown>).admin_credentials_email)}</strong>
          </div>
          <div className="font-mono text-sm">
            <span className="text-[#5a7a9a]">Mot de passe : </span>
            <strong>{String((s as Record<string, unknown>).admin_credentials_password)}</strong>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `Email: ${(s as Record<string, unknown>).admin_credentials_email}\nMot de passe: ${(s as Record<string, unknown>).admin_credentials_password}`
              );
              alert("Identifiants copiés !");
            }}
            className="mt-2 rounded-md bg-[#10b981] px-3 py-1 text-xs font-medium text-white hover:bg-[#059669]"
          >
            📋 Copier
          </button>
        </div>
      )}

      {emailStatus && (
        <p className="mt-3 text-xs font-medium text-[#4361ee]">{emailStatus}</p>
      )}

      {/* WORKFLOW ACTIONS */}
      <div className="mt-4 flex flex-wrap gap-2">
        {/* Pending → Studying */}
        {s.status === "pending" && (
          <>
            <button disabled={updating || busy} onClick={() => sendNotification("received")}
              className="rounded-md border border-[#e2e8f0] px-3 py-2 text-xs text-[#5a7a9a] hover:bg-[#f1f5f9] disabled:opacity-60">
              ✉️ Notifier réception
            </button>
            <button disabled={updating || busy} onClick={() => { sendNotification("studying"); updateStatus("studying"); }}
              className="rounded-md bg-[#4361ee] px-4 py-2 text-xs font-medium text-white hover:bg-[#3451d1] disabled:opacity-60">
              📋 Passer en étude + notifier
            </button>
            <button disabled={updating || busy} onClick={() => { if (confirm("Refuser ?")) { sendNotification("rejected"); onReject(s.id); } }}
              className="rounded-md border border-[#ef4444]/30 px-3 py-2 text-xs text-[#ef4444] hover:bg-[#fef2f2] disabled:opacity-60">
              ✕ Refuser + notifier
            </button>
          </>
        )}

        {/* Studying → Payment sent */}
        {s.status === "studying" && (
          <>
            <button disabled={updating || busy} onClick={() => { sendNotification("payment"); updateStatus("payment_sent"); }}
              className="rounded-md bg-[#8b5cf6] px-4 py-2 text-xs font-medium text-white hover:bg-[#7c3aed] disabled:opacity-60">
              💳 Envoyer lien de paiement
            </button>
            <button disabled={updating || busy} onClick={() => { if (confirm("Refuser ?")) { sendNotification("rejected"); onReject(s.id); } }}
              className="rounded-md border border-[#ef4444]/30 px-3 py-2 text-xs text-[#ef4444] hover:bg-[#fef2f2] disabled:opacity-60">
              ✕ Refuser + notifier
            </button>
          </>
        )}

        {/* Payment sent → Activate */}
        {s.status === "payment_sent" && (
          <>
            <button disabled={updating || busy} onClick={() => onActivate(s.id)}
              className="rounded-md bg-[#10b981] px-4 py-2 text-xs font-medium text-white hover:bg-[#059669] disabled:opacity-60">
              ✓ Paiement reçu → Activer
            </button>
            <button disabled={updating || busy} onClick={() => sendNotification("payment")}
              className="rounded-md border border-[#e2e8f0] px-3 py-2 text-xs text-[#5a7a9a] hover:bg-[#f1f5f9] disabled:opacity-60">
              ✉️ Renvoyer lien paiement
            </button>
          </>
        )}

        {/* Rejected → email */}
        {s.status === "rejected" && (
          <button disabled={updating || busy} onClick={() => sendNotification("rejected")}
            className="rounded-md border border-[#e2e8f0] px-3 py-2 text-xs text-[#5a7a9a] hover:bg-[#f1f5f9] disabled:opacity-60">
            ✉️ Renvoyer notification refus
          </button>
        )}

        {/* Active → no email action needed */}
      </div>
    </article>
  );
}

/* ================================================== */
/*  SHARED COMPONENTS                                  */
/* ================================================== */

function Info({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-wider text-[#5a7a9a]">{label}</dt>
      <dd className="text-[#1e3a5f]">{v}</dd>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    particulier: "bg-[#f1f5f9] text-[#5a7a9a]",
    eleve: "bg-[#dbeafe] text-[#2563eb]",
    formateur: "bg-[#fef3c7] text-[#d97706]",
    admin_ecole: "bg-[#fce7f3] text-[#db2777]",
    super_admin: "bg-[#ede9fe] text-[#7c3aed]",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${map[role] ?? map.particulier}`}>
      {role.replace("_", " ")}
    </span>
  );
}

function SubBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-[#dcfce7] text-[#16a34a]",
    expired: "bg-[#fef3c7] text-[#d97706]",
    cancelled: "bg-[#fee2e2] text-[#dc2626]",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${map[status] ?? "bg-[#f1f5f9] text-[#5a7a9a]"}`}>
      {status}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-[#fef3c7] text-[#d97706]",
    studying: "bg-[#dbeafe] text-[#4361ee]",
    payment_sent: "bg-[#ede9fe] text-[#8b5cf6]",
    active: "bg-[#dcfce7] text-[#16a34a]",
    rejected: "bg-[#fee2e2] text-[#dc2626]",
  };
  const label: Record<string, string> = {
    pending: "nouvelle",
    studying: "en étude",
    payment_sent: "paiement envoyé",
    active: "activée",
    rejected: "refusée",
  };
  return (
    <span className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${map[status] ?? "bg-[#f1f5f9]"}`}>
      {label[status] ?? status}
    </span>
  );
}

