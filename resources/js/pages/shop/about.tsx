import { Head, Link } from '@inertiajs/react';
import { Award, Flame, Handshake, Leaf } from 'lucide-react';
import { SectionReveal } from '@/components/shop/section-reveal';
import { useSiteImages } from '@/hooks/use-site-images';
import { contact } from '@/routes';

const VALUES = [
    {
        icon: Award,
        title: 'Excellence',
        text: 'Des standards industriels rigoureux appliqués à chaque étape de fabrication, de la découpe de l\'acier aux finitions.',
    },
    {
        icon: Leaf,
        title: 'Engagement environnemental',
        text: 'Optimisation des matériaux, réduction des déchets et recyclage de l\'acier intégrés à toutes nos opérations.',
    },
    {
        icon: Handshake,
        title: 'Proximité',
        text: 'Des relations durables avec nos clients, fondées sur la transparence, la disponibilité et un service réactif.',
    },
];

export default function About() {
    const siteImages = useSiteImages();

    return (
        <>
            <Head title="À propos" />

            <section className="mx-auto max-w-7xl px-5 pt-36 pb-24 lg:px-8">
                <SectionReveal>
                    <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-ember-500 uppercase">À propos</p>
                    <h1 className="max-w-3xl font-display text-5xl leading-none tracking-wide text-smoke-100 uppercase sm:text-7xl">
                        L'innovation au service du goût <span className="text-ember-500">et de l'écologie</span>
                    </h1>
                </SectionReveal>

                <div className="mt-16 grid gap-12 lg:grid-cols-2">
                    <SectionReveal>
                        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border border-coal-800 bg-gradient-to-br from-coal-800 to-coal-900">
                            {siteImages.about ? (
                                <img
                                    src={siteImages.about}
                                    alt="L'atelier IvoirCuisson"
                                    className="size-full object-cover"
                                />
                            ) : (
                                <Flame className="size-24 text-ember-500/30" />
                            )}
                        </div>
                    </SectionReveal>

                    <SectionReveal delay={0.12}>
                        <h2 className="font-display text-3xl tracking-wide text-smoke-100 uppercase">Notre histoire</h2>
                        <p className="mt-5 leading-relaxed text-smoke-300">
                            Établie à Abidjan, IvoirCuisson fabrique des équipements de cuisson en acier recyclable,
                            avec une exigence : allier production locale et standards de qualité internationaux. Des
                            pratiques écologiques durables sont intégrées à l'ensemble de nos opérations.
                        </p>

                        <h2 className="mt-10 font-display text-3xl tracking-wide text-smoke-100 uppercase">
                            Notre mission
                        </h2>
                        <p className="mt-5 leading-relaxed text-smoke-300">
                            Créer des solutions de cuisson robustes et durables à partir de matériaux de qualité, pour
                            promouvoir une cuisine efficace et respectueuse de l'environnement, tout en réduisant la
                            pression sur les ressources naturelles.
                        </p>

                        <h2 className="mt-10 font-display text-3xl tracking-wide text-smoke-100 uppercase">
                            Notre vision
                        </h2>
                        <p className="mt-5 leading-relaxed text-smoke-300">
                            Faire évoluer les pratiques de cuisson grâce à des solutions modernes, efficaces et
                            accessibles, adaptées aux contextes locaux — pour les ménages comme pour les
                            professionnels.
                        </p>
                    </SectionReveal>
                </div>
            </section>

            <section className="border-t border-coal-800 bg-coal-900/50">
                <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
                    <SectionReveal>
                        <h2 className="font-display text-4xl tracking-wide text-smoke-100 uppercase sm:text-5xl">
                            Nos <span className="text-ember-500">valeurs</span>
                        </h2>
                    </SectionReveal>

                    <div className="mt-14 grid gap-6 md:grid-cols-3">
                        {VALUES.map((value, index) => (
                            <SectionReveal key={value.title} delay={index * 0.12}>
                                <div className="h-full rounded-2xl border border-coal-800 bg-coal-950 p-7 transition-colors duration-500 hover:border-ember-500/50">
                                    <value.icon className="mb-5 size-8 text-ember-500" />
                                    <h3 className="font-display text-2xl tracking-wide text-smoke-100">{value.title}</h3>
                                    <p className="mt-3 text-sm leading-relaxed text-smoke-300">{value.text}</p>
                                </div>
                            </SectionReveal>
                        ))}
                    </div>

                    <SectionReveal delay={0.2} className="mt-14 text-center">
                        <Link
                            href={contact.url()}
                            className="inline-block rounded-full bg-ember-500 px-8 py-4 text-sm font-bold tracking-wide text-coal-950 uppercase transition-all duration-300 hover:bg-ember-400 hover:shadow-ember"
                        >
                            Travailler avec nous
                        </Link>
                    </SectionReveal>
                </div>
            </section>
        </>
    );
}
