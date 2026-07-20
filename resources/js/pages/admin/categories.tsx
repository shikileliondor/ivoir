import { Form, Head } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import CategoryController from '@/actions/App/Http/Controllers/Admin/CategoryController';
import InputError from '@/components/input-error';
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
import { dashboard } from '@/routes/admin';
import categories from '@/routes/admin/categories';
import type { AdminCategoryRow } from '@/types/admin';

export default function AdminCategories({
    categories: rows,
}: {
    categories: AdminCategoryRow[];
}) {
    const [editing, setEditing] = useState<AdminCategoryRow | null>(null);
    const [toDelete, setToDelete] = useState<AdminCategoryRow | null>(null);

    return (
        <>
            <Head title="Catégories" />

            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-xl font-semibold">Catégories</h1>

                <div className="max-w-xl rounded-xl border p-4">
                    <Form
                        {...CategoryController.store.form()}
                        options={{ preserveScroll: true }}
                        resetOnSuccess
                        className="flex items-start gap-2"
                    >
                        {({ processing, errors }) => (
                            <div className="flex w-full flex-col gap-2">
                                <div className="flex gap-2">
                                    <Input
                                        name="name"
                                        required
                                        placeholder="Nouvelle catégorie"
                                        aria-label="Nom de la nouvelle catégorie"
                                    />
                                    <Button disabled={processing}>
                                        <Plus /> Ajouter
                                    </Button>
                                </div>
                                <InputError message={errors.name} />
                                <InputError message={errors.category} />
                            </div>
                        )}
                    </Form>
                </div>

                <div className="max-w-xl overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                                <th className="p-3 font-medium">Nom</th>
                                <th className="p-3 font-medium">Produits</th>
                                <th className="p-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((category) => (
                                <tr
                                    key={category.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="p-3 font-medium">
                                        {category.name}
                                    </td>
                                    <td className="p-3 text-muted-foreground tabular-nums">
                                        {category.productsCount}
                                    </td>
                                    <td className="p-3">
                                        <span className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Renommer ${category.name}`}
                                                onClick={() =>
                                                    setEditing(category)
                                                }
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Supprimer ${category.name}`}
                                                onClick={() =>
                                                    setToDelete(category)
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
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Renommer la catégorie</DialogTitle>
                    </DialogHeader>
                    {editing && (
                        <Form
                            {...CategoryController.update.form({
                                category: editing.slug,
                            })}
                            options={{ preserveScroll: true }}
                            onSuccess={() => setEditing(null)}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-name">Nom</Label>
                                        <Input
                                            id="edit-name"
                                            name="name"
                                            required
                                            defaultValue={editing.name}
                                        />
                                        <InputError message={errors.name} />
                                    </div>
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
                        <DialogTitle>Supprimer la catégorie ?</DialogTitle>
                        <DialogDescription>
                            {toDelete && toDelete.productsCount > 0
                                ? `« ${toDelete.name} » contient ${toDelete.productsCount} produit(s) et ne peut pas être supprimée.`
                                : `« ${toDelete?.name} » sera définitivement supprimée.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setToDelete(null)}
                        >
                            Annuler
                        </Button>
                        {toDelete && toDelete.productsCount === 0 && (
                            <Form
                                {...CategoryController.destroy.form({
                                    category: toDelete.slug,
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

AdminCategories.layout = {
    breadcrumbs: [
        { title: 'Administration', href: dashboard() },
        { title: 'Catégories', href: categories.index() },
    ],
};
