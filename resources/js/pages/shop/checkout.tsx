import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Flame } from 'lucide-react';
import { useState  } from 'react';
import type {FormEvent} from 'react';
import { useCart } from '@/components/shop/cart-provider';
import { SectionReveal } from '@/components/shop/section-reveal';
import orders from '@/routes/orders';
import products from '@/routes/products';
import { formatFcfa } from '@/types/shop';

interface CheckoutForm {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    address: string;
    city: string;
}

export default function Checkout() {
    const { items, total, clearCart } = useCart();
    const [form, setForm] = useState<CheckoutForm>({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        address: '',
        city: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const setField = (field: keyof CheckoutForm, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        router.post(
            orders.store.url(),
            {
                ...form,
                items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
            },
            {
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onError: (formErrors) => setErrors(formErrors),
                onSuccess: () => clearCart(),
            },
        );
    };

    const inputClass =
        'w-full rounded-xl border border-coal-700 bg-coal-900 px-4 py-3.5 text-sm text-smoke-100 placeholder:text-smoke-500 transition-colors focus:border-ember-500 focus:outline-none';

    if (items.length === 0) {
        return (
            <>
                <Head title="Commande" />
                <section className="mx-auto flex min-h-svh max-w-xl flex-col items-center justify-center px-5 text-center">
                    <Flame className="size-14 text-ember-500/40" />
                    <h1 className="mt-6 font-display text-4xl tracking-wide text-smoke-100 uppercase">
                        Votre panier est vide
                    </h1>
                    <p className="mt-4 text-smoke-300">
                        Ajoutez d'abord un équipement à votre panier pour passer commande.
                    </p>
                    <Link
                        href={products.index.url()}
                        className="mt-8 rounded-full bg-ember-500 px-8 py-4 text-sm font-bold tracking-wide text-coal-950 uppercase transition-all duration-300 hover:bg-ember-400 hover:shadow-ember"
                    >
                        Voir le catalogue
                    </Link>
                </section>
            </>
        );
    }

    return (
        <>
            <Head title="Finaliser ma commande" />

            <section className="mx-auto max-w-7xl px-5 pt-32 pb-24 lg:px-8">
                <SectionReveal>
                    <Link
                        href={products.index.url()}
                        className="group inline-flex items-center gap-2 text-sm text-smoke-300 transition-colors hover:text-ember-400"
                    >
                        <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
                        Continuer mes achats
                    </Link>
                    <h1 className="mt-6 font-display text-4xl tracking-wide text-smoke-100 uppercase sm:text-6xl">
                        Finaliser ma <span className="text-ember-500">commande</span>
                    </h1>
                </SectionReveal>

                <div className="mt-12 grid gap-10 lg:grid-cols-5">
                    {/* Formulaire */}
                    <SectionReveal className="lg:col-span-3">
                        <form
                            onSubmit={submit}
                            className="space-y-5 rounded-3xl border border-coal-800 bg-coal-900/40 p-8"
                        >
                            <h2 className="font-display text-2xl tracking-wide text-smoke-100">Vos coordonnées</h2>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="customer_name"
                                        className="mb-2 block text-sm font-medium text-smoke-100"
                                    >
                                        Nom complet *
                                    </label>
                                    <input
                                        id="customer_name"
                                        type="text"
                                        value={form.customer_name}
                                        onChange={(event) => setField('customer_name', event.target.value)}
                                        className={inputClass}
                                        placeholder="Votre nom"
                                        required
                                    />
                                    {errors.customer_name && (
                                        <p className="mt-1.5 text-xs text-red-400">{errors.customer_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="customer_phone"
                                        className="mb-2 block text-sm font-medium text-smoke-100"
                                    >
                                        Téléphone *
                                    </label>
                                    <input
                                        id="customer_phone"
                                        type="tel"
                                        value={form.customer_phone}
                                        onChange={(event) => setField('customer_phone', event.target.value)}
                                        className={inputClass}
                                        placeholder="+225 ..."
                                        required
                                    />
                                    {errors.customer_phone && (
                                        <p className="mt-1.5 text-xs text-red-400">{errors.customer_phone}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="customer_email"
                                    className="mb-2 block text-sm font-medium text-smoke-100"
                                >
                                    Email
                                </label>
                                <input
                                    id="customer_email"
                                    type="email"
                                    value={form.customer_email}
                                    onChange={(event) => setField('customer_email', event.target.value)}
                                    className={inputClass}
                                    placeholder="vous@exemple.ci"
                                />
                                {errors.customer_email && (
                                    <p className="mt-1.5 text-xs text-red-400">{errors.customer_email}</p>
                                )}
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="city" className="mb-2 block text-sm font-medium text-smoke-100">
                                        Ville *
                                    </label>
                                    <input
                                        id="city"
                                        type="text"
                                        value={form.city}
                                        onChange={(event) => setField('city', event.target.value)}
                                        className={inputClass}
                                        placeholder="Abidjan"
                                        required
                                    />
                                    {errors.city && <p className="mt-1.5 text-xs text-red-400">{errors.city}</p>}
                                </div>

                                <div>
                                    <label htmlFor="address" className="mb-2 block text-sm font-medium text-smoke-100">
                                        Adresse de livraison *
                                    </label>
                                    <input
                                        id="address"
                                        type="text"
                                        value={form.address}
                                        onChange={(event) => setField('address', event.target.value)}
                                        className={inputClass}
                                        placeholder="Commune, quartier, repère..."
                                        required
                                    />
                                    {errors.address && <p className="mt-1.5 text-xs text-red-400">{errors.address}</p>}
                                </div>
                            </div>

                            {errors.items && (
                                <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                    {errors.items}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-full bg-ember-500 py-4 text-sm font-bold tracking-wide text-coal-950 uppercase transition-all duration-300 hover:bg-ember-400 hover:shadow-ember disabled:opacity-60"
                            >
                                {processing ? 'Envoi de la commande...' : `Commander — ${formatFcfa(total)}`}
                            </button>

                            <p className="text-center text-xs text-smoke-500">
                                Paiement à la livraison. Notre équipe vous contacte pour confirmer la commande et
                                organiser la livraison.
                            </p>
                        </form>
                    </SectionReveal>

                    {/* Récapitulatif */}
                    <SectionReveal delay={0.12} className="lg:col-span-2">
                        <div className="rounded-3xl border border-coal-800 bg-coal-900/40 p-8">
                            <h2 className="font-display text-2xl tracking-wide text-smoke-100">Récapitulatif</h2>

                            <ul className="mt-6 divide-y divide-coal-800">
                                {items.map((item) => (
                                    <li key={item.productId} className="flex items-center justify-between gap-4 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-smoke-100">{item.name}</p>
                                            <p className="mt-0.5 text-xs text-smoke-500">
                                                {item.quantity} × {formatFcfa(item.price)}
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-ember-400">
                                            {formatFcfa(item.price * item.quantity)}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-4 flex items-center justify-between border-t border-coal-800 pt-5">
                                <span className="text-sm text-smoke-300">Total</span>
                                <span className="font-display text-3xl tracking-wide text-ember-400">
                                    {formatFcfa(total)}
                                </span>
                            </div>
                        </div>
                    </SectionReveal>
                </div>
            </section>
        </>
    );
}
