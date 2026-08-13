import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionPlan = "free" | "particulier" | "school";
export type SubscriptionStatus = "active" | "expired" | "cancelled";

export type Subscription = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  expires_at: string | null;
};

const FREE_LEVEL_LIMIT = 3;

/**
 * Check if a user can access a given level based on their subscription.
 * Free users: levels 1-10 only.
 * Paid users: levels 1-100.
 */
export function canAccessLevel(sub: Subscription | null, level: number): boolean {
  if (!sub || sub.plan === "free") return level <= FREE_LEVEL_LIMIT;
  if (sub.status !== "active") return level <= FREE_LEVEL_LIMIT;
  return true;
}

export function useSubscription() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: u } = await supabase.auth.getUser();
      if (cancelled || !u.user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status, expires_at")
        .eq("user_id", u.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        // Check if expired
        const isExpired =
          data.expires_at && new Date(data.expires_at) < new Date();
        setSub({
          plan: data.plan as SubscriptionPlan,
          status: isExpired ? "expired" : (data.status as SubscriptionStatus),
          expires_at: data.expires_at,
        });
      } else {
        // No subscription row = free user
        setSub({ plan: "free", status: "active", expires_at: null });
      }
      setLoading(false);
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  return {
    subscription: sub,
    loading,
    isFree: !sub || sub.plan === "free" || sub.status !== "active",
    isPaid: sub !== null && sub.plan !== "free" && sub.status === "active",
    levelLimit: !sub || sub.plan === "free" ? FREE_LEVEL_LIMIT : 100,
  };
}
