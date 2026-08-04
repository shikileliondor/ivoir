<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * An admin-provided override for one of the fixed images of the
 * public site (logo, hero, …). Slots without an override fall back
 * to the bundled default file.
 *
 * @property int $id
 * @property string $key
 * @property string $path
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['key', 'path'])]
class SiteImage extends Model
{
    /**
     * The replaceable image slots of the public site. A null default
     * means the page shows its built-in placeholder until the admin
     * uploads an image.
     *
     * @var array<string, array{label: string, description: string, default: string|null}>
     */
    public const SLOTS = [
        'logo' => [
            'label' => 'Logo',
            'description' => 'Affiché dans l\'en-tête, le pied de page et gravé sur le produit 3D. Fond blanc ou transparent recommandé.',
            'default' => '/images/logo sans fond.png',
        ],
        'home_hero' => [
            'label' => 'Visuel d\'accueil',
            'description' => 'Grande image sous le titre de la page d\'accueil.',
            'default' => '/images/1.jpg',
        ],
        'fumoir_fallback' => [
            'label' => 'Photo Fumoir Aurora',
            'description' => 'Affichée à la place de la scène 3D quand WebGL n\'est pas disponible.',
            'default' => '/images/fumoiraz.webp',
        ],
        'about' => [
            'label' => 'Photo À propos',
            'description' => 'Grande image de la page À propos, à côté de « Notre histoire ».',
            'default' => null,
        ],
        'environment_1' => [
            'label' => 'Environnement — grande photo',
            'description' => 'Grande image verticale de la galerie « Sur le terrain » de la page Environnement.',
            'default' => null,
        ],
        'environment_2' => [
            'label' => 'Environnement — photo 2',
            'description' => 'Première petite image de la galerie de la page Environnement.',
            'default' => null,
        ],
        'environment_3' => [
            'label' => 'Environnement — photo 3',
            'description' => 'Seconde petite image de la galerie de la page Environnement.',
            'default' => null,
        ],
    ];

    /**
     * The image URL of every slot: the override when one exists,
     * the bundled default otherwise.
     *
     * @return array<string, string|null>
     */
    public static function urls(): array
    {
        $overrides = static::query()->pluck('path', 'key');

        return collect(static::SLOTS)
            ->map(fn (array $slot, string $key) => $overrides[$key] ?? $slot['default'])
            ->all();
    }
}
