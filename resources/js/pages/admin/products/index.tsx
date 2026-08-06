import { Form, Head, Link } from '@inertiajs/react';
import { Flame, PackageOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ProductController from '@/actions/App/Http/Controllers/Admin/ProductController';
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
import { dashboard } from '@/routes/admin';
import products from '@/routes/admin/products';
import type { AdminProductRow } from '@/types/admin';
import { formatFcfa } from '@/types/shop';

export default function AdminProducts({
    products: rows,
}: {
    products: AdminProductRow[];
}) {
    const [toDelete, setToDelete] = useState<AdminProductRow | null>(null);

    return (
        <>
            <Head title="Produits" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Produits
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Gérez le catalogue de la boutique.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={products.create()}>
                            <Plus /> Nouveau produit
                        </Link>
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
                                <th className="px-4 py-3 font-medium">
                                    Produit
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Catégorie
                                </th>
                                <th className="px-4 py-3 font-medium">Prix</th>
                                <th className="px-4 py-3 font-medium">
                                    Statut
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="p-10 text-center text-sm text-muted-foreground"
                                    >
                                        <PackageOpen className="mx-auto mb-2 size-6 opacity-40" />
                                        Aucun produit. Créez le premier !
                                    </td>
                                </tr>
                            )}
                            {rows.map((product) => (
                                <tr
                                    key={product.id}
                                    className="border-b transition-colors last:border-0 hover:bg-muted/40"
                                >
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-3">
                                            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt=""
                                                        className="size-full object-contain"
                                                    />
                                                ) : (
                                                    <Flame className="size-4 text-muted-foreground" />
                                                )}
                                            </span>
                                            <span className="font-medium">
                                                {product.name}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {product.category}
                                    </td>
                                    <td className="px-4 py-3 tabular-nums">
                                        {product.currentPrice !==
                                        product.price ? (
                                            <span className="flex flex-col">
                                                <span className="font-medium">
                                                    {formatFcfa(
                                                        product.currentPrice,
                                                    )}
                                                </span>
                                                <span className="text-xs text-muted-foreground line-through">
                                                    {formatFcfa(product.price)}
                                                </span>
                                            </span>
                                        ) : (
                                            formatFcfa(product.price)
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="flex flex-wrap gap-1">
                                            {!product.isActive && (
                                                <Badge variant="secondary">
                                                    Inactif
                                                </Badge>
                                            )}
                                            {product.isActive && (
                                                <Badge variant="success">
                                                    Actif
                                                </Badge>
                                            )}
                                            {product.isFeatured && (
                                                <Badge variant="ember">
                                                    Vedette
                                                </Badge>
                                            )}
                                            {product.promoLabel !== null ||
                                            product.currentPrice !==
                                                product.price ? (
                                                <Badge variant="ember">
                                                    {product.promoLabel ??
                                                        'Promo'}
                                                </Badge>
                                            ) : null}
                                            {product.stock === 0 && (
                                                <Badge variant="destructive">
                                                    Rupture
                                                </Badge>
                                            )}
                                            {product.stock !== null &&
                                                product.stock > 0 && (
                                                    <Badge variant="outline">
                                                        Stock : {product.stock}
                                                    </Badge>
                                                )}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="flex justify-end gap-1">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Modifier ${product.name}`}
                                            >
                                                <Link
                                                    href={products.edit.url({
                                                        product: product.slug,
                                                    })}
                                                >
                                                    <Pencil />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Supprimer ${product.name}`}
                                                onClick={() =>
                                                    setToDelete(product)
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

            <Dialog
                open={toDelete !== null}
                onOpenChange={(open) => !open && setToDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer le produit ?</DialogTitle>
                        <DialogDescription>
                            « {toDelete?.name} » sera définitivement supprimé du
                            catalogue. Les commandes passées conservent leur
                            historique.
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
                                {...ProductController.destroy.form({
                                    product: toDelete.slug,
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

AdminProducts.layout = {
    breadcrumbs: [
        { title: 'Administration', href: dashboard() },
        { title: 'Produits', href: products.index() },
    ],
};
