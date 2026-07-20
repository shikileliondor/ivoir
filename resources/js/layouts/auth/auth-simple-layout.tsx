import { Link } from '@inertiajs/react';
import { ArrowLeft, BadgePercent, Flame, ShoppingBag } from 'lucide-react';
import { useSiteImages } from '@/hooks/use-site-images';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const FEATURES = [
    { icon: ShoppingBag, text: 'Gérez vos commandes et votre catalogue' },
    { icon: BadgePercent, text: 'Pilotez vos prix et vos promotions' },
    { icon: Flame, text: 'Suivez vos ventes et vos visiteurs' },
];

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const siteImages = useSiteImages();

    return (
        <div className="flex min-h-svh bg-coal-950">
            {/* Panneau photo */}
            <div className="relative hidden lg:flex lg:w-1/2 xl:w-[55%]">
                <img
                    src="/images/pag de connexion.jpg"
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/80" />

                <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
                    <Link
                        href={home()}
                        aria-label="IvoirCuisson — Accueil"
                        className="flex w-fit items-center gap-3"
                    >
                        <span className="flex size-12 items-center justify-center overflow-hidden rounded-xl bg-white/95 p-1.5">
                            <img
                                src={siteImages.logo}
                                alt=""
                                className="size-full object-contain"
                            />
                        </span>
                        <span className="font-display text-2xl tracking-widest text-white uppercase">
                            IvoirCuisson
                        </span>
                    </Link>

                    <div className="max-w-md">
                        <h2 className="font-display text-5xl leading-none tracking-wide text-white uppercase xl:text-6xl">
                            Bienvenue sur votre{' '}
                            <span className="text-ember-300">espace</span>
                        </h2>
                        <p className="mt-5 text-lg leading-relaxed text-white/80">
                            Accédez à votre compte pour gérer la boutique,
                            suivre les commandes et animer vos promotions.
                        </p>

                        <ul className="mt-9 space-y-4">
                            {FEATURES.map(({ icon: Icon, text }) => (
                                <li
                                    key={text}
                                    className="flex items-center gap-4 text-white/90"
                                >
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur">
                                        <Icon className="size-5 text-ember-300" />
                                    </span>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="text-sm text-white/60">
                        © {new Date().getFullYear()} IvoirCuisson. Tous droits
                        réservés.
                    </p>
                </div>
            </div>

            {/* Panneau formulaire */}
            <div className="relative flex flex-1 flex-col p-6 md:p-10">
                <div className="flex justify-end">
                    <Link
                        href={home()}
                        className="group inline-flex items-center gap-2 text-sm font-medium text-smoke-500 transition-colors hover:text-ember-500"
                    >
                        <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
                        Retour au site
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center py-10">
                    <div className="w-full max-w-sm">
                        <Link
                            href={home()}
                            aria-label="IvoirCuisson — Accueil"
                            className="mb-8 flex justify-center lg:hidden"
                        >
                            <img
                                src={siteImages.logo}
                                alt="IvoirCuisson"
                                className="h-14 w-auto"
                            />
                        </Link>

                        <div className="mb-8 text-center">
                            <h1 className="font-display text-4xl tracking-wide text-smoke-100 uppercase">
                                {title}
                            </h1>
                            <p className="mt-2 text-sm text-smoke-500">
                                {description}
                            </p>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
