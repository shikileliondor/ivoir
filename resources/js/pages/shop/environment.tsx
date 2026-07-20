import { Head, Link } from '@inertiajs/react';
import { CloudOff, Recycle, TreePine, Zap } from 'lucide-react';
import { SectionReveal } from '@/components/shop/section-reveal';
import products from '@/routes/products';

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

                <SectionReveal delay={0.2} className="mt-16 text-center">
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
