import { Form, Head, router } from '@inertiajs/react';
import {
    Download,
    Mail,
    MailOpen,
    MessageSquare,
    Phone,
    Search,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import CommunicationController from '@/actions/App/Http/Controllers/Admin/CommunicationController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes/admin';
import communication from '@/routes/admin/communication';
import type {
    ContactMessageRow,
    NewsletterSubscriberRow,
    Paginated,
} from '@/types/admin';
import { formatDate } from '@/types/admin';

interface CommunicationProps {
    messages: Paginated<ContactMessageRow>;
    subscribers: Paginated<NewsletterSubscriberRow>;
    stats: {
        unreadMessages: number;
        totalMessages: number;
        totalSubscribers: number;
    };
    filters: { q: string | null; non_lus: boolean };
}

type Tab = 'messages' | 'subscribers';

function Pagination({ page }: { page: Paginated<unknown> }) {
    if (page.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
                {page.total} résultat(s) — page {page.current_page} /{' '}
                {page.last_page}
            </p>
            <div className="flex gap-1">
                {page.links.map((link, index) => (
                    <Button
                        key={index}
                        variant={link.active ? 'secondary' : 'ghost'}
                        size="sm"
                        disabled={link.url === null}
                        onClick={() =>
                            link.url &&
                            router.visit(link.url, { preserveScroll: true })
                        }
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </div>
    );
}

export default function AdminCommunication({
    messages,
    subscribers,
    stats,
    filters,
}: CommunicationProps) {
    const [tab, setTab] = useState<Tab>('messages');
    const [search, setSearch] = useState(filters.q ?? '');
    const [reading, setReading] = useState<ContactMessageRow | null>(null);
    const [messageToDelete, setMessageToDelete] =
        useState<ContactMessageRow | null>(null);
    const [subscriberToDelete, setSubscriberToDelete] =
        useState<NewsletterSubscriberRow | null>(null);

    const applyFilters = (next: { q?: string; non_lus?: boolean }) => {
        router.get(
            communication.index.url({
                query: {
                    q: next.q === undefined ? filters.q : next.q || null,
                    non_lus:
                        (next.non_lus === undefined
                            ? filters.non_lus
                            : next.non_lus) || null,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    // Opening a message marks it read, so an admin never has to do it by hand.
    const openMessage = (message: ContactMessageRow) => {
        setReading(message);

        if (!message.isRead) {
            router.put(
                communication.messages.toggleRead.url({
                    contactMessage: message.id,
                }),
                {},
                { preserveScroll: true, preserveState: true },
            );
        }
    };

    return (
        <>
            <Head title="Communication" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Communication
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Messages de contact et abonnés à la newsletter.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="flex items-start justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm">
                        <div className="min-w-0">
                            <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Messages non lus
                            </p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                                {stats.unreadMessages}
                            </p>
                        </div>
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ember-500/15 text-ember-600 dark:text-ember-300">
                            <Mail className="size-4.5" />
                        </span>
                    </div>
                    <div className="flex items-start justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm">
                        <div className="min-w-0">
                            <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Messages reçus
                            </p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                                {stats.totalMessages}
                            </p>
                        </div>
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/12 text-teal-700 dark:text-teal-300">
                            <MailOpen className="size-4.5" />
                        </span>
                    </div>
                    <div className="flex items-start justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm">
                        <div className="min-w-0">
                            <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Abonnés newsletter
                            </p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                                {stats.totalSubscribers}
                            </p>
                        </div>
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/12 text-violet-600 dark:text-violet-300">
                            <Users className="size-4.5" />
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex gap-1">
                        <Button
                            variant={tab === 'messages' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setTab('messages')}
                        >
                            <MessageSquare /> Messages
                            {stats.unreadMessages > 0 && (
                                <Badge variant="ember" className="ml-1">
                                    {stats.unreadMessages}
                                </Badge>
                            )}
                        </Button>
                        <Button
                            variant={
                                tab === 'subscribers' ? 'secondary' : 'ghost'
                            }
                            size="sm"
                            onClick={() => setTab('subscribers')}
                        >
                            <Users /> Abonnés
                        </Button>
                    </div>

                    <form
                        className="relative"
                        onSubmit={(event) => {
                            event.preventDefault();
                            applyFilters({ q: search });
                        }}
                    >
                        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={
                                tab === 'messages'
                                    ? 'Nom, email, téléphone, message…'
                                    : 'Email…'
                            }
                            aria-label="Rechercher"
                            className="w-64 pl-8"
                        />
                    </form>

                    {tab === 'messages' ? (
                        <Button
                            variant={filters.non_lus ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() =>
                                applyFilters({ non_lus: !filters.non_lus })
                            }
                        >
                            Non lus uniquement
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={communication.subscribers.export.url()}
                                download
                            >
                                <Download /> Exporter en CSV
                            </a>
                        </Button>
                    )}
                </div>

                {tab === 'messages' ? (
                    <>
                        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
                                        <th className="px-4 py-3 font-medium">
                                            Expéditeur
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Message
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Reçu le
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messages.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="p-10 text-center text-sm text-muted-foreground"
                                            >
                                                <MessageSquare className="mx-auto mb-2 size-6 opacity-40" />
                                                Aucun message.
                                            </td>
                                        </tr>
                                    )}
                                    {messages.data.map((message) => (
                                        <tr
                                            key={message.id}
                                            className="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/40"
                                            onClick={() => openMessage(message)}
                                        >
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-2">
                                                    <span
                                                        className={
                                                            message.isRead
                                                                ? ''
                                                                : 'font-semibold'
                                                        }
                                                    >
                                                        {message.name}
                                                    </span>
                                                    {message.isRead ? (
                                                        <Badge variant="outline">
                                                            Lu
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="ember">
                                                            Non lu
                                                        </Badge>
                                                    )}
                                                </span>
                                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                                    {message.phone}
                                                    {message.email
                                                        ? ` — ${message.email}`
                                                        : ''}
                                                </span>
                                            </td>
                                            <td className="max-w-md px-4 py-3 text-muted-foreground">
                                                <span className="line-clamp-2">
                                                    {message.message}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                                {formatDate(message.createdAt)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={
                                                            message.isRead
                                                                ? `Marquer le message de ${message.name} comme non lu`
                                                                : `Marquer le message de ${message.name} comme lu`
                                                        }
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            router.put(
                                                                communication.messages.toggleRead.url(
                                                                    {
                                                                        contactMessage:
                                                                            message.id,
                                                                    },
                                                                ),
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            );
                                                        }}
                                                    >
                                                        {message.isRead ? (
                                                            <MailOpen />
                                                        ) : (
                                                            <Mail />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Supprimer le message de ${message.name}`}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            setMessageToDelete(
                                                                message,
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="text-destructive" />
                                                    </Button>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination page={messages} />
                    </>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
                                        <th className="px-4 py-3 font-medium">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Inscrit le
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscribers.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="p-10 text-center text-sm text-muted-foreground"
                                            >
                                                <Users className="mx-auto mb-2 size-6 opacity-40" />
                                                Aucun abonné.
                                            </td>
                                        </tr>
                                    )}
                                    {subscribers.data.map((subscriber) => (
                                        <tr
                                            key={subscriber.id}
                                            className="border-b transition-colors last:border-0 hover:bg-muted/40"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                <a
                                                    href={`mailto:${subscriber.email}`}
                                                    className="hover:underline"
                                                >
                                                    {subscriber.email}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {formatDate(
                                                    subscriber.createdAt,
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="flex justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Supprimer ${subscriber.email}`}
                                                        onClick={() =>
                                                            setSubscriberToDelete(
                                                                subscriber,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="text-destructive" />
                                                    </Button>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination page={subscribers} />
                    </>
                )}
            </div>

            <Dialog
                open={reading !== null}
                onOpenChange={(open) => !open && setReading(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{reading?.name}</DialogTitle>
                        <DialogDescription>
                            Reçu le {formatDate(reading?.createdAt ?? null)}
                        </DialogDescription>
                    </DialogHeader>

                    {reading && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <a href={`tel:${reading.phone}`}>
                                        <Phone /> {reading.phone}
                                    </a>
                                </Button>
                                {reading.email && (
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={`mailto:${reading.email}`}>
                                            <Mail /> {reading.email}
                                        </a>
                                    </Button>
                                )}
                            </div>

                            <p className="max-h-80 overflow-y-auto rounded-xl border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                                {reading.message}
                            </p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setReading(null)}
                        >
                            Fermer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={messageToDelete !== null}
                onOpenChange={(open) => !open && setMessageToDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer ce message ?</DialogTitle>
                        <DialogDescription>
                            Le message de « {messageToDelete?.name} » sera
                            définitivement supprimé.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setMessageToDelete(null)}
                        >
                            Annuler
                        </Button>
                        {messageToDelete && (
                            <Form
                                {...CommunicationController.destroyMessage.form({
                                    contactMessage: messageToDelete.id,
                                })}
                                options={{ preserveScroll: true }}
                                onSuccess={() => setMessageToDelete(null)}
                            >
                                {({ processing }) => (
                                    <Button
                                        variant="destructive"
                                        disabled={processing}
                                    >
                                        Supprimer
                                    </Button>
                                )}
                            </Form>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={subscriberToDelete !== null}
                onOpenChange={(open) => !open && setSubscriberToDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer cet abonné ?</DialogTitle>
                        <DialogDescription>
                            « {subscriberToDelete?.email} » ne recevra plus vos
                            actualités.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSubscriberToDelete(null)}
                        >
                            Annuler
                        </Button>
                        {subscriberToDelete && (
                            <Form
                                {...CommunicationController.destroySubscriber.form(
                                    {
                                        newsletterSubscriber:
                                            subscriberToDelete.id,
                                    },
                                )}
                                options={{ preserveScroll: true }}
                                onSuccess={() => setSubscriberToDelete(null)}
                            >
                                {({ processing }) => (
                                    <Button
                                        variant="destructive"
                                        disabled={processing}
                                    >
                                        Supprimer
                                    </Button>
                                )}
                            </Form>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminCommunication.layout = {
    breadcrumbs: [
        { title: 'Administration', href: dashboard() },
        { title: 'Communication', href: communication.index() },
    ],
};
