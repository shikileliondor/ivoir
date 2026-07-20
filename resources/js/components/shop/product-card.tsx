import { Link } from '@inertiajs/react';
import { Flame, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/components/shop/cart-provider';
import products from '@/routes/products';
import { formatFcfa } from '@/types/shop';
import type { ShopProduct } from '@/types/shop';

export function ProductCard({ product }: { product: ShopProduct }) {
    const { addItem } = useCart();

    const handleAdd = () => {
        addItem(product);
        toast.success(`${product.name} ajouté au panier`);
    };

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-coal-800 bg-coal-900 transition-all duration-500 hover:border-ember-500/60 hover:shadow-ember">
            <Link
                href={products.show.url({ product: product.slug })}
                className="block"
                aria-label={`Voir ${product.name}`}
            >
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-b from-coal-800 to-coal-900">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="size-full object-contain p-3 transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <Flame className="size-16 text-ember-500/25 transition-all duration-700 group-hover:scale-125 group-hover:text-ember-500/50" />
                    )}
                    <span className="absolute top-4 left-4 rounded-full bg-coal-950/70 px-3 py-1 text-[11px] font-medium tracking-wider text-smoke-300 uppercase backdrop-blur">
                        {product.category.name}
                    </span>
                    {product.originalPrice !== null && product.inStock && (
                        <span className="absolute top-4 right-4 rounded-full bg-ember-500 px-3 py-1 text-[11px] font-semibold tracking-wider text-coal-950 uppercase">
                            {product.promoLabel ?? 'Promo'}
                        </span>
                    )}
                    {!product.inStock && (
                        <span className="absolute top-4 right-4 rounded-full bg-coal-950/85 px-3 py-1 text-[11px] font-semibold tracking-wider text-smoke-300 uppercase backdrop-blur">
                            Rupture
                        </span>
                    )}
                </div>
            </Link>

            <div className="space-y-3 p-5">
                <Link href={products.show.url({ product: product.slug })}>
                    <h3 className="font-display text-xl leading-tight tracking-wide text-smoke-100 transition-colors group-hover:text-ember-300">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center justify-between">
                    <p className="flex flex-wrap items-baseline gap-2 text-lg font-semibold text-ember-400">
                        {formatFcfa(product.price)}
                        {product.originalPrice !== null && (
                            <span className="text-sm font-normal text-smoke-300/60 line-through">
                                {formatFcfa(product.originalPrice)}
                            </span>
                        )}
                    </p>
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!product.inStock}
                        className="flex size-10 items-center justify-center rounded-full border border-coal-700 text-smoke-100 transition-all duration-300 hover:border-ember-500 hover:bg-ember-500 hover:text-coal-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-coal-700 disabled:hover:bg-transparent disabled:hover:text-smoke-100"
                        aria-label={
                            product.inStock
                                ? `Ajouter ${product.name} au panier`
                                : `${product.name} est en rupture de stock`
                        }
                    >
                        <Plus className="size-5" />
                    </button>
                </div>
            </div>
        </article>
    );
}
