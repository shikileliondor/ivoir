import { Head, Link } from '@inertiajs/react';
import { ProductCard } from '@/components/shop/product-card';
import { SectionReveal } from '@/components/shop/section-reveal';
import { cn } from '@/lib/utils';
import products from '@/routes/products';
import type { ShopCategory, ShopProduct } from '@/types/shop';

interface ProductsIndexProps {
    products: ShopProduct[];
    categories: ShopCategory[];
    activeCategory: string | null;
}

export default function ProductsIndex({
    products: items,
    categories,
    activeCategory,
}: ProductsIndexProps) {
    return (
        <>
            <Head title="Nos produits" />

            <section className="mx-auto max-w-7xl px-5 pt-36 pb-24 lg:px-8">
                <SectionReveal>
                    <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-ember-500 uppercase">
                        Catalogue
                    </p>
                    <h1 className="font-display text-5xl tracking-wide text-smoke-100 uppercase sm:text-7xl">
                        Nos <span className="text-ember-500">produits</span>
                    </h1>
                    <p className="mt-5 max-w-xl text-smoke-300">
                        Barbecues, foyers à gaz et fumoirs — conçus en acier
                        haute température et assemblés à Abidjan.
                    </p>
                </SectionReveal>

                {/* Filtres catégories */}
                <SectionReveal delay={0.1}>
                    <div className="mt-10 flex flex-wrap gap-3">
                        <Link
                            href={products.index.url()}
                            preserveScroll
                            className={cn(
                                'rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-300',
                                activeCategory === null
                                    ? 'border-ember-500 bg-ember-500 text-coal-950'
                                    : 'border-coal-700 text-smoke-300 hover:border-ember-500 hover:text-ember-400',
                            )}
                        >
                            Tous
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category.slug}
                                href={products.index.url({
                                    query: { categorie: category.slug },
                                })}
                                preserveScroll
                                className={cn(
                                    'rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-300',
                                    activeCategory === category.slug
                                        ? 'border-ember-500 bg-ember-500 text-coal-950'
                                        : 'border-coal-700 text-smoke-300 hover:border-ember-500 hover:text-ember-400',
                                )}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </SectionReveal>

                {/* Grille produits */}
                {items.length === 0 ? (
                    <p className="mt-20 text-center text-smoke-500">
                        Aucun produit dans cette catégorie pour le moment.
                    </p>
                ) : (
                    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map((product, index) => (
                            <SectionReveal
                                key={product.id}
                                delay={(index % 3) * 0.1}
                            >
                                <ProductCard product={product} />
                            </SectionReveal>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
