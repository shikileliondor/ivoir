import { Form, Head, Link } from '@inertiajs/react';
import { Flame, Pencil, Plus, Trash2 } from 'lucide-react';
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

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Produits</h1>
                    <Button asChild>
                        <Link href={products.create()}>
                            <Plus /> Nouveau produit
                        </Link>
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                                <th className="p-3 font-medium">Produit</th>
                                <th className="p-3 font-medium">Catégorie</th>
                                <th className="p-3 font-medium">Prix</th>
                                <th className="p-3 font-medium">Statut</th>
                                <th className="p-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="p-6 text-center text-muted-foreground"
                                    >
                                        Aucun produit. Créez le premier !
                                    </td>
                                </tr>
                            )}
                            {rows.map((product) => (
                                <tr
                                    key={product.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="p-3">
                                        <span className="flex items-center gap-3">
                                            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
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
                                    <td className="p-3 text-muted-foreground">
                                        {product.category}
                                    </td>
                                    <td className="p-3 tabular-nums">
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
                                    <td className="p-3">
                                        <span className="flex flex-wrap gap-1">
                                            {!product.isActive && (
                                                <Badge variant="secondary">
                                                    Inactif
                                                </Badge>
                                            )}
                                            {product.isActive && (
                                                <Badge variant="outline">
                                                    Actif
                                                </Badge>
                                            )}
                                            {product.isFeatured && (
                                                <Badge variant="secondary">
                                                    Vedette
                                                </Badge>
                                            )}
                                            {product.promoLabel !== null ||
                                            product.currentPrice !==
                                                product.price ? (
                                                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
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
                                    <td className="p-3">
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
