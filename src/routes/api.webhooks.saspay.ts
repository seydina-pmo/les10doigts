import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/webhooks/saspay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const bodyText = await request.text();
          let body: any = {};
          try {
            body = JSON.parse(bodyText);
          } catch {
            return new Response("Invalid JSON body", { status: 400 });
          }

          console.log("[SasPay Webhook] Event received:", JSON.stringify(body));

          // SasPay sends payload containing metadata and status
          const eventType = String(body.event || body.type || "");
          const data = body.data || body;
          const metadata = data.metadata || body.metadata || {};

          let targetUserId: string | undefined = metadata.userId || metadata.user_id;
          const userEmail: string | undefined =
            metadata.userEmail || data.customer_email || body.customer_email;
          const plan: "particulier" | "school" = metadata.plan === "school" ? "school" : "particulier";
          const status = String(data.status || body.status || eventType);

          // Check if transaction was successful
          const isSuccess =
            eventType.toLowerCase().includes("success") ||
            eventType.toLowerCase().includes("completed") ||
            eventType.toLowerCase().includes("paid") ||
            ["success", "completed", "paid", "succeeded"].includes(status.toLowerCase());

          if (!isSuccess) {
            return new Response(JSON.stringify({ success: true, message: "Ignored (not a success event)" }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Service-role client: RLS on `subscriptions` only allows service_role writes
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // Fallback: find user by email if userId wasn't in metadata
          if (!targetUserId && userEmail) {
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("id")
              .eq("email", userEmail)
              .maybeSingle();
            if (profile?.id) targetUserId = profile.id;
          }

          if (!targetUserId) {
            console.warn("[SasPay Webhook] Payment successful but no user found", { userEmail });
            return new Response(JSON.stringify({ success: true, message: "No target user found" }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Monthly plans: +1 month
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);

          console.log(`[SasPay Webhook] Activating ${plan} for user ${targetUserId} until ${expiresAt.toISOString()}`);

          const { error } = await supabaseAdmin.from("subscriptions").upsert(
            {
              user_id: targetUserId,
              plan,
              status: "active",
              expires_at: expiresAt.toISOString(),
            },
            { onConflict: "user_id" }
          );

          if (error) {
            console.error("[SasPay Webhook] Supabase update error:", error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
          }

          console.log(`[SasPay Webhook] ✅ Subscription activated for user: ${targetUserId}`);
          return new Response(JSON.stringify({ success: true, message: "Subscription activated" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          console.error("[SasPay Webhook] Exception:", err);
          return new Response(JSON.stringify({ error: err.message }), { status: 500 });
        }
      },
      GET: async () => {
        return new Response("SasPay Webhook Endpoint Active", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        });
      },
    },
  },
});
