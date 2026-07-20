import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef  } from 'react';
import type {ReactNode} from 'react';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface SectionRevealProps {
    children: ReactNode;
    className?: string;
    /** Délai (s) avant le début de l'animation une fois la section visible. */
    delay?: number;
    /** Décalage vertical initial en px. */
    y?: number;
}

/**
 * Révèle son contenu (fondu + translation) quand la section entre
 * dans le viewport.
 */
export function SectionReveal({ children, className, delay = 0, y = 48 }: SectionRevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        const context = gsap.context(() => {
            gsap.fromTo(
                element,
                { autoAlpha: 0, y },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 1,
                    delay,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 85%',
                        once: true,
                    },
                },
            );
        }, element);

        return () => context.revert();
    }, [delay, y]);

    return (
        <div ref={ref} className={cn('opacity-0', className)}>
            {children}
        </div>
    );
}
