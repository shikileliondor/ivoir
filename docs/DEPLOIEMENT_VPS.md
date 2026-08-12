# Déploiement IvoirCuisson sur VPS

> **Statut** : ⏳ Pas encore déployé
> **Serveur** : le VPS Contabo qui héberge déjà lokea, Odoo et Renkya (`156.67.28.90`)
> **Adresse** : un vrai domaine (+ HTTPS via Certbot)
> **Stack** : Laravel 13 + Inertia/React + MySQL + Redis
> **Méthode** : Docker Compose sur VPS, image autoportante (nginx + php-fpm)
> **Déclenchement** : manuel — `Actions → Deploy to VPS → Run workflow` (voir étape 8)
> **Référence** : `docs/DEPLOIEMENT_VPS.md` du projet lokea (même poste, même VPS) —
> les problèmes qui y sont recensés ont été rejoués un par un ici, voir la
> section « Pièges connus » en fin de document.

---

## Vue d'ensemble

|                | Local (Sail)         | Production (VPS)                      |
| -------------- | -------------------- | ------------------------------------- |
| Compose        | `docker-compose.yml` | `docker-compose.prod.yml`             |
| Port           | 8086                 | à choisir, derrière le Nginx hôte     |
| Assets Vite    | serveur de dev       | buildés **dans l'image**              |
| Serveur web    | Sail                 | nginx + php-fpm dans le conteneur `app` |
| Queue          | —                    | conteneur `queue` dédié               |
| Scheduler      | —                    | conteneur `scheduler` dédié           |
| `.env`         | `.env` local         | `.env` du VPS, monté en lecture seule |

Une fois tout en place, la mise à jour est automatique : un push sur la branche
suivie déclenche `.github/workflows/deploy.yml`.

---

## Prérequis

- Accès SSH au VPS
- Le dépôt `shikileliondor/ivoir` accessible depuis le VPS
- Un port libre sur le VPS (le 80 est déjà pris par le Nginx hôte)
- Un `server_name` distinct de ceux des autres projets du VPS

---

## Étape 1 — Docker sur le VPS

> Sur ce VPS, lokea a déjà installé Docker (29.6.2) et Compose (v5.3.1) en
> juillet. L'étape se réduit normalement à une vérification.

```bash
docker --version
docker compose version
```

Les deux répondent → passer à l'étape 2. Sinon, méthode officielle Ubuntu
(ne **pas** utiliser `snap install docker` ni `apt install docker.io`) :

```bash
apt-get update
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable docker
systemctl start docker
```

---

## Étape 2 — Swap (à faire AVANT le premier build)

**Obligatoire.** Le build Vite d'Ivoir transforme ~2 950 modules (React 19,
three.js, Tailwind 4) et produit un chunk de 884 ko. Sans swap, l'OOM killer tue
`npm run build` sans message d'erreur exploitable — le build s'arrête, point.

```bash
free -h                      # vérifier s'il y a déjà du swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h                      # confirmer les 2 Go
```

Lokea a déjà ajouté 2 Go de swap sur ce VPS, et le swap est global à la machine :
l'étape est donc probablement déjà faite. **Mais 2 Go partagés entre lokea, Odoo,
Renkya et le build d'Ivoir, c'est juste.** Si `free -h` montre le swap déjà bien
entamé au repos, passer à 4 Go avant de builder :

```bash
swapoff /swapfile
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

Autre garde-fou possible pendant le build : arrêter temporairement les conteneurs
non critiques pour libérer de la RAM.

---

## Étape 3 — Cloner le dépôt

Clé SSH dédiée + Deploy Key GitHub en lecture seule :

```bash
ssh-keygen -t ed25519 -C "ivoir-vps-deploy" -f /root/.ssh/ivoir_deploy -N ""
cat /root/.ssh/ivoir_deploy.pub
```

Coller cette clé publique dans **Settings → Deploy keys → Add deploy key** du
dépôt `shikileliondor/ivoir`. Titre `VPS`, **sans** cocher « Allow write access ».

```bash
cat >> /root/.ssh/config << 'EOF'

Host github-ivoir
    HostName github.com
    User git
    IdentityFile /root/.ssh/ivoir_deploy
EOF

ssh -T github-ivoir          # doit répondre "Hi shikileliondor/ivoir!"

