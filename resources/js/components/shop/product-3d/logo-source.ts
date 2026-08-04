/**
 * Source du logo gravé sur les modèles 3D. Module volontairement
 * minuscule et sans dépendance Three.js : il est importé par le code
 * non-lazy (fumoir-scroll) pour transmettre le logo personnalisé
 * de l'admin sans tirer le chunk 3D, et lu par `useLogoTexture` à
 * l'intérieur du Canvas, où le contexte Inertia n'est pas disponible.
 */

const DEFAULT_LOGO_SRC = '/images/logo sans fond.png';

let currentSrc = DEFAULT_LOGO_SRC;

export function setLogoSource(src: string): void {
    currentSrc = src;
}

export function getLogoSource(): string {
    return currentSrc;
}
