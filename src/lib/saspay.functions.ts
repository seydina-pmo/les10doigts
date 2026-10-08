import { createServerFn } from "@tanstack/react-start";

export interface CreateSasPayInput {
  plan: "particulier" | "school";
  userId?: string;
  userEmail?: string;
  originUrl?: string;
}

export const createSasPayPayment = createServerFn({ method: "POST" })
  .validator((data: CreateSasPayInput) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.SASPAY_API_KEY || "sk_live_b827GiVRNHp4-jAbmu1nYegykchBxOptox-UgK4LPtI";

    const isSchool = data.plan === "school";
    // 10 € / mois pour Particulier (~6 500 FCFA), 115 € / an pour École
    const amount = isSchool ? 115.0 : 10.0;
    const description = isSchool
      ? "Abonnement Les 10 Doigts - École (1 An)"
      : "Abonnement Les 10 Doigts - Particulier";

    const origin = data.originUrl || "https://www.les10doigts.com";

    const body = {
      amount,
      currency: "EUR",
      description,
      success_url: `${origin}/app?payment=success`,
      cancel_url: `${origin}/tarifs?payment=cancelled`,
      metadata: {
        userId: data.userId || null,
        userEmail: data.userEmail || null,
        plan: data.plan,
      },
    };

    try {
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

      // Check if checkout_url or url is returned
      const redirectUrl = json.checkout_url || json.url || json.link || json.data?.checkout_url;

      if (response.ok && redirectUrl) {
        return { success: true, redirectUrl, id: json.id };
      } else {
        console.error("[SasPay] API Error Response:", json);
        return {
          success: false,
          error: json.message || json.detail || json.error || "Erreur lors de la création du paiement SasPay",
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