mkdir -p /var/www
git clone git@github-ivoir:shikileliondor/ivoir.git /var/www/ivoir
```

---

## Étape 4 — Le `.env` de production

Ne **jamais** faire un simple `cp .env.example .env` : les valeurs sensibles se
saisissent à la main.

```bash
cd /var/www/ivoir
cp .env.example .env
nano .env
```

Valeurs à changer impérativement :

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=http://<domaine-ou-hostname>
LOG_LEVEL=error

# Port publié par le conteneur app, consommé par le reverse proxy
APP_PROD_PORT=8086

# Un vrai mot de passe, jamais "password"
DB_DATABASE=cuisson
DB_USERNAME=ivoir
DB_PASSWORD=<mot_de_passe_fort>

# Sinon aucun mail ne part : ni confirmation de commande, ni message de contact
MAIL_MAILER=smtp
MAIL_HOST=...
MAIL_PORT=...
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_FROM_ADDRESS=contact@...
SHOP_NOTIFICATION_EMAIL=ivoircuisson@dym.ci
```

Générer la clé applicative :

```bash
docker compose -f docker-compose.prod.yml run --rm app php artisan key:generate --show
```

Copier la valeur `base64:...` dans `APP_KEY=`.

> **Contrairement à lokea, garder `SESSION_DRIVER=database`, `QUEUE_CONNECTION=database`
> et `CACHE_STORE=database` fonctionne ici.** Lokea a dû basculer sur redis parce que
> ses tables `cache`/`jobs` n'existaient pas. Ivoir a bien les migrations
> `create_cache_table`, `create_jobs_table` et la table `sessions` — donc pas de 500.
> Passer sur redis reste préférable en production (le conteneur est déjà là) :
> `SESSION_DRIVER=redis`, `QUEUE_CONNECTION=redis`, `CACHE_STORE=redis`.

Le `.env` n'est pas versionné : il survit aux `git reset --hard` du déploiement.

---

## Étape 5 — Choisir un port libre sur le VPS

Le VPS héberge déjà d'autres projets. Vérifier avant de fixer `APP_PROD_PORT` :

```bash
ss -tlnp | sort -t: -k2 -n
docker ps --format '{{.Names}}\t{{.Ports}}'
```

Lokea occupe `8080`. Prendre un port libre (8086 par défaut dans
`docker-compose.prod.yml`) et le reporter dans `.env`.

---

## Étape 6 — Reverse proxy Nginx (hôte)

```bash
cat > /etc/nginx/sites-available/ivoir << 'ENDOFCONF'
server {
    listen 80;
    server_name <domaine-ou-hostname>;

    client_max_body_size 210M;

    location / {
        proxy_pass http://127.0.0.1:8086;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
}
ENDOFCONF
```

> **`proxy_buffer_size` / `proxy_buffers` ne sont pas optionnels.** Sans eux le
> Nginx hôte renvoie `upstream sent too big header` → 502, parce que les en-têtes
> Laravel (cookies de session, Inertia) dépassent le buffer par défaut. Lokea s'est
> fait piéger deux fois là-dessus.

> `client_max_body_size 210M` doit rester cohérent avec le `post_max_size` de
> `docker/app/php.ini`, sinon les uploads d'images produit sont coupés par le proxy
> avant même d'atteindre PHP.

Vérifier qu'aucun autre site ne revendique le même `server_name` — c'est le
problème n° 9 de lokea :

```bash
grep -rn "server_name" /etc/nginx/sites-enabled/
```

Activer :

```bash
ln -s /etc/nginx/sites-available/ivoir /etc/nginx/sites-enabled/ivoir
nginx -t
systemctl reload nginx
```

---

## Étape 7 — Premier lancement

```bash
cd /var/www/ivoir
docker compose -f docker-compose.prod.yml up -d --build
```

