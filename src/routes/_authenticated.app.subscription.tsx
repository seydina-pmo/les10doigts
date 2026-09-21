import { createFileRoute, Link } from "@tanstack/react-router";
import { useSubscription } from "@/lib/subscription";

export const Route = createFileRoute("/_authenticated/app/subscription")({
  head: () => ({ meta: [{ title: "Mon abonnement, La Méthode des 10 Doigts" }] }),
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const { subscription, loading, isFree, isPaid } = useSubscription();

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-copper border-t-transparent" />
      </section>
    );
  }

  const planLabels: Record<string, string> = {
    free: "Gratuit",
    particulier: "Particulier",
    school: "Établissement scolaire",
  };

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: "Actif", color: "#065f46", bg: "#ecfdf5" },
    expired: { label: "Expiré", color: "#991b1b", bg: "#fef2f2" },
    cancelled: { label: "Annulé", color: "#92400e", bg: "#fffbeb" },
  };

  const plan = subscription?.plan || "free";
  const status = subscription?.status || "active";
  const expiresAt = subscription?.expires_at;
  const statusCfg = statusConfig[status] || statusConfig.active;

  const expiresDate = expiresAt
    ? new Date(expiresAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <section className="mx-auto grid max-w-3xl gap-8 px-6 py-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-copper-deep">
          mon abonnement
        </p>
        <h1 className="mt-2 font-serif text-3xl">Gérer mon abonnement</h1>
      </div>

      {/* Current plan card */}
      <div className="overflow-hidden rounded-2xl border-2 border-rule bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rule bg-paper-deep/60 px-6 py-4">
          <h2 className="font-serif text-xl">Plan actuel</h2>
          <span
            className="rounded-full px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider"
            style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}
          >
            {statusCfg.label}
          </span>
        </div>

        {/* Body */}
        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
              Type de plan
            </p>
            <p className="mt-1 text-lg font-semibold">{planLabels[plan] || plan}</p>
          </div>

          {isPaid && expiresDate && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                {status === "expired" ? "Expiré le" : "Valable jusqu'au"}
              </p>
              <p className="mt-1 text-lg font-semibold">{expiresDate}</p>
              {daysLeft !== null && status === "active" && (
                <p className="mt-0.5 text-sm text-ink-soft">
                  {daysLeft > 1
                    ? `${daysLeft} jours restants`
                    : daysLeft === 1
                      ? "Dernier jour !"
                      : "Expire aujourd'hui"}
                </p>
              )}
            </div>
          )}

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
              Niveaux accessibles
            </p>
            <p className="mt-1 text-lg font-semibold">
              {isPaid ? "100 niveaux" : "3 niveaux (gratuit)"}
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
              Prix
            </p>
            <p className="mt-1 text-lg font-semibold">
              {plan === "particulier"
                ? "6 500 FCFA / mois"
                : plan === "school"
                  ? "75 000 FCFA / an"
                  : "Gratuit"}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-rule bg-paper-deep/30 px-6 py-4">
          {isFree && (
            <div>
              <div className="mb-3 flex items-start gap-2 rounded-lg bg-[#eff6ff] px-4 py-3 text-sm text-[#1e40af]">
                <span className="mt-0.5">💡</span>
                <p>
                  Passez à un abonnement payant pour débloquer les <strong>100 niveaux</strong>,
                  obtenir vos <strong>certificats officiels</strong> et accéder au <strong>classement</strong>.
                </p>
              </div>
              <Link
                to="/tarifs"
                className="inline-block rounded-md bg-copper px-5 py-2.5 text-sm font-medium text-paper transition hover:-translate-y-0.5 hover:bg-copper-deep"
              >
                Voir les tarifs →
              </Link>
            </div>
          )}

          {status === "expired" && (
            <div>
              <div className="mb-3 flex items-start gap-2 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]">
                <span className="mt-0.5">⚠️</span>
                <p>
                  Votre abonnement a expiré. Renouvelez pour continuer à accéder aux 100 niveaux et
                  aux certificats.
                </p>
              </div>
              <Link
                to="/tarifs"
                className="inline-block rounded-md bg-copper px-5 py-2.5 text-sm font-medium text-paper transition hover:-translate-y-0.5 hover:bg-copper-deep"
              >
                Renouveler mon abonnement →
              </Link>
            </div>
          )}

          {isPaid && status === "active" && (
            <div className="flex items-start gap-2 rounded-lg bg-[#ecfdf5] px-4 py-3 text-sm text-[#065f46]">
              <span className="mt-0.5">✅</span>
              <p>
                Votre abonnement est actif. Profitez de tous les niveaux et des certifications !
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features comparison */}
      <div className="overflow-hidden rounded-2xl border border-rule bg-card">
        <div className="border-b border-rule bg-paper-deep/60 px-6 py-4">
          <h2 className="font-serif text-xl">Comparaison des plans</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper-deep/40 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
              <tr>
                <th className="px-6 py-3 text-left">Fonctionnalité</th>
                <th className="px-4 py-3 text-center">Gratuit</th>
                <th className="px-4 py-3 text-center">Particulier</th>
                <th className="px-4 py-3 text-center">École</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feat: "Niveaux d'exercice", free: "3", part: "100", school: "100" },
                { feat: "Certificats (Bronze/Argent/Or)", free: "—", part: "✅", school: "✅" },
                { feat: "Classement", free: "—", part: "✅", school: "✅" },
                { feat: "Mode Focus", free: "✅", part: "✅", school: "✅" },
                { feat: "Guide vocal", free: "✅", part: "✅", school: "✅" },
                { feat: "Gestion de classes", free: "—", part: "—", school: "✅" },
                { feat: "Tableau admin école", free: "—", part: "—", school: "✅" },
              ].map((r) => (
                <tr key={r.feat} className="border-t border-rule/40">
                  <td className="px-6 py-3 font-medium">{r.feat}</td>
                  <td className="px-4 py-3 text-center text-ink-soft">{r.free}</td>
                  <td className="px-4 py-3 text-center">{r.part}</td>
                  <td className="px-4 py-3 text-center">{r.school}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
