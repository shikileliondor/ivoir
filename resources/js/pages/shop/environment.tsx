import { Head, Link } from '@inertiajs/react';
import { CloudOff, Flame, Recycle, TreePine, Zap } from 'lucide-react';
import { SectionReveal } from '@/components/shop/section-reveal';
import { useSiteImages } from '@/hooks/use-site-images';
import products from '@/routes/products';

const GALLERY: {
    slot: 'environment_1' | 'environment_2' | 'environment_3';
    caption: string;
    large?: boolean;
}[] = [
    {
        slot: 'environment_1',
        caption: 'Fabrication locale dans notre atelier d\'Abidjan',
        large: true,
    },
    {
        slot: 'environment_2',
        caption: 'Des foyers conçus pour une combustion propre',
    },
    {
        slot: 'environment_3',
        caption: 'Acier recyclable, chutes revalorisées en atelier',
    },
];

const IMPACTS = [
    {
        icon: Zap,
        title: 'Efficacité énergétique',
        text: 'Nos foyers concentrent la chaleur là où elle est utile : moins de combustible consommé pour le même résultat de cuisson.',
    },
    {
        icon: CloudOff,
        title: 'Moins de fumée',
        text: 'Une combustion mieux maîtrisée réduit significativement les émissions de fumée — un bénéfice direct pour la santé des utilisateurs.',
    },
    {
        icon: TreePine,
        title: 'Frein à la déforestation',
        text: 'En réduisant les besoins en bois et charbon, nos équipements diminuent la pression sur les forêts ivoiriennes.',
    },
    {
        icon: Recycle,
        title: 'Acier recyclable',
        text: 'Nos équipements sont fabriqués en acier recyclable, avec une optimisation des chutes et une réduction des déchets en atelier.',
    },
];

export default function Environment() {
    const siteImages = useSiteImages();

    return (
        <>
            <Head title="Environnement" />

            <section className="mx-auto max-w-7xl px-5 pt-36 pb-24 lg:px-8">
                <SectionReveal>
                    <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-ember-500 uppercase">
                        Environnement
                    </p>
                    <h1 className="max-w-3xl font-display text-5xl leading-none tracking-wide text-smoke-100 uppercase sm:text-7xl">
                        Cuisiner mieux, <span className="text-ember-500">polluer moins</span>
                    </h1>
                    <p className="mt-6 max-w-2xl leading-relaxed text-smoke-300">
                        La cuisson au bois et au charbon traditionnelle pèse lourdement sur les forêts et sur la santé.
                        Chez IvoirCuisson, chaque produit est conçu pour réduire cet impact — sans compromis sur la
                        performance.
                    </p>
                </SectionReveal>

                <div className="mt-16 grid gap-6 sm:grid-cols-2">
                    {IMPACTS.map((impact, index) => (
                        <SectionReveal key={impact.title} delay={(index % 2) * 0.12}>
                            <div className="h-full rounded-2xl border border-coal-800 bg-coal-900/60 p-8 transition-colors duration-500 hover:border-ember-500/50">
                                <impact.icon className="mb-5 size-9 text-ember-500" />
                                <h2 className="font-display text-2xl tracking-wide text-smoke-100">{impact.title}</h2>
                                <p className="mt-3 leading-relaxed text-smoke-300">{impact.text}</p>
                            </div>
                        </SectionReveal>
                    ))}
                </div>

                <div className="mt-24">
                    <SectionReveal>
                        <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-ember-500 uppercase">
                            En images
                        </p>
                        <h2 className="font-display text-4xl tracking-wide text-smoke-100 uppercase sm:text-5xl">
                            Notre engagement <span className="text-ember-500">sur le terrain</span>
                        </h2>
                    </SectionReveal>

                    <div className="mt-10 grid gap-6 sm:grid-cols-2">
                        {GALLERY.map((photo, index) => {
                            const url = siteImages[photo.slot];

                            return (
                                <SectionReveal
                                    key={photo.slot}
                                    delay={index * 0.12}
                                    className={photo.large ? 'sm:row-span-2 sm:h-full' : undefined}
                                >
                                    <div
                                        className={`group relative overflow-hidden rounded-3xl border border-coal-800 bg-gradient-to-br from-coal-800 to-coal-900 transition-colors duration-500 hover:border-ember-500/50 ${
                                            photo.large
                                                ? 'aspect-[4/5] sm:aspect-auto sm:h-full'
                                                : 'aspect-[16/10]'
                                        }`}
                                    >
                                        {url ? (
                                            <>
                                                <img
                                                    src={url}
                                                    alt={photo.caption}
                                                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-coal-950/85 via-coal-950/30 to-transparent p-6 pt-20">
                                                    <p className="text-sm font-medium text-smoke-100">
                                                        {photo.caption}
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex size-full items-center justify-center">
                                                <Flame className="size-24 text-ember-500/30" />
                                            </div>
                                        )}
                                    </div>
                                </SectionReveal>
                            );
                        })}
                    </div>
                </div>

                <SectionReveal delay={0.2} className="mt-20 text-center">
                    <Link
                        href={products.index.url()}
                        className="inline-block rounded-full bg-ember-500 px-8 py-4 text-sm font-bold tracking-wide text-coal-950 uppercase transition-all duration-300 hover:bg-ember-400 hover:shadow-ember"
                    >
                        Découvrir nos équipements
                    </Link>
                </SectionReveal>
            </section>
        </>
    );
}
