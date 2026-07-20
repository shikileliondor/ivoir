import { Link } from '@inertiajs/react';
import { LegalPage, LegalSection } from '@/components/shop/legal-page';
import { contact } from '@/routes';

export default function Terms() {
    return (
        <LegalPage
            title="Conditions générales de vente"
            intro="Les règles qui encadrent vos achats sur ivoircuisson.ci."
            updatedAt="17 juillet 2026"
        >
            <LegalSection title="1. Objet">
                <p>
                    Les présentes conditions générales de vente (CGV) régissent les commandes passées
                    sur le site ivoircuisson.ci auprès d'<strong>IvoirCuisson</strong>, Abidjan —
                    Côte d'Ivoire. Toute commande implique l'acceptation pleine et entière de ces CGV.
                </p>
            </LegalSection>

            <LegalSection title="2. Produits">
                <p>
                    IvoirCuisson conçoit et fabrique des équipements de cuisson (barbecues, fumoirs,
                    foyers à gaz) en acier haute température, assemblés dans son atelier d'Abidjan.
                    Les photographies et visualisations 3D des produits sont aussi fidèles que
                    possible ; des variations mineures de teinte ou de finition peuvent exister,
                    chaque pièce étant fabriquée artisanalement.
                </p>
            </LegalSection>

            <LegalSection title="3. Prix">
                <p>
                    Les prix sont exprimés en <strong>francs CFA (FCFA)</strong>, toutes taxes
                    comprises, hors frais de livraison. Les éventuelles promotions sont affichées sur
                    la fiche produit avec leur période de validité. Le prix facturé est celui en
                    vigueur au moment de la validation de la commande.
                </p>
            </LegalSection>

            <LegalSection title="4. Commande">
                <p>
                    La commande s'effectue en ligne, sans création de compte : vous ajoutez vos
                    produits au panier puis renseignez vos coordonnées de livraison. Une confirmation
                    vous est présentée à l'écran et, si vous avez fourni un email, envoyée par
                    courrier électronique. IvoirCuisson vous contacte ensuite par téléphone pour
                    confirmer la commande et convenir de la livraison.
                </p>
            </LegalSection>

            <LegalSection title="5. Paiement">
                <p>
                    Le paiement s'effectue <strong>à la livraison</strong>, en espèces ou par mobile
                    money, au moment de la remise du produit. Aucun paiement en ligne n'est requis sur
                    le site.
                </p>
            </LegalSection>

            <LegalSection title="6. Livraison">
                <p>
                    Nous livrons à Abidjan et ses environs. Les délais indicatifs sont communiqués
                    lors de la confirmation téléphonique et dépendent de la disponibilité du produit
                    (certaines pièces sont fabriquées à la demande). Pour une livraison dans une autre
                    ville de Côte d'Ivoire,{' '}
                    <Link href={contact.url()} className="text-ember-500 hover:text-ember-400">
                        contactez-nous
                    </Link>{' '}
                    ou écrivez-nous sur WhatsApp pour un devis.
                </p>
            </LegalSection>

            <LegalSection title="7. Retours et annulation">
                <p>
                    Vous pouvez annuler votre commande sans frais tant qu'elle n'a pas été expédiée,
                    par simple appel ou message. À la livraison, vérifiez le produit avant de régler :
                    en cas de défaut constaté à la remise, le produit est repris ou échangé sans
                    frais.
                </p>
            </LegalSection>

            <LegalSection title="8. Garantie et service après-vente">
                <p>
                    Nos équipements sont garantis contre tout défaut de fabrication. L'atelier étant
                    situé à Abidjan, le service après-vente est assuré localement : pièces,
                    réparations et conseils d'entretien. Les dommages résultant d'une utilisation
                    non conforme (surcharge, combustibles inadaptés, modifications) ne sont pas
                    couverts.
                </p>
            </LegalSection>

            <LegalSection title="9. Responsabilité">
                <p>
                    Les produits IvoirCuisson sont des équipements de cuisson à flamme : ils doivent
                    être utilisés par des adultes, à l'extérieur ou dans un espace ventilé, en
                    respectant les consignes de sécurité fournies. IvoirCuisson ne saurait être tenue
                    responsable des dommages résultant du non-respect de ces consignes.
                </p>
            </LegalSection>

            <LegalSection title="10. Droit applicable">
                <p>
                    Les présentes CGV sont soumises au droit ivoirien. En cas de litige, une solution
                    amiable sera recherchée en priorité ; à défaut, les tribunaux d'Abidjan seront
                    compétents.
                </p>
            </LegalSection>
        </LegalPage>
    );
}
