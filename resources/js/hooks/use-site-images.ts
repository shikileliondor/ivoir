import { usePage } from '@inertiajs/react';

export type SiteImages = {
    logo: string;
    home_hero: string;
    flame_duo_fallback: string;
    /** Null tant que l'admin n'a pas fourni d'image : placeholder flamme. */
    about: string | null;
};

export const SITE_IMAGE_DEFAULTS: SiteImages = {
    logo: '/images/logo sans fond.png',
    home_hero: '/images/1.jpg',
    flame_duo_fallback: '/images/flame duo.jpg',
    about: null,
};

/**
 * The fixed images of the public site (logo, hero, …), as shared by
 * the backend — admin overrides applied, bundled defaults otherwise.
 */
export function useSiteImages(): SiteImages {
    const { siteImages } = usePage<{
        siteImages?: Partial<SiteImages>;
    }>().props;

    return { ...SITE_IMAGE_DEFAULTS, ...siteImages };
}
