import { Form, Head, Link } from '@inertiajs/react';
import { Flame, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ProductController from '@/actions/App/Http/Controllers/Admin/ProductController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import products from '@/routes/admin/products';
import type { AdminProductForm } from '@/types/admin';

type SpecRow = { key: string; value: string };

export default function AdminProductFormPage({
    categories,
    product,
}: {
    categories: { id: number; name: string }[];
    product: AdminProductForm | null;
}) {
    const [isActive, setIsActive] = useState(product?.isActive ?? true);
    const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
    const [specs, setSpecs] = useState<SpecRow[]>(
        product?.specs
            ? Object.entries(product.specs).map(([key, value]) => ({
                  key,
                  value,
              }))
            : [],
    );
    const [preview, setPreview] = useState<string | null>(
        product?.image ?? null,
    );

    const updateSpec = (index: number, field: keyof SpecRow, value: string) =>
        setSpecs((rows) =>
            rows.map((row, i) =>
                i === index ? { ...row, [field]: value } : row,
            ),
        );

    const formProps = product
        ? ProductController.update.form({ product: product.slug })
        : ProductController.store.form();

    return (
        <>
            <Head
                title={product ? `Modifier ${product.name}` : 'Nouveau produit'}
            />

            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-xl font-semibold">
                    {product
                        ? `Modifier « ${product.name} »`
                        : 'Nouveau produit'}
                </h1>

                <Card>
                    <CardContent>
                        <Form {...formProps} className="space-y-6">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Nom</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                required
                                                defaultValue={
                                                    product?.name ?? ''
                                                }
                                                placeholder="Barbecue Vulkan"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="category_id">
                                                Catégorie
                                            </Label>
                                            <Select
                                                name="category_id"
                                                defaultValue={
                                                    product
                                                        ? String(
                                                              product.categoryId,
                                                          )
                                                        : undefined
                                                }
                                                required
                                            >
                                                <SelectTrigger id="category_id">
                                                    <SelectValue placeholder="Choisir une catégorie" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(
                                                        (category) => (
                                                            <SelectItem
                                                                key={
                                                                    category.id
                                                                }
                                                                value={String(
                                                                    category.id,
                                                                )}
                                                            >
                                                                {category.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.category_id}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            required
                                            rows={5}
                                            defaultValue={
                                                product?.description ?? ''
                                            }
                                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        />
                                        <InputError
                                            message={errors.description}
                                        />
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="price">
                                                Prix de base (FCFA)
                                            </Label>
                                            <Input
                                                id="price"
                                                name="price"
                                                type="number"
                                                min={0}
                                                step={1}
                                                required
                                                defaultValue={
                                                    product?.price ?? ''
                                                }
                                                placeholder="150000"
                                            />
                                            <InputError
                                                message={errors.price}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Les prix promotionnels se gèrent
                                                dans « Tarification ».
                                            </p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="stock">
                                                Stock disponible
                                            </Label>
                                            <Input
                                                id="stock"
                                                name="stock"
                                                type="number"
                                                min={0}
                                                step={1}
                                                defaultValue={
                                                    product?.stock ?? ''
                                                }
                                                placeholder="Laisser vide = illimité"
                                            />
                                            <InputError
                                                message={errors.stock}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Vide = fabriqué à la commande,
                                                toujours disponible. 0 = en
                                                rupture, retiré de la vente.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="image">Image</Label>
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                                                    {preview ? (
                                                        <img
                                                            src={preview}
                                                            alt=""
                                                            className="size-full object-contain"
                                                        />
                                                    ) : (
                                                        <Flame className="size-5 text-muted-foreground" />
                                                    )}
                                                </span>
                                                <Input
                                                    id="image"
                                                    name="image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(event) => {
                                                        const file =
                                                            event.target
                                                                .files?.[0];

                                                        if (file) {
                                                            setPreview(
                                                                URL.createObjectURL(
                                                                    file,
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <InputError
                                                message={errors.image}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-6">
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="hidden"
                                                name="is_active"
                                                value={isActive ? 1 : 0}
                                            />
                                            <Checkbox
                                                checked={isActive}
                                                onCheckedChange={(checked) =>
                                                    setIsActive(
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            Visible sur la boutique
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="hidden"
                                                name="is_featured"
                                                value={isFeatured ? 1 : 0}
                                            />
                                            <Checkbox
                                                checked={isFeatured}
                                                onCheckedChange={(checked) =>
                                                    setIsFeatured(
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            Produit vedette (page d'accueil)
                                        </label>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>
                                                Caractéristiques techniques
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setSpecs((rows) => [
                                                        ...rows,
                                                        { key: '', value: '' },
                                                    ])
                                                }
                                            >
                                                <Plus /> Ajouter
                                            </Button>
                                        </div>
                                        {specs.map((row, index) => (
                                            <div
                                                key={index}
                                                className="flex gap-2"
                                            >
                                                <Input
                                                    name={`specs[${index}][key]`}
                                                    value={row.key}
                                                    onChange={(event) =>
                                                        updateSpec(
                                                            index,
                                                            'key',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Dimensions"
                                                    className="max-w-56"
                                                />
                                                <Input
                                                    name={`specs[${index}][value]`}
                                                    value={row.value}
                                                    onChange={(event) =>
                                                        updateSpec(
                                                            index,
                                                            'value',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="120 × 60 × 90 cm"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Retirer la caractéristique"
                                                    onClick={() =>
                                                        setSpecs((rows) =>
                                                            rows.filter(
                                                                (_, i) =>
                                                                    i !== index,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </div>
                                        ))}
                                        {Object.entries(errors)
                                            .filter(([key]) =>
                                                key.startsWith('specs'),
                                            )
                                            .map(([key, message]) => (
                                                <InputError
                                                    key={key}
                                                    message={message}
                                                />
                                            ))}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button disabled={processing}>
                                            {product
                                                ? 'Enregistrer'
                                                : 'Créer le produit'}
                                        </Button>
                                        <Button asChild variant="outline">
                                            <Link href={products.index()}>
                                                Annuler
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminProductFormPage.layout = {
    breadcrumbs: [
        { title: 'Administration', href: dashboard() },
        { title: 'Produits', href: products.index() },
    ],
};
