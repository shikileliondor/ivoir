import { Link } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, Rotate3d, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import products from '@/routes/products';

const STORAGE_KEY = 'ivoircuisson-3d-welcome-seen';

/** Laisse l'intro « fer rouge » (~2,5 s) se terminer avant d'apparaître. */
const OPEN_DELAY_MS = 3600;

/**
 * Modal affichée une seule fois (localStorage) à la première visite :
 * informe que les produits peuvent être visionnés en 3D sur leurs fiches.
 */
export function Welcome3dModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (window.localStorage.getItem(STORAGE_KEY) === '1') {
            return;
        }

        const timer = window.setTimeout(() => {
            // Marquée vue dès l'affichage : elle ne doit jamais harceler.
            window.localStorage.setItem(STORAGE_KEY, '1');
            setOpen(true);
        }, OPEN_DELAY_MS);

        return () => window.clearTimeout(timer);
    }, []);

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[90] bg-smoke-100/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed top-1/2 left-1/2 z-[91] w-[calc(100vw-2.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-coal-700 bg-coal-950 p-8 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-4">
                    <Dialog.Close
                        className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full text-smoke-500 transition-colors hover:bg-coal-900 hover:text-smoke-100"
                        aria-label="Fermer"
                    >
                        <X className="size-4" />
                    </Dialog.Close>

                    <div className="flex size-16 items-center justify-center rounded-2xl bg-ember-500/10">
                        <Rotate3d className="size-8 animate-[spin_9s_linear_infinite] text-ember-500" />
                    </div>

                    <p className="mt-5 text-[11px] font-semibold tracking-[0.3em] text-ember-500 uppercase">
                        Nouveau
                    </p>
                    <Dialog.Title className="mt-2 font-display text-3xl tracking-wide text-smoke-100 uppercase">
                        Visionnez nos produits en 3D
                    </Dialog.Title>
                    <Dialog.Description className="mt-3 text-sm leading-relaxed text-smoke-300">
                        Sur chaque fiche produit, activez la vue 3D : faites tourner le barbecue sous
                        tous les angles, zoomez sur les détails — comme si vous l'aviez devant vous.
                    </Dialog.Description>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Link
                            href={products.index.url()}
                            onClick={() => setOpen(false)}
                            className="group flex items-center justify-center gap-2 rounded-full bg-ember-500 px-6 py-3.5 text-sm font-bold tracking-wide text-coal-950 uppercase transition-all duration-300 hover:bg-ember-400 hover:shadow-ember"
                        >
                            Voir les produits
                            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                        <Dialog.Close className="px-4 py-3 text-sm font-semibold text-smoke-500 transition-colors hover:text-smoke-100">
                            Plus tard
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
