import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Lazy import Resend to avoid issues on client
async function getResend() {
  const { Resend } = await import("resend");
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY manquante");
  return new Resend(key);
}

const FROM_EMAIL = "La Méthode des 10 Doigts <contact@les10doigts.com>";

// ---------- Send email (generic) ----------

export const sendEmail = createServerFn({ method: "POST" })
  .inputValidator((d: { to: string; subject: string; body: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }) => {
    const resend = await getResend();
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: "contact@les10doigts.com",
      to: data.to,
      subject: data.subject,
      text: data.body,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------- Reply to contact message ----------

export const replyToMessage = createServerFn({ method: "POST" })
  .inputValidator((d: { to: string; subject: string; body: string; originalMessage: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }) => {
    const resend = await getResend();
    const fullBody = `${data.body}\n\n--- Message original ---\n${data.originalMessage}`;
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: "contact@les10doigts.com",
      to: data.to,
      subject: data.subject,
      text: fullBody,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------- School notification emails ----------

export const notifySchool = createServerFn({ method: "POST" })
  .inputValidator((d: { to: string; schoolName: string; contactName: string; type: "received" | "studying" | "payment" | "activated" | "rejected"; paymentLink?: string; credentials?: { email: string; password: string } }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }) => {
    const resend = await getResend();

    const templates: Record<string, { subject: string; body: string }> = {
      received: {
        subject: "Demande reçue — La Méthode des 10 Doigts",
        body: `Bonjour ${data.contactName},\n\nNous avons bien reçu votre demande d'inscription pour l'école "${data.schoolName}".\n\nNotre équipe va étudier votre dossier et vous tiendra informé de la suite.\n\nCordialement,\nL'équipe La Méthode des 10 Doigts`,
      },
      studying: {
        subject: "Votre dossier est en cours d'étude — La Méthode des 10 Doigts",
        body: `Bonjour ${data.contactName},\n\nVotre demande pour l'école "${data.schoolName}" est actuellement en cours d'étude par notre équipe.\n\nNous reviendrons vers vous très prochainement.\n\nCordialement,\nL'équipe La Méthode des 10 Doigts`,
      },
      payment: {
        subject: "Lien de paiement — La Méthode des 10 Doigts",
        body: `Bonjour ${data.contactName},\n\nBonne nouvelle ! Votre demande pour l'école "${data.schoolName}" a été acceptée.\n\nPour finaliser votre inscription, veuillez procéder au paiement via ce lien sécurisé :\n${data.paymentLink ?? "[Lien de paiement]"}\n\nUne fois le paiement effectué, vos identifiants de connexion vous seront transmis par email.\n\nCordialement,\nL'équipe La Méthode des 10 Doigts`,
      },
      activated: {
        subject: "Votre école est activée ! — La Méthode des 10 Doigts",
        body: `Bonjour ${data.contactName},\n\nExcellente nouvelle ! Votre école "${data.schoolName}" est maintenant activée sur la plateforme.\n\nVoici vos identifiants d'administration :\n• Email : ${data.credentials?.email ?? ""}\n• Mot de passe : ${data.credentials?.password ?? ""}\n\nConnectez-vous sur https://www.les10doigts.com/auth pour accéder à votre espace.\n\nCordialement,\nL'équipe La Méthode des 10 Doigts`,
      },
      rejected: {
        subject: "Suite à votre demande — La Méthode des 10 Doigts",
        body: `Bonjour ${data.contactName},\n\nAprès étude de votre dossier, nous ne sommes malheureusement pas en mesure de donner suite à votre demande pour l'école "${data.schoolName}" pour le moment.\n\nN'hésitez pas à nous recontacter si vous avez des questions.\n\nCordialement,\nL'équipe La Méthode des 10 Doigts`,
      },
    };

    const tmpl = templates[data.type];
    if (!tmpl) throw new Error("Type de notification inconnu");

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: "contact@les10doigts.com",
      to: data.to,
      subject: tmpl.subject,
      text: tmpl.body,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------- Welcome email ----------

export const sendWelcomeEmail = createServerFn({ method: "POST" })
  .validator((d: { email: string; name: string }) => d)
  .handler(async ({ data }) => {
    const resend = await getResend();
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: "contact@les10doigts.com",
      to: data.email,
      subject: "Bienvenue sur La Méthode des 10 Doigts ! 🎹",
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a2e; font-size: 28px;">Bienvenue, ${data.name} ! 🎉</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Félicitations pour votre inscription sur <strong>La Méthode des 10 Doigts</strong>.
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Vous êtes sur le point de maîtriser le clavier comme un professionnel. Voici ce qui vous attend :
          </p>
          <ul style="color: #555; font-size: 15px; line-height: 1.8;">
            <li>🥉 <strong>100 niveaux</strong> d'exercices progressifs</li>
            <li>📜 <strong>3 certificats</strong> à obtenir (Bronze, Argent, Or)</li>
            <li>🏆 Un <strong>classement</strong> pour vous motiver</li>
          </ul>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Commencez dès maintenant en vous connectant :
          </p>
          <a href="https://www.les10doigts.com/auth" style="display: inline-block; background: #a0714f; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Commencer l'entraînement →</a>
          <p style="color: #999; font-size: 13px; margin-top: 30px;">
            L'équipe La Méthode des 10 Doigts<br/>
            <a href="https://www.les10doigts.com" style="color: #a0714f;">www.les10doigts.com</a>
          </p>
        </div>
      `,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------- Payment confirmation email ----------

export const sendPaymentConfirmation = createServerFn({ method: "POST" })
  .validator((d: { email: string; name: string; plan: string; amount: string }) => d)
  .handler(async ({ data }) => {
    const resend = await getResend();
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: "contact@les10doigts.com",
      to: data.email,
      subject: "Confirmation de paiement — La Méthode des 10 Doigts ✅",
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a2e; font-size: 28px;">Paiement confirmé ! ✅</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Bonjour ${data.name},
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Nous confirmons la réception de votre paiement :
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; color: #888;">Plan</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold;">${data.plan}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; color: #888;">Montant</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold;">${data.amount}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888;">Date</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold;">${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</td>
            </tr>
          </table>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Votre abonnement est maintenant actif. Tous les 100 niveaux sont débloqués !
          </p>
          <a href="https://www.les10doigts.com/app" style="display: inline-block; background: #a0714f; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Accéder à mon espace →</a>
          <p style="color: #999; font-size: 13px; margin-top: 30px;">
            L'équipe La Méthode des 10 Doigts<br/>
            <a href="https://www.les10doigts.com" style="color: #a0714f;">www.les10doigts.com</a>
          </p>
        </div>
      `,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
