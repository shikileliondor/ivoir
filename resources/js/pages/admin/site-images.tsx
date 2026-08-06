import { Form, Head } from '@inertiajs/react';
import { ImageOff, RotateCcw, Upload } from 'lucide-react';
import SiteImageController from '@/actions/App/Http/Controllers/Admin/SiteImageController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes/admin';
import siteImages from '@/routes/admin/site-images';

type Slot = {
    key: string;
    label: string;
    description: string;
    url: string | null;
    isCustom: boolean;
    hasDefault: boolean;
};

export default function AdminSiteImages({ slots }: { slots: Slot[] }) {
    return (
        <>
            <Head title="Images du site" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Images du site
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Remplacez les visuels fixes du site (logo, image
                            d'accueil…). Les images des produits se gèrent dans
                            « Produits ».
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {slots.map((slot) => (
                        <Card key={slot.key}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between gap-2">
                                    {slot.label}
                                    {slot.isCustom ? (
                                        <Badge variant="ember">
                                            Personnalisée
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            Par défaut
                                        </Badge>
                                    )}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {slot.description}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border bg-muted p-2">
                                    {slot.url ? (
                                        <img
                                            src={slot.url}
                                            alt={slot.label}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    ) : (
                                        <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                                            <ImageOff className="size-6 opacity-40" />
                                            Aucune image pour l'instant
                                        </span>
                                    )}
                                </div>

                                <Form
                                    {...SiteImageController.update.form({
                                        key: slot.key,
                                    })}
                                    options={{ preserveScroll: true }}
                                    className="space-y-2"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="flex gap-2">
                                                <Input
                                                    name="image"
                                                    type="file"
                                                    accept="image/*"
                                                    required
                                                    aria-label={`Nouvelle image pour ${slot.label}`}
                                                />
                                                <Button
                                                    disabled={processing}
                                                    size="icon"
                                                    aria-label={`Remplacer ${slot.label}`}
                                                >
                                                    <Upload />
                                                </Button>
                                            </div>
                                            <InputError
                                                message={errors.image}
                                            />
                                        </>
                                    )}
                                </Form>

                                {slot.isCustom && (
                                    <Form
                                        {...SiteImageController.destroy.form({
                                            key: slot.key,
                                        })}
                                        options={{ preserveScroll: true }}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={processing}
                                            >
                                                <RotateCcw />{' '}
                                                {slot.hasDefault
                                                    ? "Revenir à l'image d'origine"
                                                    : "Retirer l'image"}
                                            </Button>
                                        )}
                                    </Form>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

AdminSiteImages.layout = {
    breadcrumbs: [
        { title: 'Administration', href: dashboard() },
        { title: 'Images du site', href: siteImages.index() },
    ],
};
