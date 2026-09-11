import { createServerFn } from "@tanstack/react-start";

export interface CreatePaymentInput {
  plan: "particulier" | "ecole";
  userId?: string;
  userEmail?: string;
  originUrl?: string;
}

export const createPayTechPayment = createServerFn({ method: "POST" })
  .validator((data: CreatePaymentInput) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.PAYTECH_API_KEY;
    const apiSecret = process.env.PAYTECH_API_SECRET;
    const env = process.env.PAYTECH_ENV || "test";

    // Prices in XOF (FCFA)
    // Particulier: 6 500 FCFA (~10 €)
    // Ecole: 75 000 FCFA (~115 €)
    const isEcole = data.plan === "ecole";
    const itemPrice = isEcole ? 75000 : 6500;
    const itemName = isEcole 
      ? "Abonnement Les 10 Doigts - Établissement (1 An)" 
      : "Abonnement Les 10 Doigts - Particulier (Mensuel)";

    const origin = data.originUrl || "https://les10doigts.com";
    const refCommand = `L10D_${data.plan.toUpperCase()}_${Date.now()}`;

    const body = {
      item_name: itemName,
      item_price: itemPrice.toString(),
      currency: "XOF",
      ref_command: refCommand,
      command_name: `Paiement ${itemName}`,
      env: env,
      ipn_url: `${origin}/api/paytech-ipn`,
      success_url: `${origin}/app/profile?payment=success`,
      cancel_url: `${origin}/tarifs?payment=cancelled`,
      custom_field: JSON.stringify({
        userId: data.userId || null,
        userEmail: data.userEmail || null,
        plan: data.plan,
      }),
    };

    try {
      const response = await fetch("https://paytech.sn/api/payment/request-payment", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "API_KEY": apiKey || "",
          "API_SECRET": apiSecret || "",
        },
        body: JSON.stringify(body),
      });

      const json = await response.json();

      if (json.success === 1 && json.redirect_url) {
        return { success: true, redirectUrl: json.redirect_url, token: json.token };
      } else {
        console.error("PayTech API Error:", json);
        return { 
          success: false, 
          error: json.message || json.errors || "Erreur lors de la création du paiement PayTech" 
        };
      }
    } catch (err: any) {
      console.error("PayTech request failed:", err);
      return { success: false, error: err.message || "Erreur réseau lors de la connexion à PayTech" };
    }
  });
