import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [{ title: "Politique de confidentialité — La Méthode des 10 Doigts" }],
  }),
  component: Page,
});

function Page() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 py-16 animate-fade-in">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4361ee]">
          dernière mise à jour : septembre 2026
        </p>
        <h1 className="mt-4 font-serif text-4xl text-[#1e3a5f]">
          Politique de confidentialité
        </h1>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-[#5a7a9a]">
          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">1. Responsable du traitement</h2>
            <p className="mt-3">
              Le site <strong>les10doigts.com</strong> est édité par La Méthode des 10 Doigts.
              Pour toute question relative à vos données personnelles, contactez-nous à :{" "}
              <a href="mailto:contact@les10doigts.com" className="text-[#4361ee] underline">contact@les10doigts.com</a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">2. Données collectées</h2>
            <p className="mt-3">Nous collectons les données suivantes :</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li><strong>Compte utilisateur</strong> : nom, adresse e-mail, mot de passe hashé</li>
              <li><strong>Connexion Google OAuth</strong> : nom et adresse e-mail de votre compte Google</li>
              <li><strong>Données d&apos;exercice</strong> : niveau atteint, vitesse de frappe (MPM), précision, touches en erreur</li>
              <li><strong>Paiement</strong> : les paiements sont traités par Stripe. Nous ne stockons aucune donnée de carte bancaire.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">3. Finalités du traitement</h2>
            <ul className="mt-3 list-disc pl-6 space-y-1">
              <li>Fournir le service d&apos;apprentissage de la frappe au clavier</li>
              <li>Suivre votre progression et générer vos certifications</li>
              <li>Gérer votre abonnement et votre facturation</li>
              <li>Vous contacter en cas de besoin lié à votre compte</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">4. Base légale</h2>
            <p className="mt-3">
              Le traitement de vos données est fondé sur l&apos;exécution du contrat
              (votre utilisation du service) et votre consentement (connexion via Google).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">5. Durée de conservation</h2>
            <p className="mt-3">
              Vos données sont conservées tant que votre compte est actif. En cas de suppression
              de compte, vos données sont supprimées sous 30 jours.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">6. Partage des données</h2>
            <p className="mt-3">
              Vos données ne sont jamais vendues. Elles sont partagées uniquement avec :
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li><strong>Supabase</strong> (hébergement et base de données)</li>
              <li><strong>Stripe</strong> (traitement des paiements)</li>
              <li><strong>Vercel</strong> (hébergement du site)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">7. Vos droits</h2>
            <p className="mt-3">
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
              de suppression et de portabilité de vos données. Pour exercer ces droits,
              contactez <a href="mailto:contact@les10doigts.com" className="text-[#4361ee] underline">contact@les10doigts.com</a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">8. Cookies</h2>
            <p className="mt-3">
              Nous utilisons uniquement des cookies techniques nécessaires au fonctionnement
              du service (session d&apos;authentification). Aucun cookie publicitaire ou de suivi n&apos;est utilisé.
            </p>
          </section>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
