import { Head, Link, useForm } from '@inertiajs/react';
import gsap from 'gsap';
import {
    ArrowRight,
    Banknote,
    ChevronLeft,
    ChevronRight,
    CloudOff,
    Factory,
    Flame,
    Hammer,
    MapPin,
    ShieldCheck,
    Star,
    Timer,
    Truck,
    X,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { FireIntro } from '@/components/shop/fire-intro';
import { FumoirScroll } from '@/components/shop/fumoir-scroll';
import { ProductCard } from '@/components/shop/product-card';
import { SectionReveal } from '@/components/shop/section-reveal';
import { useSiteImages } from '@/hooks/use-site-images';
import newsletter from '@/routes/newsletter';
import products from '@/routes/products';
import type { ShopProduct } from '@/types/shop';

interface HomeProps {
    featuredProducts: ShopProduct[];
}

const BENEFITS = [
    {
        icon: Timer,
        title: 'Cuisson rapide',
        text: 'La chaleur concentrée là où il faut.',
    },
    {
        icon: ShieldCheck,
        title: 'Sécurité maîtrisée',
        text: 'Doubles parois anti-surchauffe.',
    },
    {
        icon: CloudOff,
        title: 'Moins de fumée',
        text: 'Une combustion propre et saine.',
    },
    {
        icon: Hammer,
        title: 'Acier durable',
        text: 'Haute température, bâti pour durer.',
    },
    {
        icon: MapPin,
        title: 'Fabriqué en CI',
        text: 'Conçu et assemblé à Abidjan.',
    },
    {
        icon: Banknote,
        title: 'Économique',
        text: 'Moins de combustible consommé.',
    },
];

const COMPARISON_ROWS: {
    label: string;
    ivoir: string;
    traditional: string;
    imported: string;
}[] = [
    {
        label: 'Consommation de combustible',
        ivoir: 'Réduite — chaleur concentrée',
        traditional: 'Élevée',
        imported: 'Variable',
    },
    {
        label: 'Émissions de fumée',
        ivoir: 'Fortement réduites',
        traditional: 'Importantes',
        imported: 'Moyennes',
    },
    {
        label: 'Durabilité',
        ivoir: 'Acier haute température',
        traditional: 'Faible',
        imported: 'Correcte',
    },
    {
        label: 'Fabrication locale & SAV',
        ivoir: 'Atelier à Abidjan, pièces dispo',
        traditional: '—',
        imported: 'SAV lointain, pièces rares',
    },
    {
        label: 'Adapté aux réalités locales',
        ivoir: 'Pensé pour nos cuisines',
        traditional: 'Oui, mais polluant',
        imported: 'Rarement',
    },
];

const JOURNEY_STEPS = [
    {
        icon: Factory,
        step: '01',
        title: 'Conçu à Abidjan',
        text: "Chaque équipement est dessiné dans notre atelier, pensé pour les usages et les cuisines d'ici.",
    },
    {
        icon: Hammer,
        step: '02',
        title: 'Fabriqué en acier recyclable',
        text: 'Découpe, soudure, thermolaquage : des standards industriels rigoureux à chaque étape.',
    },
    {
        icon: Truck,
        step: '03',
        title: 'Livré chez vous',
        text: "Nous livrons et nous restons joignables — le service après-vente est à côté, pas à l'étranger.",
    },
];

const TESTIMONIALS = [
    {
        quote: 'La qualité est exceptionnelle. On sent la robustesse et le travail bien fait. En plus, savoir que la fabrication est locale et responsable fait toute la différence.',
        author: 'Mariam K.',
        role: 'Restauratrice, Abidjan',
    },
    {
        quote: "En tant que chef, j'ai besoin d'un barbecue fiable pour une cuisson parfaite. Les équipements IvoirCuisson offrent une chaleur maîtrisée et constante.",
        author: 'Chef Yao',
        role: 'Chef cuisinier, Cocody',
    },
    {
        quote: 'Mon foyer Copper Flame consomme beaucoup moins de gaz que mon ancien réchaud. Robuste, stable, et il est beau dans ma cuisine.',
        author: 'Aïcha D.',
        role: 'Particulière, Yopougon',
    },
];

export default function Home({ featuredProducts }: HomeProps) {
    const heroRef = useRef<HTMLDivElement>(null);
    const siteImages = useSiteImages();
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const [testimonialsPaused, setTestimonialsPaused] = useState(false);
    const testimonialRef = useRef<HTMLDivElement>(null);
    const newsletterForm = useForm({ email: '' });

    // Défilement automatique des témoignages, en pause au survol.
    // testimonialIndex en dépendance : toute navigation manuelle
    // redémarre le compte à rebours de 6 s.
    useEffect(() => {
        if (testimonialsPaused) {
            return;
        }

        const id = window.setInterval(() => {
            setTestimonialIndex((index) => (index + 1) % TESTIMONIALS.length);
        }, 6000);

        return () => window.clearInterval(id);
    }, [testimonialsPaused, testimonialIndex]);

    // Fondu + léger glissement à chaque changement de témoignage.
    useLayoutEffect(() => {
        const element = testimonialRef.current;

        if (!element) {
            return;
        }

        const tween = gsap.fromTo(
            element,
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' },
        );

        return () => {
            tween.kill();
        };
    }, [testimonialIndex]);

    useLayoutEffect(() => {
        const hero = heroRef.current;

        if (!hero) {
            return;
        }

        const context = gsap.context(() => {
            gsap.timeline({ delay: 0.2 })
                .fromTo(
                    '[data-hero-line]',
                    { yPercent: 110 },
                    {
                        yPercent: 0,
                        duration: 1.1,
                        stagger: 0.12,
                        ease: 'power4.out',
                    },
                )
                .fromTo(
                    '[data-hero-fade]',
                    { autoAlpha: 0, y: 24 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.9,
                        stagger: 0.15,
                        ease: 'power3.out',
                    },
                    '-=0.5',
                );
        }, hero);

        return () => context.revert();
    }, []);

    const previousTestimonial = () =>
        setTestimonialIndex(
            (index) => (index - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
        );
    const nextTestimonial = () =>
        setTestimonialIndex((index) => (index + 1) % TESTIMONIALS.length);

    const submitNewsletter = (event: FormEvent) => {
        event.preventDefault();

        newsletterForm.post(newsletter.subscribe.url(), {
            preserveScroll: true,
            onSuccess: () => {
                newsletterForm.reset();
                toast.success('Merci ! Vous êtes inscrit à nos actualités.');
            },
        });
    };

    const testimonial = TESTIMONIALS[testimonialIndex];
    const fumoir = featuredProducts.find((product) =>
        product.slug.includes('fumoir'),
    );
    const fumoirUrl = fumoir
        ? products.show.url({ product: fumoir.slug })
        : products.index.url();

    return (
        <>
            <Head title="IvoirCuisson — L'innovation au service du goût" />
            <FireIntro />

            {/* Hero */}
            <section
                ref={heroRef}
                className="flex min-h-svh flex-col justify-center px-5 pt-28 pb-16 lg:px-8"
            >
                <div className="mx-auto w-full max-w-5xl text-center">
                    <p
                        data-hero-fade
                        className="mb-6 text-xs font-semibold tracking-[0.35em] text-ember-500 uppercase opacity-0"
                    >
                        100 % fabriqué en Côte d'Ivoire
                    </p>

                    <h1 className="font-display text-[clamp(3.2rem,10vw,8rem)] leading-[0.92] tracking-wide text-smoke-100 uppercase">
                        <span className="block overflow-hidden">
                            <span data-hero-line className="block">
                                L'innovation au
                            </span>
                        </span>
                        <span className="block overflow-hidden">
                            <span data-hero-line className="block">
                                service{' '}
                                <span className="text-ember-500">du goût</span>
                            </span>
                        </span>
                    </h1>

                    <p
                        data-hero-fade
                        className="mx-auto mt-6 max-w-md text-smoke-300 opacity-0"
                    >
                        Barbecues, fumoirs et foyers de cuisson professionnels,
                        livrés directement chez vous.
                    </p>

                    <div
                        data-hero-fade
                        className="mt-9 flex items-center justify-center gap-4 opacity-0"
                    >
                        <Link
                            href={products.index.url()}
                            className="group flex items-center gap-3 rounded-full bg-ember-500 px-8 py-4 text-sm font-bold tracking-wide text-coal-950 uppercase transition-all duration-300 hover:bg-ember-400 hover:shadow-ember"
                        >
                            Voir nos produits
                            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </div>

                    {/* Visuel produit central */}
                    <div
                        data-hero-fade
                        className="relative mx-auto mt-14 max-w-3xl opacity-0"
                    >
                        <img
                            src={siteImages.home_hero}
                            alt="Barbecue IvoirCuisson avec brochettes en cuisson"
                            className="aspect-[16/10] w-full rounded-[2.5rem] border border-coal-800 object-cover"
                        />
                        <div className="absolute -top-4 -right-4 flex items-center gap-1.5 rounded-full bg-smoke-100 px-4 py-2 text-xs font-bold text-coal-950">
                            <Star className="size-3.5 fill-ember-400 text-ember-400" />
                            Approuvé par les chefs
                        </div>
                    </div>
                </div>
            </section>

            {/* Bénéfices */}
            <section className="border-y border-coal-800 bg-coal-900/60">
                <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
                    <SectionReveal>
                        <h2 className="text-center font-display text-4xl tracking-wide text-smoke-100 uppercase sm:text-5xl">
                            Pourquoi{' '}
                            <span className="text-ember-500">IvoirCuisson</span>{' '}
                            ?
                        </h2>
                    </SectionReveal>

                    <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
                        {BENEFITS.map((benefit, index) => (
                            <SectionReveal
                                key={benefit.title}
                                delay={index * 0.06}
                            >
                                <div className="text-center">
                                    <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-coal-700 bg-coal-950">
                                        <benefit.icon className="size-7 text-ember-500" />
                                    </div>
                                    <h3 className="mt-4 text-sm font-bold text-smoke-100">
                                        {benefit.title}
                                    </h3>
                                    <p className="mt-1 text-xs leading-relaxed text-smoke-500">
                                        {benefit.text}
                                    </p>
                                </div>
                            </SectionReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Fumoir Aurora Smoker en 3D — assemblage au scroll */}
            <FumoirScroll productUrl={fumoirUrl} />

            {/* Produits phares */}
            <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
                <SectionReveal>
                    <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
                        <h2 className="font-display text-4xl tracking-wide text-smoke-100 uppercase sm:text-5xl">
                            Nos produits{' '}
                            <span className="text-ember-500">phares</span>
                        </h2>
                        <Link
                            href={products.index.url()}
                            className="group flex items-center gap-2 text-sm font-semibold tracking-wide text-ember-500 uppercase transition-colors hover:text-ember-400"
                        >
                            Tout voir
                            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </SectionReveal>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {featuredProducts.map((product, index) => (
                        <SectionReveal key={product.id} delay={index * 0.1}>
                            <ProductCard product={product} />
                        </SectionReveal>
                    ))}
                </div>
            </section>

            {/* Comparatif */}
            <section className="border-y border-coal-800 bg-coal-900/60">
                <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8">
                    <SectionReveal>
                        <h2 className="text-center font-display text-4xl tracking-wide text-smoke-100 uppercase sm:text-5xl">
                            Faites la{' '}
                            <span className="text-ember-500">comparaison</span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-smoke-300">
                            IvoirCuisson face au foyer traditionnel et aux
                            équipements importés.
                        </p>
                    </SectionReveal>

                    <SectionReveal delay={0.15}>
                        <div className="mt-14 overflow-x-auto">
                            <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
                                <thead>
                                    <tr>
                                        <th
                                            className="w-1/4 pb-5"
                                            aria-label="Critère"
                                        />
                                        <th className="w-1/4 rounded-t-2xl border-x border-t border-ember-500 bg-coal-950 px-5 pt-5 pb-4">
                                            <span className="font-display text-xl tracking-wider text-ember-500 uppercase">
                                                IvoirCuisson
                                            </span>
                                        </th>
                                        <th className="w-1/4 px-5 pb-4 font-semibold text-smoke-300">
                                            Foyer traditionnel
                                        </th>
                                        <th className="w-1/4 px-5 pb-4 font-semibold text-smoke-300">
                                            Équipement importé
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {COMPARISON_ROWS.map((row, index) => {
                                        const isLast =
                                            index ===
                                            COMPARISON_ROWS.length - 1;

                                        return (
                                            <tr key={row.label}>
                                                <td className="border-t border-coal-800 py-4 pr-5 font-semibold text-smoke-100">
                                                    {row.label}
                                                </td>
                                                <td
                                                    className={`border-x border-t border-x-ember-500 border-t-coal-800 bg-coal-950 px-5 py-4 font-medium text-smoke-100 ${isLast ? 'rounded-b-2xl border-b border-b-ember-500' : ''}`}
                                                >
                                                    <span className="flex items-start gap-2">
                                                        <Flame className="mt-0.5 size-4 shrink-0 text-ember-500" />
                                                        {row.ivoir}
                                                    </span>
                                                </td>
                                                <td className="border-t border-coal-800 px-5 py-4 text-smoke-500">
                                                    <span className="flex items-start gap-2">
                                                        <X className="mt-0.5 size-4 shrink-0 text-smoke-500/60" />
                                                        {row.traditional}
                                                    </span>
                                                </td>
                                                <td className="border-t border-coal-800 px-5 py-4 text-smoke-500">
                                                    <span className="flex items-start gap-2">
                                                        <X className="mt-0.5 size-4 shrink-0 text-smoke-500/60" />
                                                        {row.imported}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </SectionReveal>
                </div>
            </section>

            {/* Parcours */}
            <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
                <SectionReveal>
                    <h2 className="text-center font-display text-4xl tracking-wide text-smoke-100 uppercase sm:text-5xl">
                        De l'atelier à{' '}
                        <span className="text-ember-500">votre cuisine</span>
                    </h2>
                </SectionReveal>

                <div className="mt-14 grid gap-6 md:grid-cols-3">
                    {JOURNEY_STEPS.map((step, index) => (
                        <SectionReveal key={step.step} delay={index * 0.12}>
                            <div className="h-full rounded-3xl border border-coal-800 bg-coal-900/50 p-8">
                                <div className="flex items-center justify-between">
                                    <step.icon className="size-9 text-ember-500" />
                                    <span className="font-display text-4xl text-coal-700">
                                        {step.step}
                                    </span>
                                </div>
                                <h3 className="mt-5 font-display text-2xl tracking-wide text-smoke-100">
                                    {step.title}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-smoke-300">
                                    {step.text}
                                </p>
                            </div>
                        </SectionReveal>
                    ))}
                </div>
            </section>

            {/* Témoignages — carrousel à défilement automatique */}
            <section
                className="border-y border-coal-800 bg-coal-900/60"
                onMouseEnter={() => setTestimonialsPaused(true)}
                onMouseLeave={() => setTestimonialsPaused(false)}
            >
                <div className="mx-auto max-w-4xl px-5 py-24 text-center lg:px-8">
                    <SectionReveal>
                        <div className="flex items-center justify-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className="size-5 fill-ember-400 text-ember-400"
                                />
                            ))}
                        </div>

                        <div ref={testimonialRef}>
                            <blockquote className="mt-8 min-h-32 text-xl leading-relaxed text-smoke-100 sm:text-2xl">
                                “{testimonial.quote}”
                            </blockquote>

                            <p className="mt-6 font-semibold text-smoke-100">
                                {testimonial.author}
                            </p>
                            <p className="text-sm text-smoke-500">
                                {testimonial.role}
                            </p>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={previousTestimonial}
                                className="flex size-11 items-center justify-center rounded-full border border-coal-700 text-smoke-300 transition-colors hover:border-ember-500 hover:text-ember-500"
                                aria-label="Témoignage précédent"
                            >
                                <ChevronLeft className="size-5" />
                            </button>
                            <div className="flex gap-2">
                                {TESTIMONIALS.map((item, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() =>
                                            setTestimonialIndex(index)
                                        }
                                        className={`size-2 rounded-full transition-colors ${index === testimonialIndex ? 'bg-ember-500' : 'hover:bg-coal-600 bg-coal-700'}`}
                                        aria-label={`Témoignage de ${item.author}`}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={nextTestimonial}
                                className="flex size-11 items-center justify-center rounded-full border border-coal-700 text-smoke-300 transition-colors hover:border-ember-500 hover:text-ember-500"
                                aria-label="Témoignage suivant"
                            >
                                <ChevronRight className="size-5" />
                            </button>
                        </div>
                    </SectionReveal>
                </div>
            </section>

            {/* Newsletter */}
            <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
                <SectionReveal>
                    <div className="rounded-[2.5rem] bg-smoke-100 px-8 py-16 text-center sm:px-16">
                        <h2 className="font-display text-4xl tracking-wide text-coal-950 uppercase sm:text-5xl">
                            Restez au courant{' '}
                            <span className="text-ember-400">du feu</span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-md text-sm text-coal-800">
                            Nouveautés, conseils de cuisson et offres spéciales
                            — directement dans votre boîte mail.
                        </p>

                        <form
                            onSubmit={submitNewsletter}
                            className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row"
                        >
                            <div className="flex-1">
                                <input
                                    type="email"
                                    value={newsletterForm.data.email}
                                    onChange={(event) =>
                                        newsletterForm.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Votre adresse email"
                                    required
                                    aria-label="Votre adresse email"
                                    className="w-full rounded-full border border-coal-700/40 bg-coal-950 px-6 py-4 text-sm text-smoke-100 placeholder:text-smoke-500 focus:border-ember-500 focus:outline-none"
                                />
                                {newsletterForm.errors.email && (
                                    <p className="mt-2 text-left text-xs text-red-500">
                                        {newsletterForm.errors.email}
                                    </p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={newsletterForm.processing}
                                className="h-fit rounded-full bg-ember-500 px-8 py-4 text-sm font-bold tracking-wide text-coal-950 uppercase transition-all duration-300 hover:bg-ember-400 disabled:opacity-60"
                            >
                                {newsletterForm.processing
                                    ? 'Envoi...'
                                    : "S'inscrire"}
                            </button>
                        </form>
                    </div>
                </SectionReveal>
            </section>
        </>
    );
}
