# Docker — IvoirCuisson

## Plan de ports du poste

Plusieurs projets tournent en parallèle sur la même machine. Ivoir s'est vu
réserver une plage libre pour ne jamais entrer en conflit :

| Projet         | HTTP  | Vite | MySQL | Redis | phpMyAdmin |
| -------------- | ----- | ---- | ----- | ----- | ---------- |
| dymora_app     | 8000  | 5173 | 3306  | —     | —          |
| dym_location   | 8080  | 5173 | 3306  | 6379  | 8081       |
| lokea          | 8082  | 5174 | 3307  | 6380  | —          |
| appel_fonds    | 8083  | 5176 | 3309  | 6382  | 8093       |
| vilora         | 8084  | 5178 | 3311  | 6383  | 8085       |
| grh_v1         | 8090  | 5175 | 3308  | 6381  | 8091       |
| **ivoir**      | **8086** | **5177** | **3310** | **6384** | **8087** |

Ces valeurs vivent dans `.env` (`APP_PORT`, `VITE_PORT`, `FORWARD_DB_PORT`,
`FORWARD_REDIS_PORT`, `FORWARD_PHPMYADMIN_PORT`) — les changer suffit, aucun
port n'est écrit en dur dans les fichiers compose.

## Développement

```bash
cp .env.example .env          # si absent
docker compose up -d --build
docker compose exec laravel.test php artisan key:generate
docker compose exec laravel.test php artisan migrate --seed
docker compose exec laravel.test php artisan storage:link
docker compose exec laravel.test npm install
docker compose exec laravel.test npm run dev
```

- Application : <http://localhost:8086>
- phpMyAdmin : <http://localhost:8087> (serveur `mysql`, user `sail` / `password`)
- MySQL depuis l'host : `127.0.0.1:3310`
- Redis depuis l'host : `127.0.0.1:6384`

Le service `laravel.test` est l'image Laravel Sail (`sail-8.4/app`) : le projet
est monté en volume, tout est rechargé à chaud. `LARAVEL_SAIL=1` fait basculer
`laravel-vite-plugin` en mode conteneur (écoute sur `0.0.0.0`, HMR sur
`localhost:5177`).

## Production

Pour tester l'image de prod **en local** (build sur place) :

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec app php artisan migrate --force
```

Sur le VPS, on ne build jamais — on tire l'image publiée par la CI :

```bash
docker compose -f docker-compose.prod.yml pull app
docker compose -f docker-compose.prod.yml up -d
```

L'image est autoportante : nginx + php-fpm dans le même conteneur, dépendances
Composer sans dev, et assets Vite déjà buildés.

Le stack prod réutilise le port 8086 : arrêter d'abord le stack de dev
(`docker compose down`), ou définir `APP_PROD_PORT` sur un autre port libre.

Le build front se fait **dans l'image**, sur une base PHP et non Node : le
plugin Wayfinder appelle `php artisan wayfinder:generate` pendant `vite build`,
donc le front ne peut pas se compiler sans PHP ni `vendor/`. L'étape de build
utilise un `.env` jetable (copie de `.env.example`) pour permettre à artisan de
démarrer ; le vrai `.env` est monté en lecture seule au runtime.

Les caches Laravel (`artisan optimize`) sont construits au **démarrage** du
conteneur, pas au build, puisque le `.env` réel n'existe qu'à ce moment-là.

Trois services partagent la même image :

- `app` — nginx + php-fpm, exposé sur `${APP_PROD_PORT:-8086}`
- `queue` — `queue:work`
- `scheduler` — `schedule:run` toutes les 60 s

## Déploiement VPS (GitHub Actions)

`.github/workflows/deploy.yml` se déclenche sur push `master` ou manuellement
(`workflow_dispatch`). Les pushes qui ne touchent que `prompts/`, `.claude/`,
`.cursor/` ou des `.md` sont ignorés.

Le workflow a deux jobs. `build` construit l'image et la publie sur
`ghcr.io/shikileliondor/ivoir-app` (tags `:latest` et `:<sha>`). `deploy` se
connecte en SSH et enchaîne `git pull` → `pull app` → `up -d` → attente que le
conteneur soit `healthy` → `migrate --force` → `docker image prune`.

**Le VPS ne compile rien** : il n'a que ~2,7 Gi de marge mémoire et héberge déjà
lokea et dymora_app en production. Un build de Vite sur place risquerait de faire
tuer *leurs* conteneurs par l'OOM killer. Voir `docs/DEPLOIEMENT_VPS.md`.

### Secrets GitHub requis

| Secret        | Contenu                                     |
| ------------- | ------------------------------------------- |
| `VPS_HOST`    | IP ou domaine du serveur                    |
| `VPS_USER`    | utilisateur SSH                             |
| `VPS_SSH_KEY` | clé privée ed25519 autorisée sur le serveur |

Rien à créer pour GHCR : le workflow utilise le `GITHUB_TOKEN` fourni
automatiquement (`permissions: packages: write`). Il sert aussi à authentifier le
VPS le temps du `pull`, transmis par stdin puis révoqué par un `docker logout`.

### Préparation du VPS (une seule fois)

```bash
sudo mkdir -p /var/www/ivoir
sudo chown "$USER" /var/www/ivoir
git clone https://github.com/shikileliondor/ivoir.git /var/www/ivoir
cd /var/www/ivoir
cp .env.example .env
```

Puis éditer `.env` — il n'est pas versionné, il survit donc aux
`git reset --hard` du déploiement :

- `APP_ENV=production`, `APP_DEBUG=false`
- `APP_KEY=` → généré depuis la machine de dev : `docker compose exec laravel.test php artisan key:generate --show`
- `APP_URL` = l'URL publique réelle
- `DB_PASSWORD` — un vrai mot de passe, pas `password`
- `APP_PROD_PORT` si le 8086 n'est pas le bon port derrière le reverse proxy
- `MAIL_MAILER` autre que `log`, sinon aucun mail ne part

Premier démarrage — lancer d'abord le workflow une fois pour publier l'image,
puis il n'y a plus rien à faire à la main. En manuel :

```bash
docker compose -f docker-compose.prod.yml pull app
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec -T --user www-data app php artisan migrate --force
```

### Commandes artisan en production

Toujours `--user www-data`, sinon les fichiers créés appartiennent à root et
PHP-FPM ne peut plus écrire dans `storage/`. Et toujours `-T` en SSH ou en CI,
sans TTY la commande reste bloquée :

```bash
docker compose -f docker-compose.prod.yml exec -T --user www-data app php artisan ...
```

Après toute modification du `.env` sur le VPS, redémarrer le conteneur
(`docker compose -f docker-compose.prod.yml restart app`) : `start.sh` relance
`artisan optimize` et reconstruit les caches avec la nouvelle config.

## Fichiers

```
docker/app/Dockerfile    image de production (build multi-étapes)
docker/app/nginx.conf    vhost : root public/, cache long sur /build/
docker/app/php.ini       upload 200M, memory 512M, OPcache figé
docker/app/start.sh      permissions, storage:link, optimize, php-fpm + nginx
```

`storage:link` crée **deux** liens (voir `config/filesystems.php`) :
`public/storage → storage/app/public` et `public/images → storage/images`.
