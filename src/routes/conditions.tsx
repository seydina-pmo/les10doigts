import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const Route = createFileRoute("/conditions")({
  head: () => ({
    meta: [{ title: "Conditions d'utilisation — La Méthode des 10 Doigts" }],
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
          Conditions d&apos;utilisation
        </h1>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-[#5a7a9a]">
          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">1. Objet</h2>
            <p className="mt-3">
              Les présentes conditions générales d&apos;utilisation régissent l&apos;accès et
              l&apos;utilisation du site <strong>les10doigts.com</strong> et de ses services
              d&apos;apprentissage de la frappe au clavier.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">2. Accès au service</h2>
            <p className="mt-3">
              L&apos;inscription est ouverte à toute personne physique ou morale. L&apos;accès
              aux 3 premiers niveaux est gratuit. L&apos;accès aux niveaux 4 à 100 nécessite
              un abonnement payant.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">3. Compte utilisateur</h2>
            <p className="mt-3">
              Vous êtes responsable de la confidentialité de vos identifiants de connexion.
              Chaque compte est personnel et limité à 2 appareils simultanés. En cas d&apos;utilisation
              sur un 3ème appareil, la session la plus ancienne sera automatiquement déconnectée.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">4. Abonnement et paiement</h2>
            <ul className="mt-3 list-disc pl-6 space-y-1">
              <li><strong>Particulier</strong> : 10 € par mois, sans engagement</li>
              <li><strong>École</strong> : 115 € par mois (ou 1 150 € par an)</li>
              <li>Le paiement est traité de manière sécurisée par <strong>Stripe</strong></li>
              <li>Vous pouvez résilier à tout moment depuis votre espace ou en nous contactant</li>
              <li>Aucun remboursement n&apos;est effectué pour le mois en cours</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">5. Propriété intellectuelle</h2>
            <p className="mt-3">
              L&apos;ensemble du contenu du site (textes, exercices, design, logo, code source)
              est la propriété exclusive de La Méthode des 10 Doigts. Toute reproduction ou
              utilisation non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">6. Certifications</h2>
            <p className="mt-3">
              Les certifications Bronze, Argent et Or sont délivrées sous forme numérique
              après réussite de l&apos;examen correspondant. Elles attestent du niveau de
              compétence atteint sur la plateforme mais ne constituent pas un diplôme officiel.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">7. Compte école</h2>
            <p className="mt-3">
              Les établissements scolaires peuvent ouvrir un compte école permettant de gérer
              des classes et des élèves. Le responsable de l&apos;établissement est garant de
              l&apos;utilisation conforme du service par ses élèves.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">8. Limitation de responsabilité</h2>
            <p className="mt-3">
              Le service est fourni « en l&apos;état ». Nous mettons tout en œuvre pour
              assurer sa disponibilité mais ne garantissons pas un fonctionnement ininterrompu.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-[#1e3a5f]">9. Contact</h2>
            <p className="mt-3">
              Pour toute question, contactez-nous à :{" "}
              <a href="mailto:contact@les10doigts.com" className="text-[#4361ee] underline">contact@les10doigts.com</a>.
            </p>
          </section>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
