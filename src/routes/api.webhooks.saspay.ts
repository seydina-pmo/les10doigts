import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

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
          const eventType = body.event || body.type || "";
          const data = body.data || body;
          const metadata = data.metadata || body.metadata || {};

          const userId = metadata.userId || metadata.user_id;
          const plan = metadata.plan || "particulier";
          const status = data.status || body.status || eventType;

          // Check if transaction was successful
          const isSuccess =
            eventType.includes("success") ||
            eventType.includes("completed") ||
            status === "success" ||
            status === "COMPLETED" ||
            status === "PAID" ||
            status === "SUCCESS";

          if (isSuccess && userId) {
            console.log(`[SasPay Webhook] Activating subscription for user: ${userId}, plan: ${plan}`);

            // 1 Year subscription
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);

            const { error } = await supabase.from("subscriptions").upsert(
              {
                user_id: userId,
                plan: plan as "particulier" | "school",
                status: "active",
                expires_at: expiresAt.toISOString(),
              },
              { onConflict: "user_id" }
            );

            if (error) {
              console.error("[SasPay Webhook] Supabase update error:", error);
              return new Response(JSON.stringify({ error: error.message }), { status: 500 });
            }

            console.log(`[SasPay Webhook] ✅ Subscription successfully activated for user: ${userId}`);
            return new Response(JSON.stringify({ success: true, message: "Subscription activated" }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ success: true, message: "Webhook processed" }), {
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
