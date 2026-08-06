import { Form, Head, Link } from '@inertiajs/react';
import { Flame, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ProductController from '@/actions/App/Http/Controllers/Admin/ProductController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {product
                                ? `Modifier « ${product.name} »`
                                : 'Nouveau produit'}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {product
                                ? 'Mettez à jour les informations de ce produit.'
                                : 'Ajoutez un nouveau produit au catalogue de la boutique.'}
                        </p>
                    </div>
                </div>

                <Form {...formProps} className="flex flex-col gap-6">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid items-start gap-6 lg:grid-cols-3">
                                <div className="flex flex-col gap-6 lg:col-span-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Informations générales
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="name">
                                                        Nom
                                                    </Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        required
                                                        defaultValue={
                                                            product?.name ?? ''
                                                        }
                                                        placeholder="Barbecue Vulkan"
                                                    />
                                                    <InputError
                                                        message={errors.name}
                                                    />
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
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError
                                                        message={
                                                            errors.category_id
                                                        }
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
                                                        product?.description ??
                                                        ''
                                                    }
                                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                />
                                                <InputError
                                                    message={errors.description}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Prix et stock</CardTitle>
                                        </CardHeader>
                                        <CardContent>
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
                                                        Les prix promotionnels
                                                        se gèrent dans «
                                                        Tarification ».
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
                                                            product?.stock ??
                                                            ''
                                                        }
                                                        placeholder="Laisser vide = illimité"
                                                    />
                                                    <InputError
                                                        message={errors.stock}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Vide = fabriqué à la
                                                        commande, toujours
                                                        disponible. 0 = en
                                                        rupture, retiré de la
                                                        vente.
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex-row items-center justify-between">
                                            <CardTitle>
                                                Caractéristiques techniques
                                            </CardTitle>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setSpecs((rows) => [
                                                        ...rows,
                                                        {
                                                            key: '',
                                                            value: '',
                                                        },
                                                    ])
                                                }
                                            >
                                                <Plus /> Ajouter
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {specs.length === 0 && (
                                                <p className="text-sm text-muted-foreground">
                                                    Aucune caractéristique pour
                                                    le moment.
                                                </p>
                                            )}
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
                                                                event.target
                                                                    .value,
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
                                                                event.target
                                                                    .value,
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
                                                                        i !==
                                                                        index,
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
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Image</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
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
                                                        aria-label="Image du produit"
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
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Visibilité</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col gap-3">
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="hidden"
                                                        name="is_active"
                                                        value={isActive ? 1 : 0}
                                                    />
                                                    <Checkbox
                                                        checked={isActive}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            setIsActive(
                                                                checked ===
                                                                    true,
                                                            )
                                                        }
                                                    />
                                                    Visible sur la boutique
                                                </label>
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="hidden"
                                                        name="is_featured"
                                                        value={
                                                            isFeatured ? 1 : 0
                                                        }
                                                    />
                                                    <Checkbox
                                                        checked={isFeatured}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            setIsFeatured(
                                                                checked ===
                                                                    true,
                                                            )
                                                        }
                                                    />
                                                    Produit vedette (page
                                                    d'accueil)
                                                </label>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
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
