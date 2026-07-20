import { Head, Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { SectionReveal } from '@/components/shop/section-reveal';
import { home } from '@/routes';
import products from '@/routes/products';
import { formatFcfa  } from '@/types/shop';
import type {ShopOrder} from '@/types/shop';

export default function OrderConfirmation({ order }: { order: ShopOrder }) {
    return (
        <>
            <Head title={`Commande ${order.reference}`} />

            <section className="mx-auto max-w-3xl px-5 pt-36 pb-24 lg:px-8">
                <SectionReveal>
                    <div className="text-center">
                        <CheckCircle2 className="mx-auto size-16 text-ember-500" />
                        <h1 className="mt-6 font-display text-4xl tracking-wide text-smoke-100 uppercase sm:text-5xl">
                            Merci, <span className="text-ember-500">{order.customerName}</span> !
                        </h1>
                        <p className="mt-4 text-smoke-300">
                            Votre commande <span className="font-semibold text-ember-400">{order.reference}</span> a
                            bien été enregistrée. Notre équipe vous contacte au{' '}
                            <span className="font-semibold text-smoke-100">{order.customerPhone}</span> pour confirmer
                            la livraison à {order.city}.
                        </p>
                    </div>
                </SectionReveal>

                <SectionReveal delay={0.15}>
                    <div className="mt-12 rounded-3xl border border-coal-800 bg-coal-900/40 p-8">
                        <h2 className="font-display text-2xl tracking-wide text-smoke-100">Détail de la commande</h2>

                        <ul className="mt-6 divide-y divide-coal-800">
                            {order.items.map((item) => (
                                <li key={item.productName} className="flex items-center justify-between gap-4 py-4">
                                    <div>
                                        <p className="text-sm font-medium text-smoke-100">{item.productName}</p>
                                        <p className="mt-0.5 text-xs text-smoke-500">
                                            {item.quantity} × {formatFcfa(item.unitPrice)}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-ember-400">
                                        {formatFcfa(item.unitPrice * item.quantity)}
                                    </p>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-4 flex items-center justify-between border-t border-coal-800 pt-5">
                            <span className="text-sm text-smoke-300">Total à régler à la livraison</span>
                            <span className="font-display text-3xl tracking-wide text-ember-400">
                                {formatFcfa(order.total)}
                            </span>
                        </div>
                    </div>
                </SectionReveal>

                <SectionReveal delay={0.25}>
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href={products.index.url()}
                            className="rounded-full bg-ember-500 px-8 py-4 text-sm font-bold tracking-wide text-coal-950 uppercase transition-all duration-300 hover:bg-ember-400 hover:shadow-ember"
                        >
                            Continuer mes achats
                        </Link>
                        <Link
                            href={home.url()}
                            className="rounded-full border border-coal-700 px-8 py-4 text-sm font-bold tracking-wide text-smoke-100 uppercase transition-colors duration-300 hover:border-ember-500 hover:text-ember-400"
                        >
                            Retour à l'accueil
                        </Link>
                    </div>
                </SectionReveal>
            </section>
        </>
    );
}