Le build prend plusieurs minutes : composer, `npm ci`, puis Vite. Suivre :

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app
```

Attendre que `app` soit `healthy`, puis migrer :

```bash
docker compose -f docker-compose.prod.yml exec -T --user www-data app php artisan migrate --force
```

Données initiales (catalogue de démo — à ne lancer que si le catalogue doit être
pré-rempli) :

```bash
docker compose -f docker-compose.prod.yml exec -T --user www-data app php artisan db:seed --force
```

Créer un compte administrateur (`is_admin`) via tinker :

```bash
docker compose -f docker-compose.prod.yml exec -T --user www-data app php artisan tinker
```

> Pas besoin de lancer `storage:link` ni `config:cache` à la main : `start.sh` le
> fait à chaque démarrage du conteneur.

---

## Étape 8 — Activer le déploiement automatique

Secrets à créer dans **Settings → Secrets and variables → Actions** du dépôt :

| Secret        | Contenu                                              |
| ------------- | ---------------------------------------------------- |
| `VPS_HOST`    | IP ou domaine du VPS                                 |
| `VPS_USER`    | utilisateur SSH (`root` si c'est celui du clone)     |
| `VPS_SSH_KEY` | clé privée **autorisée sur le VPS** (pas la deploy key GitHub) |

⚠️ `VPS_SSH_KEY` est la clé qui permet à GitHub d'entrer sur le VPS. C'est une
clé différente de `ivoir_deploy` (qui, elle, permet au VPS d'entrer sur GitHub).
Générer la paire en local, mettre la publique dans `~/.ssh/authorized_keys` du
VPS et la privée dans le secret.

### Déclenchement : manuel, par choix

Le dépôt est sur `master` et le trigger `push` du workflow écoute `main` : **aucun
push ne déclenchera de déploiement**. C'est volontaire — le déploiement se lance
à la main, ce qui garde la mise en production sous contrôle :

**Actions → Deploy to VPS → Run workflow**

`workflow_dispatch` ignore le filtre de branches, donc le déploiement part bien
quelle que soit la branche courante. Le VPS, lui, fait toujours
`git pull origin master` — c'est cette branche qui est déployée, pas celle depuis
laquelle on clique.

Le jour où le déploiement automatique est souhaité, il suffira d'aligner le
trigger sur `master` (une ligne) — ou de renommer la branche et d'adapter le
`git pull` du workflow.

---

## Pièges connus (rejoués depuis lokea)

| # | Problème lokea                                        | Statut sur Ivoir                                                |
| - | ----------------------------------------------------- | --------------------------------------------------------------- |
| 1 | `php-fpm -D` incompatible avec l'image Docker         | ✅ Neutralisé — `start.sh` fait `php-fpm &` + `exec nginx`        |
| 2 | Permissions `storage/` perdues après restart          | ✅ Neutralisé — `chown` au démarrage + convention `--user www-data` |
| 3 | `ViteManifestNotFoundException`                        | ✅ Neutralisé — le Dockerfile compile le front dans l'image       |
| 4 | OOM killer tue le build Vite                           | ⚠️ **Ouvert** — swap obligatoire, étape 2                        |
| 5 | `upstream sent too big header` (nginx → php-fpm)       | ✅ Neutralisé — `fastcgi_buffers` dans `docker/app/nginx.conf`    |
| 6 | `upstream sent too big header` (hôte → conteneur)      | ⚠️ **Ouvert** — `proxy_buffers` à mettre, étape 6                |
| 7 | Symlink `sites-enabled` supprimé → 404                 | ⚠️ Opérationnel — recréer le lien, `nginx -t && reload`          |
| 9 | Conflit `server_name` entre projets du VPS             | ⚠️ **Ouvert** — vérifier à l'étape 6                             |
| 10| `.env` bakéen dans l'image                             | ✅ Neutralisé — monté en volume `:ro`, et supprimé après le build |
| 11| Drivers `database` → 500 (tables absentes)             | ✅ Sans objet — Ivoir a les migrations `cache`/`jobs`/`sessions`  |
| 12| `storage:link` — permission denied en `www-data`       | ✅ Neutralisé — `start.sh` le fait en root, avec `--force`        |

Trois pièges spécifiques à Ivoir, trouvés en validant l'image :

| Problème                                                                 | Correctif en place                                          |
| ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `storage:link` sort en erreur si **un seul** des deux liens existe (Ivoir en déclare deux) | `--force` dans `start.sh`                                    |
| `optimize:clear` appelle `cache:clear` → `DELETE` sur la table `cache` : crashloop tant que la base n'est pas migrée | seul `optimize` est lancé au démarrage                       |
| `bootstrap/cache/*.php` de l'hôte, copiés dans une image `--no-dev`, référencent Pail/Pao/Collision → l'app ne boote plus | exclus dans `.dockerignore`                                  |

---

## Mise à jour manuelle (si besoin, hors CI)

```bash
cd /var/www/ivoir
git pull origin master
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec -T --user www-data app php artisan migrate --force
docker image prune -f
```

## Passage en HTTPS

Une fois le DNS pointé sur le VPS :

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d ivoircuisson.ci -d www.ivoircuisson.ci
```

Puis dans `.env` : `APP_URL=https://ivoircuisson.ci`, et redémarrer le conteneur
`app` pour que `start.sh` reconstruise les caches.
