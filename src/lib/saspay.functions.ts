import { createServerFn } from "@tanstack/react-start";

export interface CreateSasPayInput {
  plan: "particulier" | "school";
  userId?: string;
  userEmail?: string;
  userName?: string;
  originUrl?: string;
}

export const createSasPayPayment = createServerFn({ method: "POST" })
  .validator((data: CreateSasPayInput) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.SASPAY_API_KEY;

    if (!apiKey) {
      console.error("[SasPay] Missing SASPAY_API_KEY environment variable");
      return { success: false, error: "Configuration serveur manquante (SASPAY_API_KEY)" };
    }

    const isSchool = data.plan === "school";
    const amountStr = isSchool ? "115.00" : "10.00";
    const description = isSchool
      ? "Abonnement Les 10 Doigts - École (1 An)"
      : "Abonnement Les 10 Doigts - Particulier";

    const origin = data.originUrl || "https://www.les10doigts.com";

    const body = {
      amount: amountStr,
      currency: "EUR",
      description,
      return_url: `${origin}/merci-paiement`,
      success_url: `${origin}/merci-paiement`,
      cancel_url: `${origin}/tarifs?payment=cancelled`,
      customer_email: data.userEmail || "client@les10doigts.com",
      customer_name: data.userName || "Client Les10Doigts",
      metadata: {
        userId: data.userId || null,
        userEmail: data.userEmail || null,
        plan: data.plan,
      },
    };

    try {
      console.log("[SasPay] Sending checkout request:", JSON.stringify(body));

      const response = await fetch("https://api.saspay.me/api/v1/checkout-sessions/", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      const json = await response.json();
      console.log("[SasPay] Response:", response.status, JSON.stringify(json));

      const redirectUrl = json.checkout_url || json.url || json.link || json.data?.checkout_url;

      if (response.ok && redirectUrl) {
        return { success: true, redirectUrl, id: json.id };
      } else {
        console.error("[SasPay] API Error:", json);
        return {
          success: false,
          error: json.message || json.detail || json.error || JSON.stringify(json),
        };
      }
    } catch (err: any) {
      console.error("[SasPay] Request Exception:", err);
      return {
        success: false,
        error: err.message || "Erreur réseau lors de la connexion à SasPay",
      };
    }
  });
