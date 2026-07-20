<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ShopSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the shop catalog with the IvoirCuisson product range.
     */
    public function run(): void
    {
        $barbecues = Category::updateOrCreate(['slug' => 'barbecues'], ['name' => 'Barbecues']);
        $foyers = Category::updateOrCreate(['slug' => 'foyers-a-gaz'], ['name' => 'Foyers à gaz']);
        $fumoirs = Category::updateOrCreate(['slug' => 'fumoirs'], ['name' => 'Fumoirs']);

        $products = [
            [
                'category_id' => $barbecues->id,
                'name' => 'Barbecue Baron',
                'slug' => 'barbecue-baron',
                'description' => 'Barbecue démontable double surface au design minimaliste. Deux grilles de cuisson, acier thermolaqué noir, tablettes latérales rabattables et rangement inférieur pour vos accessoires.',
                'specs' => [
                    'Structure' => 'Acier thermolaqué noir',
                    'Grilles' => 'Double surface de cuisson',
                    'Rangement' => 'Tablettes latérales rabattables + étagère basse',
                    'Usage' => 'Domestique et professionnel',
                ],
                'price' => 250000,
                'image' => '/images/Baron.png',
                'is_featured' => true,
            ],
            [
                'category_id' => $barbecues->id,
                'name' => 'Barbecue Eclipse Box',
                'slug' => 'barbecue-eclipse-box',
                'description' => 'Modèle démontable et compact avec grille supérieure inox perforée. Conçu en acier haute température pour un usage domestique et le camping.',
                'specs' => [
                    'Structure' => 'Acier haute température',
                    'Grille' => 'Supérieure inox perforée',
                    'Format' => 'Démontable, transportable',
                    'Usage' => 'Domestique et camping',
                ],
                'price' => 70000,
                'image' => '/images/1.jpg',
                'is_featured' => false,
            ],
            [
                'category_id' => $barbecues->id,
                'name' => 'Barbecue Explorer Flame Portable',
                'slug' => 'barbecue-explorer-flame-portable',
                'description' => 'Barbecue portable grand format en acier thermolaqué noir, aussi à l\'aise à la maison qu\'en milieu professionnel.',
                'specs' => [
                    'Dimensions' => '1000 L × 620 P × 1100 H mm',
                    'Structure' => 'Acier thermolaqué noir',
                    'Usage' => 'Domestique et professionnel',
                ],
                'price' => 250000,
                'image' => '/images/Explorer flame portable.png',
                'is_featured' => false,
            ],
            [
                'category_id' => $barbecues->id,
                'name' => 'Barbecue Majestic Pro',
                'slug' => 'barbecue-majestic-pro',
                'description' => 'Châssis en tube d\'acier, grilles foyers et tôle laminée. Un équipement haute température taillé pour les usages domestiques comme professionnels.',
                'specs' => [
                    'Structure' => 'Tube acier, tôle laminée',
                    'Grilles' => 'Grilles foyers haute température',
                    'Usage' => 'Domestique et professionnel',
                ],
                'price' => 250000,
                'image' => '/images/Majestic pro.png',
                'is_featured' => true,
            ],
            [
                'category_id' => $barbecues->id,
                'name' => 'Barbecue RoyalGrill',
                'slug' => 'barbecue-royalgrill',
                'description' => 'Barbecue en acier noir avec équipement haute température, pensé pour un usage résidentiel exigeant.',
                'specs' => [
                    'Dimensions' => '1000 L × 620 P × 1100 H mm',
                    'Structure' => 'Acier noir',
                    'Usage' => 'Résidentiel',
                ],
                'price' => 100000,
                'image' => '/images/grilleroyal.jpg',
                'is_featured' => false,
            ],
            [
                'category_id' => $barbecues->id,
                'name' => 'Barbecue Vulkan Square',
                'slug' => 'barbecue-vulkan-square',
                'description' => 'Brasero carré moderne aux lignes angulaires avec plaque perforée. Acier noir satiné, pour un usage domestique et professionnel.',
                'specs' => [
                    'Structure' => 'Acier noir satiné',
                    'Plaque' => 'Perforée, lignes angulaires',
                    'Usage' => 'Domestique et professionnel',
                ],
                'price' => 250000,
                'image' => '/images/vulkan square.png',
                'is_featured' => false,
            ],
            [
                'category_id' => $foyers->id,
                'name' => 'Foyer à gaz Copper Flame',
                'slug' => 'foyer-a-gaz-copper-flame',
                'description' => 'Foyer à gaz avec finition cuivre métallisé, double paroi anti-surchauffe et brûleur central haute intensité.',
                'specs' => [
                    'Finition' => 'Cuivre métallisé',
                    'Sécurité' => 'Double paroi anti-surchauffe',
                    'Brûleur' => 'Central haute intensité',
                ],
                'price' => 70000,
                'image' => '/images/copper-flame.png',
                'is_featured' => true,
            ],
            [
                'category_id' => $foyers->id,
                'name' => 'Foyer à gaz Copper Flame Duo',
                'slug' => 'foyer-a-gaz-copper-flame-duo',
                'description' => 'Support gaz à deux brûleurs. Simple, robuste et stable, en acier noir, pour un usage domestique et professionnel.',
                'specs' => [
                    'Brûleurs' => '2 brûleurs',
                    'Structure' => 'Acier noir',
                    'Usage' => 'Domestique et professionnel',
                ],
                'price' => 140000,
                'image' => '/images/flame duo.jpg',
                'is_featured' => false,
            ],
            [
                'category_id' => $fumoirs->id,
                'name' => 'Fumoir Aurora Smoker',
                'slug' => 'fumoir-aurora-smoker',
                'description' => 'Fumoir vertical compact avec porte vitrée et thermomètre intégré. 4 grilles réglables et bac à copeaux de bois pour viandes, poissons et volailles.',
                'specs' => [
                    'Format' => 'Vertical compact',
                    'Porte' => 'Vitrée avec thermomètre intégré',
                    'Grilles' => '4 grilles réglables',
                    'Accessoires' => 'Bac à copeaux de bois',
                ],
                'price' => 250000,
                'image' => '/images/aurora-smoker.png',
                'is_featured' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(['slug' => $product['slug']], $product);
        }
    }
}
