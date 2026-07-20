import { Link } from '@inertiajs/react';
import { LegalPage, LegalSection } from '@/components/shop/legal-page';
import { contact } from '@/routes';

export default function Privacy() {
    return (
        <LegalPage
            title="Politique de confidentialité"
            intro="Comment IvoirCuisson collecte, utilise et protège vos données personnelles."
            updatedAt="17 juillet 2026"
        >
            <LegalSection title="1. Qui sommes-nous ?">
                <p>
                    Le site ivoircuisson.ci est édité par <strong>IvoirCuisson</strong>, fabricant
                    d'équipements de cuisson basé à Abidjan (Côte d'Ivoire). Pour toute question
                    relative à vos données personnelles, contactez-nous à{' '}
                    <a href="mailto:ivoircuisson@dym.ci" className="text-ember-500 hover:text-ember-400">
                        ivoircuisson@dym.ci
                    </a>{' '}
                    ou au +225 07 77 77 70 58.
                </p>
            </LegalSection>

            <LegalSection title="2. Données que nous collectons">
                <p>Nous ne collectons que les données strictement nécessaires au service :</p>
                <ul>
                    <li>
                        <strong>Commandes</strong> : nom, numéro de téléphone, adresse de livraison,
                        ville et, si vous le renseignez, adresse email — uniquement pour préparer et
                        livrer votre commande.
                    </li>
                    <li>
                        <strong>Formulaire de contact</strong> : vos coordonnées et votre message,
                        pour vous répondre.
                    </li>
                    <li>
                        <strong>Newsletter</strong> : votre adresse email, si vous vous inscrivez
                        volontairement.
                    </li>
                    <li>
                        <strong>Statistiques de visite</strong> : nous comptons les pages vues de
                        façon anonymisée (identifiant de session chiffré, sans adresse IP ni profilage).
                    </li>
                </ul>
                <p>
                    Aucun paiement n'est traité en ligne : le règlement s'effectue à la livraison.
                    Nous ne collectons donc aucune donnée bancaire sur ce site.
                </p>
            </LegalSection>

            <LegalSection title="3. Utilisation de vos données">
                <p>Vos données servent exclusivement à :</p>
                <ul>
                    <li>traiter et livrer vos commandes, et vous en tenir informé ;</li>
                    <li>répondre à vos messages ;</li>
                    <li>vous envoyer nos actualités si vous êtes inscrit à la newsletter ;</li>
                    <li>mesurer la fréquentation du site pour l'améliorer.</li>
                </ul>
                <p>
                    Elles ne sont <strong>jamais vendues ni transmises à des tiers</strong> à des fins
                    commerciales. Elles ne sont accessibles qu'à l'équipe IvoirCuisson.
                </p>
            </LegalSection>

            <LegalSection title="4. Cookies et stockage local">
                <p>Le site utilise uniquement des éléments techniques indispensables :</p>
                <ul>
                    <li>
                        <strong>Cookies de session</strong> : maintien de votre navigation et
                        protection des formulaires (sécurité CSRF).
                    </li>
                    <li>
                        <strong>Stockage local de votre navigateur</strong> : contenu de votre panier
                        et préférences d'affichage (intro et messages d'accueil déjà vus), conservés
                        sur votre appareil uniquement.
                    </li>
                </ul>
                <p>
                    Aucun cookie publicitaire ni traceur tiers n'est utilisé. Vous pouvez effacer ces
                    données à tout moment depuis les réglages de votre navigateur.
                </p>
            </LegalSection>

            <LegalSection title="5. Conservation">
                <p>
                    Les données de commande sont conservées le temps nécessaire au suivi commercial et
                    aux obligations comptables. Les messages de contact sont supprimés une fois
                    traités. Vous pouvez vous désinscrire de la newsletter à tout moment sur simple
                    demande.
                </p>
            </LegalSection>

            <LegalSection title="6. Vos droits">
                <p>
                    Conformément à la loi ivoirienne n° 2013-450 du 19 juin 2013 relative à la
                    protection des données à caractère personnel, vous disposez d'un droit d'accès,
                    de rectification, d'opposition et de suppression de vos données. Pour l'exercer,{' '}
                    <Link href={contact.url()} className="text-ember-500 hover:text-ember-400">
                        contactez-nous
                    </Link>{' '}
                    — nous répondons sous 30 jours. Vous pouvez également saisir l'ARTCI, autorité de
                    protection des données en Côte d'Ivoire.
                </p>
            </LegalSection>

            <LegalSection title="7. Sécurité">
                <p>
                    Nous appliquons des mesures techniques et organisationnelles raisonnables
                    (accès restreint, mots de passe robustes, mises à jour régulières) pour protéger
                    vos données contre la perte, l'accès non autorisé ou la divulgation.
                </p>
            </LegalSection>
        </LegalPage>
    );
}
