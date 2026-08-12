# IvoirCuisson — Guide projet

Boutique en ligne de matériel de cuisson (fumoirs, foyers) pour la Côte d'Ivoire.
Laravel 13 + Inertia v3 + React 19, rendu côté serveur des props, pas d'API REST.

## Stack

| Couche    | Choix                                                                  |
| --------- | ---------------------------------------------------------------------- |
| Backend   | Laravel 13, PHP 8.4 (composer autorise `^8.3`)                          |
| Front     | React 19 + Inertia v3, Vite 8, Tailwind 4, shadcn/ui (Radix)            |
| Auth      | Fortify (+ passkeys, 2FA TOTP, vérification email)                      |
| Routage   | Wayfinder — fonctions typées générées dans `resources/js/{actions,routes}` |
| 3D        | three.js via `@react-three/fiber` + `drei`                              |
| Tests     | Pest 4                                                                  |
| Qualité   | Pint (preset `laravel`), Larastan **niveau 7**                           |

## Commandes

```bash
composer dev          # artisan dev — serve + queue:listen + pail + vite en parallèle
composer test         # config:clear + pint --test + phpstan + artisan test
composer lint         # pint --parallel
composer types:check  # phpstan analyse (niveau 7)
npm run types:check   # tsc --noEmit
```

Sous Docker, préfixer par `docker compose exec laravel.test`. Mais **pas `composer dev`** : son `artisan serve` ferait doublon avec le nginx du conteneur. En conteneur, lancer seulement `npm run dev` (`laravel-vite-plugin` bascule tout seul en mode conteneur grâce à `LARAVEL_SAIL=1`).

## Docker — plage de ports réservée

Plusieurs projets tournent en parallèle sur le poste. Ivoir a la plage **8086 / 5177 / 3310 / 6384 / 8087** ; le détail des ports déjà pris par les autres projets et les procédures dev/prod sont dans [docker/README.md](docker/README.md).

Avant d'ajouter un service Docker : lister les conteneurs **y compris arrêtés** (`docker ps -a`), pas seulement ceux qui tournent — un projet à l'arrêt réclamera son port au prochain démarrage.

Tous les ports viennent de `.env` (`APP_PORT`, `VITE_PORT`, `FORWARD_DB_PORT`, `FORWARD_REDIS_PORT`, `FORWARD_PHPMYADMIN_PORT`). Ne jamais écrire un port en dur dans un fichier compose.

## CI/CD et production

Un seul workflow : `.github/workflows/deploy.yml`, sur push `master` ou `workflow_dispatch`. Il n'y a **plus de workflow de lint ni de tests** — `composer test` en local est le seul garde-fou.

- **Le VPS ne compile rien.** Le runner GitHub build l'image et la publie sur `ghcr.io/shikileliondor/ivoir-app` (tags `:latest` et `:<sha>`) ; le VPS fait `git pull` → `pull app` → `up -d` → attente `healthy` → `migrate --force` → `prune`. Le VPS n'a que ~2,7 Gi de marge et héberge lokea et dymora_app : un build de Vite sur place pourrait faire tuer *leurs* conteneurs par l'OOM killer.
- Rollback sans rebuild : `IVOIR_IMAGE=ghcr.io/shikileliondor/ivoir-app:<sha> docker compose -f docker-compose.prod.yml up -d`.
- Sur le VPS, toujours `docker-compose.prod.yml`, jamais `docker-compose.yml`.
- Toute commande artisan en prod : `exec -T --user www-data app`. Sans `--user www-data` les fichiers appartiennent à root et PHP-FPM ne peut plus écrire dans `storage/` ; sans `-T` la commande bloque faute de TTY.
- Ne pas ajouter de `config:cache`/`route:cache`/`view:cache` au déploiement : `start.sh` lance déjà `artisan optimize` à chaque démarrage, une fois le vrai `.env` monté.
- La branche est `master` — dans le trigger comme dans le `git pull`. Les deux doivent rester cohérentes.

Détail complet (secrets, bootstrap du VPS) : [docker/README.md](docker/README.md).

## Trois espaces de routage

`routes/web.php` définit trois zones, dans cet ordre :

1. **Boutique publique** — aucune auth. `/`, `produits`, `commande`, pages légales.
2. **`/admin`** — `['auth', 'verified', EnsureUserIsAdmin::class]`, préfixe de nom `admin.`. Back-office : produits, catégories, commandes, images du site, communication, tarification.
3. **`/{current_team}`** — `['auth', 'verified', EnsureTeamMembership::class]`. Espace par équipe.

### URI en français, nom de route en anglais

Convention systématique — la respecter :

```php
Route::get('produits/{product}', [ProductController::class, 'show'])->name('products.show');
Route::get('tarification', [AdminPricePeriodController::class, 'index'])->name('admin.pricing.index');
```

L'URL est visible par le client ivoirien, le nom de route est du code. Ne jamais franciser un nom de route ni angliciser une URI.

### Routes d'équipe et `current_team`

`SetTeamUrlDefaults` pose `URL::defaults(['current_team' => …, 'team' => …])` à partir de `$user->currentTeam`. Les routes préfixées `{current_team}` se génèrent donc **sans passer le slug**.

