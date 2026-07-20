import { Head, useForm, usePage } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useEffect  } from 'react';
import type {FormEvent} from 'react';
import { toast } from 'sonner';
import { SectionReveal } from '@/components/shop/section-reveal';
import contact from '@/routes/contact';

interface FlashProps {
    flash?: { success?: string };
    [key: string]: unknown;
}

export default function Contact() {
    const { flash } = usePage<FlashProps>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(contact.send.url(), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const inputClass =
        'w-full rounded-xl border border-coal-700 bg-coal-900 px-4 py-3.5 text-sm text-smoke-100 placeholder:text-smoke-500 transition-colors focus:border-ember-500 focus:outline-none';

    return (
        <>
            <Head title="Contact" />

            <section className="mx-auto max-w-7xl px-5 pt-36 pb-24 lg:px-8">
                <SectionReveal>
                    <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-ember-500 uppercase">Contact</p>
                    <h1 className="font-display text-5xl tracking-wide text-smoke-100 uppercase sm:text-7xl">
                        Parlons de votre <span className="text-ember-500">projet</span>
                    </h1>
                </SectionReveal>

                <div className="mt-16 grid gap-12 lg:grid-cols-5">
                    {/* Coordonnées */}
                    <SectionReveal className="lg:col-span-2">
                        <div className="space-y-6">
                            <a
                                href="tel:+2250777777058"
                                className="flex items-center gap-4 rounded-2xl border border-coal-800 bg-coal-900/60 p-6 transition-colors hover:border-ember-500/50"
                            >
                                <Phone className="size-6 shrink-0 text-ember-500" />
                                <div>
                                    <p className="text-xs tracking-widest text-smoke-500 uppercase">Téléphone</p>
                                    <p className="mt-1 font-semibold text-smoke-100">+225 07 77 77 70 58</p>
                                </div>
                            </a>

                            <a
                                href="mailto:ivoircuisson@dym.ci"
                                className="flex items-center gap-4 rounded-2xl border border-coal-800 bg-coal-900/60 p-6 transition-colors hover:border-ember-500/50"
                            >
                                <Mail className="size-6 shrink-0 text-ember-500" />
                                <div>
                                    <p className="text-xs tracking-widest text-smoke-500 uppercase">Email</p>
                                    <p className="mt-1 font-semibold text-smoke-100">ivoircuisson@dym.ci</p>
                                </div>
                            </a>

                            <div className="flex items-center gap-4 rounded-2xl border border-coal-800 bg-coal-900/60 p-6">
                                <MapPin className="size-6 shrink-0 text-ember-500" />
                                <div>
                                    <p className="text-xs tracking-widest text-smoke-500 uppercase">Atelier</p>
                                    <p className="mt-1 font-semibold text-smoke-100">Abidjan, Côte d'Ivoire</p>
                                </div>
                            </div>
                        </div>
                    </SectionReveal>

                    {/* Formulaire */}
                    <SectionReveal delay={0.12} className="lg:col-span-3">
                        <form onSubmit={submit} className="space-y-5 rounded-3xl border border-coal-800 bg-coal-900/40 p-8">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-smoke-100">
                                        Nom complet *
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(event) => setData('name', event.target.value)}
                                        className={inputClass}
                                        placeholder="Votre nom"
                                        required
                                    />
                                    {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="phone" className="mb-2 block text-sm font-medium text-smoke-100">
                                        Téléphone *
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(event) => setData('phone', event.target.value)}
                                        className={inputClass}
                                        placeholder="+225 ..."
                                        required
                                    />
                                    {errors.phone && <p className="mt-1.5 text-xs text-red-400">{errors.phone}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-medium text-smoke-100">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(event) => setData('email', event.target.value)}
                                    className={inputClass}
                                    placeholder="vous@exemple.ci"
                                />
                                {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="message" className="mb-2 block text-sm font-medium text-smoke-100">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(event) => setData('message', event.target.value)}
                                    className={inputClass}
                                    rows={5}
                                    placeholder="Décrivez votre besoin : type d'équipement, quantité, usage..."
                                    required
                                />
                                {errors.message && <p className="mt-1.5 text-xs text-red-400">{errors.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-full bg-ember-500 py-4 text-sm font-bold tracking-wide text-coal-950 uppercase transition-all duration-300 hover:bg-ember-400 hover:shadow-ember disabled:opacity-60 sm:w-auto sm:px-10"
                            >
                                {processing ? 'Envoi en cours...' : 'Envoyer le message'}
                            </button>
                        </form>
                    </SectionReveal>
                </div>
            </section>
        </>
    );
}
