import { useSiteImages } from '@/hooks/use-site-images';

export default function AppLogo() {
    // Vrai logo du site (personnalisable dans l'admin), posé sur une
    // pastille claire pour rester lisible sur la sidebar charbon.
    const { logo } = useSiteImages();

    return (
        <>
            <div className="flex aspect-square size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-0.5 ring-1 ring-ember-500/40">
                <img
                    src={logo}
                    alt="Logo IvoirCuisson"
                    className="size-full object-contain"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span className="truncate font-display text-lg leading-none tracking-widest uppercase">
                    IvoirCuisson
                </span>
                <span className="truncate text-[10px] font-medium tracking-[0.18em] uppercase opacity-60">
                    Espace de gestion
                </span>
            </div>
        </>
    );
}
