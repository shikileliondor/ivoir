import Lenis from 'lenis';
import { useEffect } from 'react';

let lenis: Lenis | null = null;
let consumers = 0;

export function getLenis(): Lenis | null {
    return lenis;
}

/**
 * Monte une instance Lenis partagée (smooth scroll) tant qu'au moins
 * un layout public est affiché.
 */
export function useLenis(): void {
    useEffect(() => {
        consumers += 1;

        if (!lenis) {
            lenis = new Lenis({
                autoRaf: true,
                lerp: 0.12,
            });
        }

        return () => {
            consumers -= 1;

            if (consumers === 0 && lenis) {
                lenis.destroy();
                lenis = null;
            }
        };
    }, []);
}
