import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Camera,
    Check,
    Flame,
    Minus,
    Plus,
    Rotate3d,
    ShoppingBag,
} from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { toast } from 'sonner';
import { useCart } from '@/components/shop/cart-provider';
import { PRODUCTS_WITH_3D } from '@/components/shop/product-3d/available';
import { ProductCard } from '@/components/shop/product-card';
import { SectionReveal } from '@/components/shop/section-reveal';
import products from '@/routes/products';
import { formatFcfa } from '@/types/shop';
import type { ShopProduct } from '@/types/shop';

// Le bundle three.js (~150 Ko gzip) n'est chargé qu'au premier passage en vue 3D.
const ProductViewer = lazy(
    () => import('@/components/shop/product-3d/product-viewer'),
);

interface ProductShowProps {
    product: ShopProduct;
    relatedProducts: ShopProduct[];
}

export default function ProductShow({
    product,
    relatedProducts,
}: ProductShowProps) {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [view, setView] = useState<'photo' | '3d'>('photo');
    const has3d = PRODUCTS_WITH_3D.has(product.slug);
    const maxQuantity = Math.min(50, product.stock ?? 50);

    const handleAdd = () => {
        addItem(product, quantity);
        toast.success(`${product.name} ajouté au panier`);
    };

    return (
        <>
            <Head title={product.name} />

            <section className="mx-auto max-w-7xl px-5 pt-32 pb-24 lg:px-8">
                <SectionReveal>
                    <Link
                        href={products.index.url()}
                        className="group inline-flex items-center gap-2 text-sm text-smoke-300 transition-colors hover:text-ember-400"
                    >
                        <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
                        Retour au catalogue
                    </Link>
                </SectionReveal>

                <div className="mt-8 grid gap-12 lg:grid-cols-2">
                    {/* Visuel */}
                    <SectionReveal>
                        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-coal-800 bg-white">
                            {has3d && view === '3d' ? (
                                <Suspense
                                    fallback={
                                        <p className="text-xs tracking-[0.25em] text-smoke-300/70 uppercase">
                                            Chargement du modèle 3D…
                                        </p>
                                    }
                                >
                                    <ProductViewer slug={product.slug} />
                                </Suspense>
                            ) : product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="size-full object-contain p-4"
                                />
                            ) : (
                                <Flame className="size-28 text-ember-500/25" />
                            )}
                            <span className="absolute top-5 left-5 rounded-full bg-coal-950/70 px-4 py-1.5 text-xs font-medium tracking-wider text-smoke-300 uppercase backdrop-blur">
                                {product.category.name}
                            </span>
                            {has3d && (
                                <div className="absolute top-5 right-5 flex overflow-hidden rounded-full border border-coal-700 bg-coal-950/70 text-xs font-medium tracking-wider uppercase backdrop-blur">
                                    <button
                                        type="button"
                                        onClick={() => setView('photo')}
                                        className={`flex items-center gap-1.5 px-3.5 py-1.5 transition-colors ${
                                            view === 'photo'
                                                ? 'bg-ember-500 text-coal-950'
                                                : 'text-smoke-300 hover:text-ember-400'
                                        }`}
                                        aria-pressed={view === 'photo'}
                                    >
                                        <Camera className="size-3.5" />
                                        Photo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setView('3d')}
                                        className={`flex items-center gap-1.5 px-3.5 py-1.5 transition-colors ${
                                            view === '3d'
                                                ? 'bg-ember-500 text-coal-950'
                                                : 'text-smoke-300 hover:text-ember-400'
                                        }`}
                                        aria-pressed={view === '3d'}
                                    >
                                        <Rotate3d className="size-3.5" />
                                        3D
                                    </button>
                                </div>
                            )}
                        </div>
                    </SectionReveal>

                    {/* Détails */}
                    <SectionReveal delay={0.12}>
                        <h1 className="font-display text-4xl leading-tight tracking-wide text-smoke-100 uppercase sm:text-5xl">
                            {product.name}
                        </h1>

                        <div className="mt-5 flex flex-wrap items-baseline gap-3">
                            <p className="font-display text-3xl text-ember-400">
                                {formatFcfa(product.price)}
                            </p>
                            {product.originalPrice !== null && (
                                <>
                                    <p className="text-lg text-smoke-300/70 line-through">
                                        {formatFcfa(product.originalPrice)}
                                    </p>
                                    <span className="rounded-full bg-ember-500/15 px-3 py-1 text-xs font-semibold tracking-wider text-ember-400 uppercase">
                                        {product.promoLabel ?? 'Promo'}
                                    </span>
                                </>
                            )}
                        </div>

                        <p className="mt-6 leading-relaxed text-smoke-300">
                            {product.description}
                        </p>

                        {product.specs &&
                            Object.keys(product.specs).length > 0 && (
                                <dl className="mt-8 space-y-3 rounded-2xl border border-coal-800 bg-coal-900/60 p-6">
                                    {Object.entries(product.specs).map(
                                        ([label, value]) => (
                                            <div
                                                key={label}
                                                className="flex items-start gap-3 text-sm"
                                            >
                                                <Check className="mt-0.5 size-4 shrink-0 text-ember-500" />
                                                <div>
                                                    <dt className="inline font-semibold text-smoke-100">
                                                        {label} :{' '}
                                                    </dt>
                                                    <dd className="inline text-smoke-300">
                                                        {value}
                                                    </dd>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </dl>
                            )}

                        {product.stock !== null && product.stock > 0 && product.stock <= 5 && (
                            <p className="mt-8 text-sm font-medium text-ember-500">
                                Plus que {product.stock} exemplaire
                                {product.stock > 1 ? 's' : ''} en stock.
                            </p>
                        )}

                        <div className="mt-10 flex flex-wrap items-center gap-4">
                            <div className="flex items-center rounded-full border border-coal-700">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setQuantity((q) => Math.max(1, q - 1))
                                    }
                                    disabled={!product.inStock}
                                    className="flex size-12 items-center justify-center text-smoke-300 transition-colors hover:text-ember-400 disabled:opacity-40"
                                    aria-label="Diminuer la quantité"
                                >
                                    <Minus className="size-4" />
                                </button>
                                <span className="w-10 text-center font-semibold text-smoke-100">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setQuantity((q) => Math.min(maxQuantity, q + 1))
                                    }
                                    disabled={!product.inStock || quantity >= maxQuantity}
                                    className="flex size-12 items-center justify-center text-smoke-300 transition-colors hover:text-ember-400 disabled:opacity-40"
                                    aria-label="Augmenter la quantité"
                                >
                                    <Plus className="size-4" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handleAdd}
                                disabled={!product.inStock}
                                className="flex items-center gap-3 rounded-full bg-ember-500 px-8 py-4 text-sm font-bold tracking-wide text-coal-950 uppercase transition-all duration-300 hover:bg-ember-400 hover:shadow-ember disabled:cursor-not-allowed disabled:bg-coal-700 disabled:text-smoke-500 disabled:shadow-none disabled:hover:bg-coal-700"
                            >
                                <ShoppingBag className="size-4" />
                                {product.inStock
                                    ? 'Ajouter au panier'
                                    : 'Rupture de stock'}
                            </button>
                        </div>
                    </SectionReveal>
                </div>

                {/* Produits liés */}
                {relatedProducts.length > 0 && (
                    <div className="mt-28">
                        <SectionReveal>
                            <h2 className="font-display text-3xl tracking-wide text-smoke-100 uppercase sm:text-4xl">
                                Dans la même{' '}
                                <span className="text-ember-500">famille</span>
                            </h2>
                        </SectionReveal>
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {relatedProducts.map((related, index) => (
                                <SectionReveal
                                    key={related.id}
                                    delay={index * 0.1}
                                >
                                    <ProductCard product={related} />
                                </SectionReveal>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}
