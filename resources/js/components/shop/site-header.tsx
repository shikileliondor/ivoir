import { Link, usePage } from '@inertiajs/react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '@/components/shop/cart-provider';
import { useSiteImages } from '@/hooks/use-site-images';
import { cn } from '@/lib/utils';
import { about, contact, environment, home } from '@/routes';
import products from '@/routes/products';

const NAV_LINKS = [
    { label: 'Accueil', href: home.url() },
    { label: 'Produits', href: products.index.url() },
    { label: 'Environnement', href: environment.url() },
    { label: 'À propos', href: about.url() },
    { label: 'Contact', href: contact.url() },
];

export function SiteHeader() {
    const { url } = usePage();
    const { count, openCart } = useCart();
    const siteImages = useSiteImages();
    const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 24);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [previousUrl, setPreviousUrl] = useState(url);

    // Referme le menu mobile à chaque navigation (ajustement pendant le rendu).
    if (previousUrl !== url) {
        setPreviousUrl(url);
        setMobileOpen(false);
    }

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const isActive = (href: string) => (href === '/' ? url === '/' : url.startsWith(href));

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 transition-all duration-500',
                scrolled || mobileOpen
                    ? 'bg-coal-950/85 shadow-[0_1px_0_0_var(--color-coal-800)] backdrop-blur-xl'
                    : 'bg-transparent',
            )}
        >
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
                <Link href={home.url()} className="group flex items-center" aria-label="IvoirCuisson — Accueil">
                    <img
                        src={siteImages.logo}
                        alt="IvoirCuisson"
                        className="h-14 w-auto transition-transform duration-300 group-hover:scale-105"
                    />
                </Link>

                <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigation principale">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'relative text-sm font-medium tracking-wide transition-colors duration-300 after:absolute after:-bottom-1.5 after:left-0 after:h-px after:bg-ember-500 after:transition-all after:duration-300',
                                isActive(link.href)
                                    ? 'text-ember-400 after:w-full'
                                    : 'text-smoke-300 after:w-0 hover:text-smoke-100 hover:after:w-full',
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={openCart}
                        className="relative flex size-11 items-center justify-center rounded-full border border-coal-700 text-smoke-100 transition-colors duration-300 hover:border-ember-500 hover:text-ember-400"
                        aria-label={`Ouvrir le panier (${count} article${count > 1 ? 's' : ''})`}
                    >
                        <ShoppingBag className="size-5" />
                        {count > 0 && (
                            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-ember-500 text-[11px] font-bold text-coal-950">
                                {count > 9 ? '9+' : count}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setMobileOpen((open) => !open)}
                        className="flex size-11 items-center justify-center rounded-full border border-coal-700 text-smoke-100 transition-colors duration-300 hover:border-ember-500 lg:hidden"
                        aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <nav
                    className="border-t border-coal-800 bg-coal-950/95 px-5 py-6 backdrop-blur-xl lg:hidden"
                    aria-label="Navigation mobile"
                >
                    <ul className="flex flex-col gap-1">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={cn(
                                        'block rounded-lg px-4 py-3 font-display text-2xl tracking-wider transition-colors',
                                        isActive(link.href)
                                            ? 'bg-coal-900 text-ember-400'
                                            : 'text-smoke-100 hover:bg-coal-900 hover:text-ember-300',
                                    )}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </header>
    );
}
