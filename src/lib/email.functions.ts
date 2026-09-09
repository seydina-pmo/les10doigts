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
      to: data.to,
      subject: tmpl.subject,
      text: tmpl.body,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
