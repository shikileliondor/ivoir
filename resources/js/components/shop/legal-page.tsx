import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SectionReveal } from '@/components/shop/section-reveal';

interface LegalPageProps {
    title: string;
    /** Sous-titre court affiché sous le titre. */
    intro: string;
    updatedAt: string;
    children: ReactNode;
}

/** Gabarit commun des pages légales : en-tête + colonne de lecture. */
export function LegalPage({ title, intro, updatedAt, children }: LegalPageProps) {
    return (
        <>
            <Head title={title} />

            <section className="border-b border-coal-800 bg-coal-900/60 px-5 pt-36 pb-14 text-center lg:px-8">
                <SectionReveal>
                    <h1 className="font-display text-4xl tracking-wide text-smoke-100 uppercase sm:text-6xl">
                        {title}
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-sm text-smoke-300">{intro}</p>
                    <p className="mt-3 text-xs text-smoke-500">Dernière mise à jour : {updatedAt}</p>
                </SectionReveal>
            </section>

            <div className="mx-auto max-w-3xl space-y-10 px-5 py-16 lg:px-8">{children}</div>
        </>
    );
}

interface LegalSectionProps {
    title: string;
    children: ReactNode;
}

/** Bloc titré d'une page légale. */
export function LegalSection({ title, children }: LegalSectionProps) {
    return (
        <SectionReveal y={24}>
            <section>
                <h2 className="font-display text-2xl tracking-wide text-smoke-100">{title}</h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-smoke-300 [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-smoke-100">
                    {children}
                </div>
            </section>
        </SectionReveal>
    );
}
