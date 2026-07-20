import gsap from 'gsap';
import { useCallback, useEffect, useRef, useState } from 'react';

const SESSION_KEY = 'ivoircuisson-intro-seen';

/**
 * Intro « marque au fer rouge » : dans le noir, une étincelle claque sur
 * la première lettre, puis le wordmark surgit incandescent — blanc-orange,
 * halo intense — grésille une fraction de seconde et refroidit vers ses
 * couleurs finales pendant que l'écran fond vers le site. ~2,5 s, jouée
 * une fois par session, cliquable pour passer.
 */
export function FireIntro() {
    const [visible, setVisible] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        // Pas d'intro pour les utilisateurs préférant les animations réduites.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return false;
        }

        return window.sessionStorage.getItem(SESSION_KEY) !== '1';
    });

    const overlayRef = useRef<HTMLDivElement>(null);
    const doneRef = useRef(false);

    const finish = useCallback(() => {
        if (doneRef.current) {
            return;
        }

        doneRef.current = true;
        window.sessionStorage.setItem(SESSION_KEY, '1');

        const overlay = overlayRef.current;

        if (!overlay) {
            setVisible(false);

            return;
        }

        gsap.to(overlay, {
            autoAlpha: 0,
            duration: 0.55,
            ease: 'power2.inOut',
            onComplete: () => setVisible(false),
        });
    }, []);

    useEffect(() => {
        if (!visible) {
            return;
        }

        // Bloque le scroll pendant l'intro.
        document.documentElement.style.overflow = 'hidden';

        const timeline = gsap.timeline({ delay: 0.35 });

        timeline
            // L'étincelle claque sur la première lettre.
            .fromTo(
                '[data-intro-spark]',
                { autoAlpha: 0, scale: 0.4 },
                {
                    autoAlpha: 1,
                    scale: 1.2,
                    duration: 0.09,
                    repeat: 2,
                    yoyo: true,
                    ease: 'power2.inOut',
                },
            )
            .to('[data-intro-spark]', { autoAlpha: 0, duration: 0.1 })
            // Le fer marque : le wordmark surgit incandescent, d'un coup.
            .fromTo(
                '[data-intro-word]',
                { autoAlpha: 0, scale: 1.06 },
                { autoAlpha: 1, scale: 1, duration: 0.14, ease: 'power3.out' },
                '-=0.02',
            )
            .fromTo(
                '[data-intro-halo]',
                { autoAlpha: 0, scale: 0.7 },
                { autoAlpha: 1, scale: 1, duration: 0.18, ease: 'power2.out' },
                '<',
            )
            // Grésillement : la couche chauffée à blanc vacille brièvement.
            .to(
                '[data-intro-hot]',
                {
                    opacity: 0.7,
                    duration: 0.05,
                    repeat: 4,
                    yoyo: true,
                    ease: 'power1.inOut',
                },
                '<+=0.1',
            )
            // Refroidissement : le blanc incandescent laisse place aux
            // couleurs finales, le halo se dissipe.
            .to('[data-intro-hot]', {
                opacity: 0,
                duration: 0.75,
                ease: 'power2.inOut',
            })
            .to(
                '[data-intro-halo]',
                {
                    autoAlpha: 0,
                    scale: 1.15,
                    duration: 0.85,
                    ease: 'power2.out',
                },
                '<',
            )
            .add(() => finish(), '+=0.3');

        return () => {
            timeline.kill();
            document.documentElement.style.overflow = '';
        };
    }, [visible, finish]);

    useEffect(() => {
        if (!visible) {
            document.documentElement.style.overflow = '';
        }
    }, [visible]);

    if (!visible) {
        return null;
    }

    return (
        <div
            ref={overlayRef}
            onClick={finish}
            className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-[#0a0908]"
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (
                    event.key === 'Enter' ||
                    event.key === ' ' ||
                    event.key === 'Escape'
                ) {
                    finish();
                }
            }}
            aria-label="Passer l'introduction"
        >
            <div className="relative">
                {/* Halo de chaleur derrière le wordmark */}
                <div
                    data-intro-halo
                    className="absolute -inset-x-[15%] -inset-y-[150%] opacity-0 blur-2xl"
                    style={{
                        background:
                            'radial-gradient(closest-side, rgba(255, 120, 30, 0.3), rgba(200, 60, 10, 0.12) 55%, transparent 75%)',
                    }}
                    aria-hidden
                />

                {/* Wordmark : couleurs finales dessous, couche incandescente dessus */}
                <div data-intro-word className="relative opacity-0">
                    <p className="font-display text-[clamp(2.2rem,8vw,6rem)] tracking-[0.14em] text-stone-100 uppercase">
                        Ivoir
                        <span className="text-ember-500 text-glow-ember">
                            Cuisson
                        </span>
                    </p>
                    <p
                        data-intro-hot
                        className="absolute inset-0 font-display text-[clamp(2.2rem,8vw,6rem)] tracking-[0.14em] text-white uppercase"
                        style={{
                            textShadow:
                                '0 0 6px rgba(255, 244, 214, 0.95), 0 0 22px rgba(255, 160, 60, 0.85), 0 0 60px rgba(255, 100, 20, 0.55)',
                        }}
                        aria-hidden
                    >
                        IvoirCuisson
                    </p>

                    {/* Étincelle sur la première lettre */}
                    <div
                        data-intro-spark
                        className="absolute top-1/2 left-[0.05em] size-1.5 -translate-y-1/2 rounded-full bg-amber-100 opacity-0 shadow-[0_0_18px_6px_rgba(251,191,36,0.9)]"
                        aria-hidden
                    />
                </div>
            </div>
        </div>
    );
}
