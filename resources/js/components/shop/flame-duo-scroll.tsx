import { Link } from '@inertiajs/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { setLogoSource } from '@/components/shop/product-3d/logo-source';
import { useSiteImages } from '@/hooks/use-site-images';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

/** Chargé en différé : three.js n'est téléchargé que lorsque la section approche. */
const FlameDuoCanvas = lazy(() =>
    import('@/components/shop/flame-duo-3d').then((module) => ({ default: module.FlameDuoCanvas })),
);

const STEPS = [
    {
        number: '01',
        title: 'Découpe & pliage',
        text: 'Acier haute température découpé et plié dans notre atelier d\'Abidjan.',
    },
    {
        number: '02',
        title: 'Assemblage',
        text: 'Corps, double foyer et commandes assemblés puis thermolaqués.',
    },
    {
        number: '03',
        title: 'Prêt à cuisiner',
        text: 'Deux foyers puissants, une flamme maîtrisée du premier au dernier plat.',
    },
];

function supportsWebgl(): boolean {
    try {
        const canvas = document.createElement('canvas');

        return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
    } catch {
        return false;
    }
}

interface FlameDuoScrollProps {
    /** Lien vers la fiche produit du Flame Duo. */
    productUrl: string;
}

/**
 * Section immersive : le Flame Duo s'assemble en 3D au fil du scroll,
 * puis les feux s'allument. Repli sur la photo produit sans WebGL.
 */
export function FlameDuoScroll({ productUrl }: FlameDuoScrollProps) {
    const wrapRef = useRef<HTMLElement>(null);
    const progressRef = useRef(0);
    const [step, setStep] = useState(0);
    const [inView, setInView] = useState(false);
    const [webgl, setWebgl] = useState<boolean | null>(null);
    const siteImages = useSiteImages();

    // Transmet le logo (personnalisable dans l'admin) à la scène 3D,
    // où le contexte Inertia n'est pas accessible.
    setLogoSource(siteImages.logo);

    useEffect(() => {
        const element = wrapRef.current;

        if (!element) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setInView(entry.isIntersecting);
                setWebgl((previous) => previous ?? supportsWebgl());
            },
            { rootMargin: '200px' },
        );
        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    useLayoutEffect(() => {
        const element = wrapRef.current;

        if (!element) {
            return;
        }

        const trigger = ScrollTrigger.create({
            trigger: element,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                progressRef.current = self.progress;
                setStep(self.progress < 0.36 ? 0 : self.progress < 0.76 ? 1 : 2);
            },
        });

        return () => trigger.kill();
    }, []);

    return (
        <section ref={wrapRef} className="relative h-[320vh] border-y border-coal-800 bg-coal-900/40">
            <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
                {/* Scène 3D (ou photo de repli), cantonnée entre le titre et les étapes */}
                <div className="pointer-events-none absolute inset-x-0 top-36 bottom-60 sm:top-40 sm:bottom-56">
                    {webgl ? (
                        <Suspense fallback={null}>
                            <FlameDuoCanvas progress={progressRef} active={inView} />
                        </Suspense>
                    ) : webgl === false ? (
                        <img
                            src={siteImages.flame_duo_fallback}
                            alt="Foyer à gaz Copper Flame Duo"
                            className="size-full object-contain p-10"
                        />
                    ) : null}
                </div>

                {/* Titre */}
                <div className="pointer-events-none relative px-5 pt-24 text-center sm:pt-28 lg:px-8">
                    <p className="text-xs font-semibold tracking-[0.35em] text-ember-500 uppercase">
                        Fabrication locale
                    </p>
                    <h2 className="mt-3 font-display text-3xl tracking-wide text-smoke-100 uppercase sm:text-6xl">
                        Le Flame Duo <span className="text-ember-500">prend forme</span>
                    </h2>
                </div>

                {/* Étapes + CTA */}
                <div className="pointer-events-none relative mt-auto px-5 pb-8 sm:pb-10 lg:px-8">
                    <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-3 sm:gap-6">
                        {STEPS.map((item, index) => (
                            <div
                                key={item.number}
                                className={cn(
                                    'rounded-2xl border p-4 backdrop-blur transition-all duration-500 sm:p-5',
                                    index === step
                                        ? 'border-ember-500/60 bg-coal-950/80 opacity-100'
                                        : 'hidden border-coal-800 bg-coal-950/40 opacity-40 sm:block',
                                )}
                            >
                                <div className="flex items-baseline gap-3">
                                    <span className="font-display text-2xl text-ember-500">{item.number}</span>
                                    <h3 className="text-sm font-bold tracking-wide text-smoke-100 uppercase">
                                        {item.title}
                                    </h3>
                                </div>
                                <p className="mt-2 text-xs leading-relaxed text-smoke-300">{item.text}</p>
                            </div>
                        ))}
                    </div>

                    <div
                        className={cn(
                            'mt-4 flex justify-center transition-all duration-700 sm:mt-6',
                            step === 2 ? 'pointer-events-auto translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                        )}
                    >
                        <Link
                            href={productUrl}
                            className="group flex items-center gap-3 rounded-full bg-ember-500 px-8 py-4 text-sm font-bold tracking-wide text-coal-950 uppercase transition-all duration-300 hover:bg-ember-400 hover:shadow-ember"
                        >
                            Découvrir le Flame Duo
                            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
