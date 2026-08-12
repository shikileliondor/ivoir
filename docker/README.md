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

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec app php artisan migrate --force
```

L'image `ivoir-app` est autoportante : nginx + php-fpm dans le même conteneur,
dépendances Composer sans dev, et assets Vite déjà buildés.

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

## Fichiers

```
docker/app/Dockerfile    image de production (build multi-étapes)
docker/app/nginx.conf    vhost : root public/, cache long sur /build/
docker/app/php.ini       upload 200M, memory 512M, OPcache figé
docker/app/start.sh      permissions, storage:link, optimize, php-fpm + nginx
```

`storage:link` crée **deux** liens (voir `config/filesystems.php`) :
`public/storage → storage/app/public` et `public/images → storage/images`.
