import { Head, Link } from '@inertiajs/react';
import {
    BadgePercent,
    Banknote,
    CalendarRange,
    Clock3,
    ShoppingCart,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import orders from '@/routes/admin/orders';
import {
    formatDate,
    formatDay,
    ORDER_STATUS_CLASSES,
    ORDER_STATUS_LABELS,
} from '@/types/admin';
import { formatFcfa } from '@/types/shop';

type Stats = {
    ordersToday: number;
    ordersMonth: number;
    revenueMonth: number;
    pendingOrders: number;
    visitorsToday: number;
    activePromos: number;
};

type VisitPoint = { date: string; visitors: number; pageViews: number };

type TopProduct = { name: string; quantity: number; revenue: number };

type RecentOrder = {
    reference: string;
    customerName: string;
    city: string;
    status: string;
    total: number;
    createdAt: string | null;
};

const SERIES = [
    {
        key: 'visitors' as const,
        label: 'Visiteurs',
        className: 'stroke-ember-500 dark:stroke-ember-400',
        dotClassName: 'bg-ember-500 dark:bg-ember-400',
        fillClassName: 'fill-ember-500 dark:fill-ember-400',
    },
    {
        key: 'pageViews' as const,
        label: 'Pages vues',
        className: 'stroke-teal-600 dark:stroke-teal-400',
        dotClassName: 'bg-teal-600 dark:bg-teal-400',
        fillClassName: 'fill-teal-600 dark:fill-teal-400',
    },
];

const W = 640;
const H = 200;
const PAD = { top: 12, right: 12, bottom: 24, left: 34 };

function VisitsChart({ data }: { data: VisitPoint[] }) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [hover, setHover] = useState<number | null>(null);

    const max = useMemo(
        () =>
            Math.max(
                1,
                ...data.map((d) => Math.max(d.visitors, d.pageViews)),
            ),
        [data],
    );

    const x = (i: number) =>
        PAD.left + (i * (W - PAD.left - PAD.right)) / Math.max(1, data.length - 1);
    const y = (v: number) =>
        H - PAD.bottom - (v / max) * (H - PAD.top - PAD.bottom);

    const path = (key: 'visitors' | 'pageViews') =>
        data
            .map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d[key])}`)
            .join(' ');

    const ticks = useMemo(() => {
        const step = Math.max(1, Math.ceil(max / 4));
        const values = [];

        for (let v = 0; v <= max; v += step) {
            values.push(v);
        }

        return values;
    }, [max]);

    const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const px = ((event.clientX - rect.left) / rect.width) * W;
        const ratio =
            (px - PAD.left) / Math.max(1, W - PAD.left - PAD.right);
        const index = Math.round(ratio * (data.length - 1));
        setHover(Math.min(data.length - 1, Math.max(0, index)));
    };

    if (data.length === 0) {
        return null;
    }

    const hovered = hover !== null ? data[hover] : null;

    return (
        <div ref={wrapperRef} className="relative">
            <div className="mb-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {SERIES.map((series) => (
                    <span key={series.key} className="flex items-center gap-2">
                        <span
                            className={`size-2.5 rounded-full ${series.dotClassName}`}
                        />
                        {series.label}
                    </span>
                ))}
            </div>

            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full"
                role="img"
                aria-label="Visiteurs et pages vues sur les 14 derniers jours"
                onMouseMove={handleMove}
                onMouseLeave={() => setHover(null)}
            >
                {ticks.map((tick) => (
                    <g key={tick}>
                        <line
                            x1={PAD.left}
                            x2={W - PAD.right}
                            y1={y(tick)}
                            y2={y(tick)}
                            className="stroke-border"
                            strokeWidth={1}
                        />
                        <text
                            x={PAD.left - 6}
                            y={y(tick) + 3}
                            textAnchor="end"
                            className="fill-muted-foreground text-[10px] tabular-nums"
                        >
                            {tick}
                        </text>
                    </g>
                ))}

                {data.map((d, i) =>
                    i % 2 === 0 ? (
                        <text
                            key={d.date}
                            x={x(i)}
                            y={H - 6}
                            textAnchor="middle"
                            className="fill-muted-foreground text-[10px]"
                        >
                            {formatDay(d.date)}
                        </text>
                    ) : null,
                )}

                {hover !== null && (
                    <line
                        x1={x(hover)}
                        x2={x(hover)}
                        y1={PAD.top}
                        y2={H - PAD.bottom}
                        className="stroke-muted-foreground/40"
                        strokeWidth={1}
                    />
                )}

                {SERIES.map((series) => (
                    <path
                        key={series.key}
                        d={path(series.key)}
                        fill="none"
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className={series.className}
                    />
                ))}

                {hover !== null &&
                    SERIES.map((series) => (
                        <circle
                            key={series.key}
                            cx={x(hover)}
                            cy={y(data[hover][series.key])}
                            r={4}
                            className={`${series.fillClassName} stroke-background`}
                            strokeWidth={2}
                        />
                    ))}
            </svg>

            {hovered && hover !== null && (
                <div
                    className="pointer-events-none absolute top-8 z-10 rounded-md border bg-popover px-3 py-2 text-xs shadow-md"
                    style={{
                        left: `${(x(hover) / W) * 100}%`,
                        transform:
                            hover > data.length / 2
                                ? 'translateX(calc(-100% - 8px))'
                                : 'translateX(8px)',
                    }}
                >
                    <p className="mb-1 font-medium text-foreground">
                        {formatDay(hovered.date)}
                    </p>
                    {SERIES.map((series) => (
                        <p
                            key={series.key}
                            className="flex items-center gap-2 text-muted-foreground"
                        >
                            <span
                                className={`size-2 rounded-full ${series.dotClassName}`}
                            />
                            {series.label} :{' '}
                            <span className="font-medium tabular-nums text-foreground">
                                {hovered[series.key]}
                            </span>
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    chipClass,
}: {
    label: string;
    value: string;
    icon: LucideIcon;
    chipClass: string;
}) {
    return (
        <Card className="py-4">
            <CardContent className="flex items-start justify-between gap-3 px-4">
                <div className="min-w-0">
                    <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                        {value}
                    </p>
                </div>
                <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${chipClass}`}
                >
                    <Icon className="size-4.5" />
                </span>
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard({
    stats,
    visitSeries,
    topProducts,
    recentOrders,
}: {
    stats: Stats;
    visitSeries: VisitPoint[];
    topProducts: TopProduct[];
    recentOrders: RecentOrder[];
}) {
    return (
        <>
            <Head title="Administration" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Tableau de bord
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Vue d'ensemble de la boutique IvoirCuisson.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <StatCard
                        label="Commandes aujourd'hui"
                        value={String(stats.ordersToday)}
                        icon={ShoppingCart}
                        chipClass="bg-blue-500/12 text-blue-600 dark:text-blue-300"
                    />
                    <StatCard
                        label="Commandes ce mois"
                        value={String(stats.ordersMonth)}
                        icon={CalendarRange}
                        chipClass="bg-teal-500/12 text-teal-700 dark:text-teal-300"
                    />
                    <StatCard
                        label="CA du mois"
                        value={formatFcfa(stats.revenueMonth)}
                        icon={Banknote}
                        chipClass="bg-ember-500/15 text-ember-600 dark:text-ember-300"
                    />
                    <StatCard
                        label="En attente"
                        value={String(stats.pendingOrders)}
                        icon={Clock3}
                        chipClass="bg-amber-400/20 text-amber-700 dark:text-amber-300"
                    />
                    <StatCard
                        label="Visiteurs aujourd'hui"
                        value={String(stats.visitorsToday)}
                        icon={Users}
                        chipClass="bg-violet-500/12 text-violet-600 dark:text-violet-300"
                    />
                    <StatCard
                        label="Promos actives"
                        value={String(stats.activePromos)}
                        icon={BadgePercent}
                        chipClass="bg-rose-500/12 text-rose-600 dark:text-rose-300"
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Fréquentation — 14 derniers jours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <VisitsChart data={visitSeries} />
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Meilleures ventes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {topProducts.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Aucune vente pour le moment.
                                </p>
                            ) : (
                                <ul className="divide-y">
                                    {topProducts.map((product, index) => (
                                        <li
                                            key={product.name}
                                            className="flex items-center gap-3 py-2.5 text-sm"
                                        >
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-ember-500/12 font-display text-sm text-ember-600 dark:text-ember-300">
                                                {index + 1}
                                            </span>
                                            <span className="min-w-0 flex-1 truncate font-medium">
                                                {product.name}
                                            </span>
                                            <span className="shrink-0 text-muted-foreground tabular-nums">
                                                {product.quantity} vendus ·{' '}
                                                {formatFcfa(product.revenue)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dernières commandes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentOrders.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Aucune commande pour le moment.
                                </p>
                            ) : (
                                <ul className="divide-y">
                                    {recentOrders.map((order) => (
                                        <li key={order.reference}>
                                            <Link
                                                href={orders.show.url({
                                                    order: order.reference,
                                                })}
                                                className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/60"
                                            >
                                                <span className="min-w-0">
                                                    <span className="block truncate font-medium">
                                                        {order.customerName}
                                                    </span>
                                                    <span className="block text-xs text-muted-foreground">
                                                        {order.reference} ·{' '}
                                                        {formatDate(
                                                            order.createdAt,
                                                        )}
                                                    </span>
                                                </span>
                                                <span className="flex shrink-0 items-center gap-2">
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
                                                    <span className="tabular-nums">
                                                        {formatFcfa(
                                                            order.total,
                                                        )}
                                                    </span>
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Administration', href: dashboard() }],
};
