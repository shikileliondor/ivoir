import { Link } from '@inertiajs/react';
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';
import { TikTokIcon } from '@/components/shop/tiktok-icon';
import { WHATSAPP_URL, WhatsAppIcon } from '@/components/shop/whatsapp-icon';
import { useSiteImages } from '@/hooks/use-site-images';
import { about, contact, environment, home, legal, privacy, terms } from '@/routes';
import products from '@/routes/products';

const NAV_LINKS = [
    { label: 'Accueil', href: home.url() },
    { label: 'Produits', href: products.index.url() },
    { label: 'Environnement', href: environment.url() },
    { label: 'À propos', href: about.url() },
    { label: 'Contact', href: contact.url() },
];

const LEGAL_LINKS = [
    { label: 'Politique de confidentialité', href: privacy.url() },
    { label: 'Conditions générales de vente', href: terms.url() },
    { label: 'Mentions légales', href: legal.url() },
];

const SOCIAL_LINKS = [
    { label: 'Facebook', href: 'https://www.facebook.com/ivoircuisson', icon: Facebook },
    { label: 'Instagram', href: 'https://www.instagram.com/ivoircuisson', icon: Instagram },
    { label: 'TikTok', href: 'https://www.tiktok.com/@ivoircuisson', icon: TikTokIcon },
    { label: 'WhatsApp', href: WHATSAPP_URL, icon: WhatsAppIcon },
];

export function SiteFooter() {
    const siteImages = useSiteImages();

    return (
        <footer className="border-t border-coal-800 bg-coal-900">
            <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
                <div className="space-y-4">
                    <img src={siteImages.logo} alt="IvoirCuisson" className="h-28 w-auto" />
                    <p className="text-sm leading-relaxed text-smoke-500">
                        Barbecues et équipements de cuisson premium au style industriel, conçus et assemblés
                        localement à Abidjan.
                    </p>
                </div>

                <nav aria-label="Navigation pied de page">
                    <h3 className="mb-4 text-xs font-semibold tracking-[0.2em] text-ember-500 uppercase">Navigation</h3>
                    <ul className="space-y-2.5">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-sm text-smoke-300 transition-colors hover:text-ember-400"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div>
                    <h3 className="mb-4 text-xs font-semibold tracking-[0.2em] text-ember-500 uppercase">
                        Service client
                    </h3>
                    <ul className="space-y-2.5 text-sm text-smoke-300">
                        <li>
                            <a
                                href="tel:+2250777777058"
                                className="flex items-center gap-2 transition-colors hover:text-ember-400"
                            >
                                <Phone className="size-4 text-ember-500" />
                                +225 07 77 77 70 58
                            </a>
                        </li>
                        <li>
                            <a
                                href="mailto:ivoircuisson@dym.ci"
                                className="flex items-center gap-2 transition-colors hover:text-ember-400"
                            >
                                <Mail className="size-4 text-ember-500" />
                                ivoircuisson@dym.ci
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-4 text-xs font-semibold tracking-[0.2em] text-ember-500 uppercase">Suivez-nous</h3>
                    <div className="flex gap-3">
                        {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={label}
                                className="flex size-10 items-center justify-center rounded-full border border-coal-700 text-smoke-300 transition-colors hover:border-ember-500 hover:text-ember-400"
                            >
                                <Icon className="size-4" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-coal-800 px-5 py-6 text-center text-xs text-smoke-500">
                <nav aria-label="Liens légaux" className="mb-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                    {LEGAL_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="transition-colors hover:text-ember-400"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
                © {new Date().getFullYear()} IvoirCuisson. Tous droits réservés. Fait par{' '}
                <a
                    href="https://www.linkedin.com/in/yann-morel-effobi-brou-5474782a1/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-ember-500 transition-colors hover:text-ember-400"
                >
                    DYM DEV
                </a>
                .
            </div>
        </footer>
    );
}
