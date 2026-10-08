import { useState, type ReactNode } from "react";

/**
 * SubscribeButton — single entry point for the "S'abonner" flow (SasPay).
 * Used on /tarifs, /particuliers and in the in-app Paywall so that every
 * subscribe button goes through the same checkout logic.
 */
export function SubscribeButton({
  className,
  children = "S'abonner",
  id,
}: {
  className?: string;
  children?: ReactNode;
  id?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (loading) return;
    setLoading(true);

    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "InitiateCheckout", { value: 10.0, currency: "EUR" });
    }

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: s } = await supabase.auth.getSession();

      // Payment must be tied to an account, otherwise the webhook can't activate it
      if (!s.session?.user) {
        window.location.href = "/auth";
        return;
      }

      const { createSasPayPayment } = await import("@/lib/saspay.functions");
      const res = await createSasPayPayment({
        data: {
          plan: "particulier",
          userId: s.session.user.id,
          userEmail: s.session.user.email ?? undefined,
          originUrl: window.location.origin,
        },
      });

      if (res.success && res.redirectUrl) {
        window.location.href = res.redirectUrl;
        return;
      }
      alert(res.error || "Erreur lors de la création du paiement");
    } catch (err: any) {
      alert("Erreur réseau : " + (err?.message ?? String(err)));
    }
    setLoading(false);
  }

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={loading}
      className={(className ?? "") + " cursor-pointer disabled:opacity-75"}
    >
      {loading ? "Chargement…" : children}
    </button>
  );
}
