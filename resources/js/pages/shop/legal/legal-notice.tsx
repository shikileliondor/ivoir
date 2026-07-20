import { LegalPage, LegalSection } from '@/components/shop/legal-page';

export default function LegalNotice() {
    return (
        <LegalPage
            title="Mentions légales"
            intro="Informations légales relatives au site ivoircuisson.ci."
            updatedAt="17 juillet 2026"
        >
            <LegalSection title="Éditeur du site">
                <p>
                    <strong>IvoirCuisson</strong>
                    <br />
                    Abidjan — Côte d'Ivoire
                    <br />
                    Téléphone : +225 07 77 77 70 58
                    <br />
                    Email :{' '}
                    <a href="mailto:ivoircuisson@dym.ci" className="text-ember-500 hover:text-ember-400">
                        ivoircuisson@dym.ci
                    </a>
                </p>
                <p>Directeur de la publication : IvoirCuisson.</p>
            </LegalSection>

            <LegalSection title="Hébergement">
                <p>
                    Les informations d'hébergement seront précisées lors de la mise en ligne
                    définitive du site.
                </p>
            </LegalSection>

            <LegalSection title="Propriété intellectuelle">
                <p>
                    L'ensemble des éléments du site (textes, photographies, visualisations 3D, logo,
                    charte graphique) est la propriété exclusive d'IvoirCuisson ou fait l'objet d'une
                    autorisation d'utilisation. Toute reproduction, représentation ou exploitation,
                    totale ou partielle, sans autorisation écrite préalable est interdite.
                </p>
            </LegalSection>

            <LegalSection title="Données personnelles">
                <p>
                    Le traitement des données personnelles est décrit dans notre politique de
                    confidentialité, conforme à la loi ivoirienne n° 2013-450 relative à la
                    protection des données à caractère personnel.
                </p>
            </LegalSection>

            <LegalSection title="Conception et réalisation">
                <p>
                    Site conçu et développé par{' '}
                    <a
                        href="https://www.linkedin.com/in/yann-morel-effobi-brou-5474782a1/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-ember-500 hover:text-ember-400"
                    >
                        DYM DEV
                    </a>
                    .
                </p>
            </LegalSection>
        </LegalPage>
    );
}
