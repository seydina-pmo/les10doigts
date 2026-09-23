import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const MAX_DEVICES = 2;

// Use `as any` for active_sessions table — it exists in DB but isn't in generated Supabase types
const db = () => supabase.from("active_sessions" as any);

/**
 * Generate a simple device fingerprint from browser properties.
 */
function getDeviceFingerprint(): string {
  if (typeof window === "undefined") return "ssr";
  const parts = [
    navigator.userAgent,
    `${screen.width}x${screen.height}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    String(navigator.hardwareConcurrency ?? "?"),
  ];
  let hash = 0;
  const str = parts.join("|");
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `dev_${Math.abs(hash).toString(36)}`;
}

function generateToken(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export type SessionStatus = "ok" | "kicked" | "loading";

export function useSessionGuard() {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [activeCount, setActiveCount] = useState(0);
  const tokenRef = useRef<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function register() {
      const { data: u } = await supabase.auth.getUser();
      if (cancelled || !u.user) {
        setStatus("ok");
        return;
      }

      const userId = u.user.id;
      const fingerprint = getDeviceFingerprint();
      const token = generateToken();
      tokenRef.current = token;

      await db().upsert(
        {
          user_id: userId,
          device_fingerprint: fingerprint,
          session_token: token,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "user_id,device_fingerprint" },
      );

      const { data: sessions } = await db()
        .select("id, device_fingerprint, session_token, last_seen_at")
        .eq("user_id", userId)
        .order("last_seen_at", { ascending: false });

      if (cancelled) return;

      const activeSessions = (sessions ?? []) as any[];
      setActiveCount(activeSessions.length);

      if (activeSessions.length > MAX_DEVICES) {
        const toRemove = activeSessions.slice(MAX_DEVICES);
        const removeIds = toRemove.map((s: any) => s.id);

        const mySession = activeSessions.find(
          (s: any) => s.session_token === token,
        );
        const amIKicked = !mySession || removeIds.includes(mySession.id);

        if (amIKicked) {
          setStatus("kicked");
          await supabase.auth.signOut();
          return;
        }

        await db().delete().in("id", removeIds);
      }

      setStatus("ok");
    }

    void register();

    intervalRef.current = setInterval(async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;

      const fingerprint = getDeviceFingerprint();

      await db()
        .update({ last_seen_at: new Date().toISOString() })
        .eq("user_id", u.user.id)
        .eq("device_fingerprint", fingerprint);

      const { data: mySession } = await db()
        .select("session_token")
        .eq("user_id", u.user.id)
        .eq("device_fingerprint", fingerprint)
        .maybeSingle();

      if (!mySession || (mySession as any).session_token !== tokenRef.current) {
        setStatus("kicked");
        await supabase.auth.signOut();
      }
    }, 60_000);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    function cleanup() {
      const fingerprint = getDeviceFingerprint();
      navigator.sendBeacon?.(`/api/session-cleanup?fp=${fingerprint}`);
    }
    window.addEventListener("beforeunload", cleanup);
    return () => window.removeEventListener("beforeunload", cleanup);
  }, []);

  return { status, activeCount };
}
