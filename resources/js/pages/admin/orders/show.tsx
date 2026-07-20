import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes/admin';
import orders from '@/routes/admin/orders';
import type { AdminOrderDetail } from '@/types/admin';
import {
    formatDate,
    ORDER_STATUS_CLASSES,
    ORDER_STATUS_LABELS,
    ORDER_STATUSES,
} from '@/types/admin';
import { formatFcfa } from '@/types/shop';

export default function AdminOrderShow({ order }: { order: AdminOrderDetail }) {
    const changeStatus = (status: string) => {
        router.put(
            orders.update.url({ order: order.reference }),
            { status },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={`Commande ${order.reference}`} />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="icon">
                            <Link
                                href={orders.index()}
                                aria-label="Retour aux commandes"
                            >
                                <ArrowLeft />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold">
                                {order.reference}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Passée le {formatDate(order.createdAt)}
                            </p>
                        </div>
                        <Badge
                            className={ORDER_STATUS_CLASSES[order.status] ?? ''}
                        >
                            {ORDER_STATUS_LABELS[order.status] ?? order.status}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Statut :
                        </span>
                        <Select
                            value={order.status}
                            onValueChange={changeStatus}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ORDER_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {ORDER_STATUS_LABELS[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Articles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-2 font-medium">
                                            Produit
                                        </th>
                                        <th className="pb-2 font-medium">
                                            Prix unitaire
                                        </th>
                                        <th className="pb-2 font-medium">
                                            Qté
                                        </th>
                                        <th className="pb-2 text-right font-medium">
                                            Sous-total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="border-b last:border-0"
                                        >
                                            <td className="py-2 font-medium">
                                                {item.productName}
                                            </td>
                                            <td className="py-2 tabular-nums">
                                                {formatFcfa(item.unitPrice)}
                                            </td>
                                            <td className="py-2 tabular-nums">
                                                {item.quantity}
                                            </td>
                                            <td className="py-2 text-right tabular-nums">
                                                {formatFcfa(
                                                    item.unitPrice *
                                                        item.quantity,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="pt-3 font-medium"
                                        >
                                            Total
                                        </td>
                                        <td className="pt-3 text-right text-base font-semibold tabular-nums">
                                            {formatFcfa(order.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Client</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Nom</p>
                                <p className="font-medium">
                                    {order.customerName}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Téléphone
                                </p>
                                <p className="font-medium">
                                    <a
                                        href={`tel:${order.customerPhone}`}
                                        className="hover:underline"
                                    >
                                        {order.customerPhone}
                                    </a>
                                </p>
                            </div>
                            {order.customerEmail && (
                                <div>
                                    <p className="text-muted-foreground">
                                        Email
                                    </p>
                                    <p className="font-medium">
                                        {order.customerEmail}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-muted-foreground">
                                    Livraison
                                </p>
                                <p className="font-medium">
                                    {order.address}, {order.city}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AdminOrderShow.layout = {
    breadcrumbs: [
        { title: 'Administration', href: dashboard() },
        { title: 'Commandes', href: orders.index() },
    ],
};
