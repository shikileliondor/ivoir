import { Head, Link, router } from '@inertiajs/react';
import { Inbox, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes/admin';
import orders from '@/routes/admin/orders';
import type { AdminOrderRow, Paginated } from '@/types/admin';
import {
    formatDate,
    ORDER_STATUS_CLASSES,
    ORDER_STATUS_LABELS,
    ORDER_STATUSES,
} from '@/types/admin';
import { formatFcfa } from '@/types/shop';

export default function AdminOrders({
    orders: page,
    filters,
}: {
    orders: Paginated<AdminOrderRow>;
    filters: { statut: string | null; q: string | null };
}) {
    const [search, setSearch] = useState(filters.q ?? '');

    const applyFilters = (next: { statut?: string | null; q?: string }) => {
        router.get(
            orders.index.url({
                query: {
                    statut: next.statut === undefined ? filters.statut : next.statut,
                    q: next.q === undefined ? filters.q : next.q || null,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Commandes" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Commandes
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Suivez et gérez les commandes de vos clients.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
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
                            placeholder="Référence, client, téléphone…"
                            className="w-64 pl-8"
                        />
                    </form>

                    <div className="flex flex-wrap gap-1">
                        <Button
                            variant={filters.statut === null ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => applyFilters({ statut: null })}
                        >
                            Toutes
                        </Button>
                        {ORDER_STATUSES.map((status) => (
                            <Button
                                key={status}
                                variant={
                                    filters.statut === status
                                        ? 'secondary'
                                        : 'ghost'
                                }
                                size="sm"
                                onClick={() => applyFilters({ statut: status })}
                            >
                                {ORDER_STATUS_LABELS[status]}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
                                <th className="px-4 py-3 font-medium">Référence</th>
                                <th className="px-4 py-3 font-medium">Client</th>
                                <th className="px-4 py-3 font-medium">Ville</th>
                                <th className="px-4 py-3 font-medium">Articles</th>
                                <th className="px-4 py-3 font-medium">Total</th>
                                <th className="px-4 py-3 font-medium">Statut</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {page.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="p-10 text-center text-sm text-muted-foreground"
                                    >
                                        <Inbox className="mx-auto mb-2 size-6 opacity-40" />
                                        Aucune commande trouvée.
                                    </td>
                                </tr>
                            )}
                            {page.data.map((order) => (
                                <tr
                                    key={order.reference}
                                    className="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/40"
                                    onClick={() =>
                                        router.visit(
                                            orders.show.url({
                                                order: order.reference,
                                            }),
                                        )
                                    }
                                >
                                    <td className="px-4 py-3">
                                        <Link
                                            href={orders.show.url({
                                                order: order.reference,
                                            })}
                                            className="font-medium hover:underline"
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                        >
                                            {order.reference}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="block">
                                            {order.customerName}
                                        </span>
                                        <span className="block text-xs text-muted-foreground">
                                            {order.customerPhone}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {order.city}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                                        {order.itemsCount}
                                    </td>
                                    <td className="px-4 py-3 font-medium tabular-nums">
                                        {formatFcfa(order.total)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            className={
                                                ORDER_STATUS_CLASSES[
                                                    order.status
                                                ] ?? ''
                                            }
                                        >
                                            {ORDER_STATUS_LABELS[
                                                order.status
                                            ] ?? order.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {formatDate(order.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {page.last_page > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground">
                            {page.total} commande(s) — page {page.current_page}{' '}
                            / {page.last_page}
                        </p>
                        <div className="flex gap-1">
                            {page.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={
                                        link.active ? 'secondary' : 'ghost'
                                    }
                                    size="sm"
                                    disabled={link.url === null}
                                    onClick={() =>
                                        link.url && router.visit(link.url)
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

AdminOrders.layout = {
    breadcrumbs: [
        { title: 'Administration', href: dashboard() },
        { title: 'Commandes', href: orders.index() },
    ],
};