Conséquence : un utilisateur sans équipe ne peut pas générer ces URLs. C'est pourquoi `bootstrap/app.php` surcharge `redirectUsersTo()` — le défaut du framework (`route('dashboard')`) planterait. Toute nouvelle redirection post-auth doit gérer le cas « compte sans équipe ».

## Backend

### Modèles — attribut `#[Fillable]`, pas de propriété

Laravel 13 :

```php
#[Fillable(['category_id', 'name', 'slug', 'price', 'stock', 'is_active'])]
class Product extends Model
```

Pas de `protected $fillable`. Les casts restent dans `protected function casts(): array`.

### Mise en forme pour le front — méthode statique sur le contrôleur

Pas d'API Resources. Chaque contrôleur qui expose un modèle au front fournit une méthode statique de mise en forme, réutilisée par les autres contrôleurs :

```php
// Shop\ProductController
public static function toProductArray(Collection $products): array
```

Ajouter un champ produit côté React ⇒ le déclarer là, une seule fois.

### Prix et périodes promo

`Product::currentPrice()` renvoie le prix effectif ; `activePricePeriod` (relation `HasOne`) porte la promo en cours. Le front reçoit `price` (effectif), `originalPrice` (non nul seulement si une promo court), `promoLabel`, `promoEndsAt`. Ne jamais lire `$product->price` directement pour un affichage.

### Stock — `null` signifie « sur commande »

`stock` nullable : `tracksStock()` distingue un produit suivi d'un produit fabriqué à la demande. `hasStockFor(int $quantity = 1)` est la seule bonne façon de tester la disponibilité.

### Enums

`OrderStatus` (`pending`, `confirmed`, `paid`, `delivered`, `cancelled`), `TeamRole`, `TeamPermission`. Statuts jamais en chaîne brute côté PHP.

### Actions

Logique métier à effet de bord dans `app/Actions/{Domaine}/` : `Shop\CreateOrder`, `Shop\RestoreOrderStock`, `Teams\CreateTeam`, `Fortify\CreateNewUser`. Un contrôleur ne décrémente pas le stock lui-même.

### Statistiques — ne jamais casser la réponse

`TrackShopVisit` enregistre les vues dans `visits` en avalant tout `Throwable` :

```php
try { Visit::create([...]); } catch (Throwable) { /* les stats ne font pas tomber la boutique */ }
```

Garder ce contrat pour tout nouveau tracking.

### Planification

`routes/console.php` : purge quotidienne des invitations d'équipe expirées. En prod, c'est le service `scheduler` du compose qui la déclenche.

## Frontend

### Pages Inertia

La chaîne passée à `Inertia::render()` est le chemin sous `resources/js/pages/`, en kebab-case :

```php
Inertia::render('shop/products/show', [...])   // → resources/js/pages/shop/products/show.tsx
```

Découpage : `pages/shop/` (boutique), `pages/admin/` (back-office), `pages/auth/`, `pages/settings/`, `pages/teams/`.

### Layouts

`public-layout` (boutique), `admin-layout` (back-office), `app-layout` (espace connecté), `auth-layout`, `settings/layout`.

### Props partagées

Fournies par `HandleInertiaRequests::share()` — disponibles partout, ne pas les repasser page par page :

`name`, `auth.user`, `sidebarOpen`, `flash.success`, `siteImages`, `currentTeam`, `teams`.

Les quatre dernières sont des closures : évaluées à la demande, donc gratuites pour les requêtes partielles qui ne les demandent pas. Garder ce lazy.

### Wayfinder — jamais d'URL en dur

Importer depuis `@/routes` ou `@/actions`. Ces dossiers sont **générés** (et gitignorés) : ne rien y éditer à la main, ils sont régénérés par `vite build` et par `php artisan wayfinder:generate`.

### Images du site

`SiteImage::SLOTS` déclare les emplacements remplaçables par l'admin (logo, visuel d'accueil, photo À propos…), avec un `default` nullable. `SiteImage::urls()` est partagé via Inertia sous `siteImages`. Ajouter un emplacement ⇒ ajouter une entrée à `SLOTS`, rien d'autre.

## Storage — deux liens symboliques

`config/filesystems.php` déclare **deux** liens, pas un :

```php
public_path('storage') => storage_path('app/public'),
public_path('images')  => storage_path('images'),
```

`php artisan storage:link` crée les deux. Utiliser `--force` dans tout script automatisé : sans lui la commande sort en erreur dès qu'un seul des deux existe déjà.

`storage/images/com` (rushes caméra bruts, ~20 Go) est exclu de git **et** du contexte de build Docker.

## Tests

Pest, organisés par domaine sous `tests/Feature/{Admin,Auth,Settings,Shop,Teams}/`. `composer test` enchaîne Pint, PHPStan puis les tests — c'est cette commande qui fait foi, pas `artisan test` seul.

## Activation des skills

- `laravel-best-practices` — tout code PHP backend
- `inertia-react-development` — pages, formulaires, navigation React
- `wayfinder-development` — dès que le front appelle une route backend
- `fortify-development` — authentification, 2FA, passkeys
- `tailwindcss-development` — mise en forme
