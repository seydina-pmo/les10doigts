import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const MAX_DEVICES = 2;

/**
 * Generate a simple device fingerprint from browser properties.
 * Not perfect, but good enough to distinguish different machines.
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
  // Simple hash
  let hash = 0;
  const str = parts.join("|");
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `dev_${Math.abs(hash).toString(36)}`;
}

/**
 * Generate a random session token.
 */
function generateToken(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export type SessionStatus = "ok" | "kicked" | "loading";

/**
 * useSessionGuard — registers the current device as an active session
 * and monitors for kicks (when another device connects and exceeds the limit).
 *
 * Returns:
 * - status: "ok" if this session is valid, "kicked" if displaced by another device
 * - activeCount: number of active sessions for this user
 */
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
        setStatus("ok"); // Not logged in, no guard needed
        return;
      }

      const userId = u.user.id;
      const fingerprint = getDeviceFingerprint();
      const token = generateToken();
      tokenRef.current = token;

      // Upsert this device's session
      await supabase.from("active_sessions").upsert(
        {
          user_id: userId,
          device_fingerprint: fingerprint,
          session_token: token,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "user_id,device_fingerprint" },
      );

      // Check total active sessions for this user
      const { data: sessions } = await supabase
        .from("active_sessions")
        .select("id, device_fingerprint, session_token, last_seen_at")
        .eq("user_id", userId)
        .order("last_seen_at", { ascending: false });

      if (cancelled) return;

      const activeSessions = sessions ?? [];
      setActiveCount(activeSessions.length);

      // If more than MAX_DEVICES, remove the oldest ones
      if (activeSessions.length > MAX_DEVICES) {
        const toRemove = activeSessions.slice(MAX_DEVICES);
        const removeIds = toRemove.map((s) => s.id);

        // Check if WE are being removed
        const mySession = activeSessions.find(
          (s) => s.session_token === token,
        );
        const amIKicked = !mySession || removeIds.includes(mySession.id);

        if (amIKicked) {
          setStatus("kicked");
          // Sign out
          await supabase.auth.signOut();
          return;
        }

        // Remove old sessions
        await supabase
          .from("active_sessions")
          .delete()
          .in("id", removeIds);
      }

      setStatus("ok");
    }

    void register();

    // Heartbeat: update last_seen every 60 seconds
    intervalRef.current = setInterval(async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;

      const fingerprint = getDeviceFingerprint();

      // Update heartbeat
      await supabase
        .from("active_sessions")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("user_id", u.user.id)
        .eq("device_fingerprint", fingerprint);

      // Check if we've been kicked
      const { data: mySession } = await supabase
        .from("active_sessions")
        .select("session_token")
        .eq("user_id", u.user.id)
        .eq("device_fingerprint", fingerprint)
        .maybeSingle();

      if (!mySession || mySession.session_token !== tokenRef.current) {
        setStatus("kicked");
        await supabase.auth.signOut();
      }
    }, 60_000);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Cleanup on unmount (tab close)
  useEffect(() => {
    function cleanup() {
      // Best-effort: remove session on tab close
      const fingerprint = getDeviceFingerprint();
      navigator.sendBeacon?.(
        `/api/session-cleanup?fp=${fingerprint}`,
      );
    }
    window.addEventListener("beforeunload", cleanup);
    return () => window.removeEventListener("beforeunload", cleanup);
  }, []);

  return { status, activeCount };
}
