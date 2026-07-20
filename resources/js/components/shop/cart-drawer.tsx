import { router } from '@inertiajs/react';
import { Flame, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/components/shop/cart-provider';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import orders from '@/routes/orders';
import { formatFcfa } from '@/types/shop';

export function CartDrawer() {
    const { items, total, isOpen, closeCart, updateQuantity, removeItem } =
        useCart();

    const goToCheckout = () => {
        closeCart();
        router.visit(orders.checkout.url());
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
            <SheetContent
                side="right"
                className="shop-root flex w-full flex-col gap-0 border-l border-coal-800 bg-coal-950 p-0 sm:max-w-md"
            >
                <SheetHeader className="border-b border-coal-800 px-6 py-5">
                    <SheetTitle className="font-display text-2xl tracking-wider text-smoke-100">
                        Votre panier
                    </SheetTitle>
                    <SheetDescription className="text-smoke-500">
                        {items.length === 0
                            ? 'Il est encore vide — le feu attend.'
                            : 'Vérifiez vos articles avant de commander.'}
                    </SheetDescription>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                        <Flame className="size-12 text-ember-500/40" />
                        <p className="text-sm text-smoke-500">
                            Parcourez nos barbecues, fumoirs et foyers pour
                            allumer votre premier feu.
                        </p>
                    </div>
                ) : (
                    <>
                        <ul className="flex-1 divide-y divide-coal-800 overflow-y-auto px-6">
                            {items.map((item) => (
                                <li
                                    key={item.productId}
                                    className="flex gap-4 py-5"
                                >
                                    <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-coal-900">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt=""
                                                className="size-full rounded-lg object-contain p-0.5"
                                            />
                                        ) : (
                                            <Flame className="size-6 text-ember-500/50" />
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col gap-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-medium text-smoke-100">
                                                {item.name}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(item.productId)
                                                }
                                                className="text-smoke-500 transition-colors hover:text-ember-400"
                                                aria-label={`Retirer ${item.name} du panier`}
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center rounded-full border border-coal-700">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                    className="flex size-8 items-center justify-center text-smoke-300 transition-colors hover:text-ember-400"
                                                    aria-label="Diminuer la quantité"
                                                >
                                                    <Minus className="size-3.5" />
                                                </button>
                                                <span className="w-8 text-center text-sm text-smoke-100">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                    className="flex size-8 items-center justify-center text-smoke-300 transition-colors hover:text-ember-400"
                                                    aria-label="Augmenter la quantité"
                                                >
                                                    <Plus className="size-3.5" />
                                                </button>
                                            </div>
                                            <p className="text-sm font-semibold text-ember-400">
                                                {formatFcfa(
                                                    item.price * item.quantity,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="space-y-4 border-t border-coal-800 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-smoke-300">
                                    Total
                                </span>
                                <span className="font-display text-2xl tracking-wide text-ember-400">
                                    {formatFcfa(total)}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={goToCheckout}
                                className="w-full rounded-full bg-ember-500 py-3.5 text-sm font-bold tracking-wide text-coal-950 uppercase shadow-ember transition-all duration-300 hover:bg-ember-400"
                            >
                                Passer la commande
                            </button>
                            <p className="text-center text-xs text-smoke-500">
                                Paiement à la livraison — nous vous contactons
                                pour confirmer.
                            </p>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
