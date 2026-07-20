import { Form, Head } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import PricePeriodController from '@/actions/App/Http/Controllers/Admin/PricePeriodController';
import InputError from '@/components/input-error';
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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes/admin';
import pricing from '@/routes/admin/pricing';
import type { PricePeriodRow } from '@/types/admin';
import { formatDate } from '@/types/admin';
import { formatFcfa } from '@/types/shop';

type ProductOption = { id: number; name: string; price: number };

const STATUS_LABELS: Record<PricePeriodRow['status'], string> = {
    active: 'En cours',
    upcoming: 'À venir',
    expired: 'Expirée',
};

const STATUS_CLASSES: Record<PricePeriodRow['status'], string> = {
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    expired: 'bg-muted text-muted-foreground',
};

function toLocalInput(iso: string): string {
    const date = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function PeriodFields({
    products,
    period,
    errors,
}: {
    products: ProductOption[];
    period: PricePeriodRow | null;
    errors: Record<string, string>;
}) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="product_id">Produit</Label>
                <Select
                    name="product_id"
                    required
                    defaultValue={
                        period ? String(period.product.id) : undefined
                    }
                >
                    <SelectTrigger id="product_id">
                        <SelectValue placeholder="Choisir un produit" />
                    </SelectTrigger>
                    <SelectContent>
                        {products.map((product) => (
                            <SelectItem
                                key={product.id}
                                value={String(product.id)}
                            >
                                {product.name} — {formatFcfa(product.price)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.product_id} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="label">Libellé (facultatif)</Label>
                <Input
                    id="label"
                    name="label"
                    defaultValue={period?.label ?? ''}
                    placeholder="Promo fêtes de fin d'année"
                />
                <InputError message={errors.label} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="period-price">Prix promotionnel (FCFA)</Label>
                <Input
                    id="period-price"
                    name="price"
                    type="number"
                    min={1}
                    step={1}
                    required
                    defaultValue={period?.price ?? ''}
                    placeholder="120000"
                />
                <InputError message={errors.price} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="starts_at">Début</Label>
                    <Input
                        id="starts_at"
                        name="starts_at"
                        type="datetime-local"
                        required
                        defaultValue={
                            period ? toLocalInput(period.startsAt) : ''
                        }
                    />
                    <InputError message={errors.starts_at} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="ends_at">Fin</Label>
                    <Input
                        id="ends_at"
                        name="ends_at"
                        type="datetime-local"
                        required
                        defaultValue={period ? toLocalInput(period.endsAt) : ''}
                    />
                    <InputError message={errors.ends_at} />
                </div>
            </div>
        </div>
    );
}

export default function AdminPricing({
    periods,
    products,
}: {
    periods: PricePeriodRow[];
    products: ProductOption[];
}) {
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<PricePeriodRow | null>(null);
    const [toDelete, setToDelete] = useState<PricePeriodRow | null>(null);

    return (
        <>
            <Head title="Tarification" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">
                            Tarification par périodes
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Un prix promotionnel remplace le prix de base
                            pendant la période choisie, puis le produit revient
                            automatiquement à son prix de base.
                        </p>
                    </div>
                    <Button onClick={() => setCreating(true)}>
                        <Plus /> Nouvelle période
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                                <th className="p-3 font-medium">Produit</th>
                                <th className="p-3 font-medium">Libellé</th>
                                <th className="p-3 font-medium">Prix promo</th>
                                <th className="p-3 font-medium">Période</th>
                                <th className="p-3 font-medium">Statut</th>
                                <th className="p-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {periods.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="p-6 text-center text-muted-foreground"
                                    >
                                        Aucune période tarifaire. Créez la
                                        première !
                                    </td>
                                </tr>
                            )}
                            {periods.map((period) => (
                                <tr
                                    key={period.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="p-3 font-medium">
                                        {period.product.name}
                                    </td>
                                    <td className="p-3 text-muted-foreground">
                                        {period.label ?? '—'}
                                    </td>
                                    <td className="p-3 tabular-nums">
                                        <span className="flex flex-col">
                                            <span className="font-medium">
                                                {formatFcfa(period.price)}
                                            </span>
                                            <span className="text-xs text-muted-foreground line-through">
                                                {formatFcfa(
                                                    period.product.basePrice,
                                                )}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="p-3 text-muted-foreground">
                                        {formatDate(period.startsAt)} →{' '}
                                        {formatDate(period.endsAt)}
                                    </td>
                                    <td className="p-3">
                                        <Badge
                                            className={
                                                STATUS_CLASSES[period.status]
                                            }
                                        >
                                            {STATUS_LABELS[period.status]}
                                        </Badge>
                                    </td>
                                    <td className="p-3">
                                        <span className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Modifier la période"
                                                onClick={() =>
                                                    setEditing(period)
                                                }
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Supprimer la période"
                                                onClick={() =>
                                                    setToDelete(period)
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
            </div>

            <Dialog open={creating} onOpenChange={setCreating}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouvelle période tarifaire</DialogTitle>
                        <DialogDescription>
                            Le prix promotionnel s'appliquera automatiquement
                            sur la boutique pendant la période.
                        </DialogDescription>
                    </DialogHeader>
                    <Form
                        {...PricePeriodController.store.form()}
                        options={{ preserveScroll: true }}
                        onSuccess={() => setCreating(false)}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <PeriodFields
                                    products={products}
                                    period={null}
                                    errors={errors}
                                />
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCreating(false)}
                                    >
                                        Annuler
                                    </Button>
                                    <Button disabled={processing}>
                                        Créer
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier la période</DialogTitle>
                    </DialogHeader>
                    {editing && (
                        <Form
                            {...PricePeriodController.update.form({
                                pricePeriod: editing.id,
                            })}
                            options={{ preserveScroll: true }}
                            onSuccess={() => setEditing(null)}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <PeriodFields
                                        products={products}
                                        period={editing}
                                        errors={errors}
                                    />
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setEditing(null)}
                                        >
                                            Annuler
                                        </Button>
                                        <Button disabled={processing}>
                                            Enregistrer
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={toDelete !== null}
                onOpenChange={(open) => !open && setToDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer la période ?</DialogTitle>
                        <DialogDescription>
                            « {toDelete?.product.name} » reviendra à son prix
                            de base ({toDelete && formatFcfa(toDelete.product.basePrice)}
                            ).
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setToDelete(null)}
                        >
                            Annuler
                        </Button>
                        {toDelete && (
                            <Form
                                {...PricePeriodController.destroy.form({
                                    pricePeriod: toDelete.id,
                                })}
                                options={{ preserveScroll: true }}
                                onSuccess={() => setToDelete(null)}
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

AdminPricing.layout = {
    breadcrumbs: [
        { title: 'Administration', href: dashboard() },
        { title: 'Tarification', href: pricing.index() },
    ],
};
