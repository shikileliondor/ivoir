import { usePage } from '@inertiajs/react';

export type SiteImages = {
    logo: string;
    home_hero: string;
    fumoir_fallback: string;
    /** Null tant que l'admin n'a pas fourni d'image : placeholder flamme. */
    about: string | null;
    environment_1: string | null;
    environment_2: string | null;
    environment_3: string | null;
};

export const SITE_IMAGE_DEFAULTS: SiteImages = {
    logo: '/images/logo sans fond.png',
    home_hero: '/images/1.jpg',
    fumoir_fallback: '/images/fumoiraz.webp',
    about: null,
    environment_1: null,
    environment_2: null,
    environment_3: null,
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
