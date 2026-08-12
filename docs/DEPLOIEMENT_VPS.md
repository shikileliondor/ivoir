# Déploiement IvoirCuisson sur VPS

> **Statut** : ⏳ Pas encore déployé
> **Serveur** : le VPS Contabo qui héberge déjà lokea, Odoo et Renkya (`156.67.28.90`)
> **Adresse** : un vrai domaine (+ HTTPS via Certbot)
> **Stack** : Laravel 13 + Inertia/React + MySQL + Redis
> **Méthode** : image construite par GitHub Actions, publiée sur GHCR, tirée par le VPS
> **Le VPS ne compile rien** : il n'a que ~2,7 Gi de marge et héberge déjà lokea et dymora_app
> **Déclenchement** : manuel — `Actions → Deploy to VPS → Run workflow` (voir étape 8)
> **Référence** : `docs/DEPLOIEMENT_VPS.md` du projet lokea (même poste, même VPS) —
> les problèmes qui y sont recensés ont été rejoués un par un ici, voir la
> section « Pièges connus » en fin de document.

---

## Vue d'ensemble

|                | Local (Sail)         | Production (VPS)                      |
| -------------- | -------------------- | ------------------------------------- |
| Compose        | `docker-compose.yml` | `docker-compose.prod.yml`             |
| Port           | 8086                 | 8086, derrière le Nginx hôte          |
| Image          | construite en local  | tirée depuis `ghcr.io/shikileliondor/ivoir-app` |
| Assets Vite    | serveur de dev       | buildés dans l'image, sur le runner GitHub |
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

## Étape 2 — Mémoire : pourquoi le VPS ne build pas

Relevé du 12/08/2026 sur ce VPS :

```
Mem:   5.8Gi total, 3.4Gi used, 1.9Gi available
Swap:  2.0Gi total, 1.2Gi used, 798Mi free
```

Soit **~2,7 Gi de marge**, sur une machine qui fait tourner lokea, dymora_app et
Odoo en production. Le build Vite d'Ivoir (2 950 modules, React 19, three.js)
n'y tient pas confortablement — et si l'OOM killer se déclenche, il tue le plus
gros processus, **qui peut être `lokea-app` ou `dymora_app`**. Un déploiement
d'Ivoir pourrait faire tomber deux sites tiers.

**D'où le choix d'architecture : l'image est construite par GitHub Actions et
publiée sur GHCR. Le VPS ne fait qu'un `docker compose pull`.** Aucun swap
supplémentaire n'est nécessaire, et le déploiement passe de plusieurs minutes de
compilation à quelques secondes de téléchargement.

> C'est d'ailleurs la conclusion à laquelle lokea est arrivé : son
> `docs/DEPLOIEMENT_VPS.md` décrit encore un build dans le Dockerfile (problème
> n° 4, « OOM Killer tue le build Vite », corrigé par du swap), mais son
> Dockerfile réel ne contient plus aucun `npm` et son `deploy.yml` build les
> assets sur le runner. La doc n'a jamais été mise à jour — le swap n'était qu'un
> pansement, la vraie correction a été de sortir le build du VPS.

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

Générer la clé applicative **depuis la machine de dev** (le VPS n'a pas encore
l'image à ce stade) :

```bash
docker compose exec laravel.test php artisan key:generate --show
```

Copier la valeur `base64:...` dans le `APP_KEY=` du VPS. Ne pas réutiliser la clé
de développement : une clé distincte par environnement.

> **Contrairement à lokea, garder `SESSION_DRIVER=database`, `QUEUE_CONNECTION=database`
> et `CACHE_STORE=database` fonctionne ici.** Lokea a dû basculer sur redis parce que
> ses tables `cache`/`jobs` n'existaient pas. Ivoir a bien les migrations
> `create_cache_table`, `create_jobs_table` et la table `sessions` — donc pas de 500.
> Passer sur redis reste préférable en production (le conteneur est déjà là) :
> `SESSION_DRIVER=redis`, `QUEUE_CONNECTION=redis`, `CACHE_STORE=redis`.

Le `.env` n'est pas versionné : il survit aux `git reset --hard` du déploiement.

---

## Étape 5 — Port

Relevé du 12/08/2026 sur ce VPS : `8080` = lokea, `8081` = dymora_app (lié à
`127.0.0.1`), `8082` occupé, `8069`/`8072` = Odoo, plus toute la plage
`5001-5255`. **Le 8086 est libre** — c'est le défaut de
`docker-compose.prod.yml`, rien à changer.

Pour revérifier après coup :

```bash
ss -tlnp | awk '{print $4}' | grep -oE '[0-9]+$' | sort -n -u | tr '\n' ' '
docker ps --format '{{.Names}}\t{{.Ports}}'
```

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

> Relevé du 12/08/2026 : seul `renkya.ci www.renkya.ci` est déclaré. **Aucun
> conflit possible pour le domaine d'Ivoir.**
>
> À noter au passage : lokea n'a plus aucun bloc dans `sites-enabled/`. Il est
> donc servi en direct sur `156.67.28.90:8080`, sans reverse proxy — ni page 502,
> ni `proxy_buffers`. C'est très probablement son problème n° 7 (symlink
> `sites-enabled` supprimé) qui est revenu. Ça ne bloque pas Ivoir, mais ça vaut
> le signalement côté lokea.

Activer :

```bash
ln -s /etc/nginx/sites-available/ivoir /etc/nginx/sites-enabled/ivoir
nginx -t
systemctl reload nginx
```

---

## Étape 7 — Premier lancement

L'image doit d'abord exister sur GHCR : lancer une première fois
**Actions → Deploy to VPS → Run workflow**. Le job `build` la publie, le job
`deploy` fait le reste automatiquement.

Si tu préfères dérouler le premier lancement à la main sur le VPS, il faut
s'authentifier auprès de GHCR (l'image est privée, comme le dépôt). Créer un
Personal Access Token GitHub avec la portée `read:packages`, puis :

```bash
cd /var/www/ivoir
echo "<PAT>" | docker login ghcr.io -u shikileliondor --password-stdin
docker compose -f docker-compose.prod.yml pull app
docker compose -f docker-compose.prod.yml up -d
```

Suivre le démarrage :

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
| 4 | OOM killer tue le build Vite                           | ✅ Neutralisé — le build se fait sur le runner GitHub, plus sur le VPS |
| 5 | `upstream sent too big header` (nginx → php-fpm)       | ✅ Neutralisé — `fastcgi_buffers` dans `docker/app/nginx.conf`    |
| 6 | `upstream sent too big header` (hôte → conteneur)      | ⚠️ **Ouvert** — `proxy_buffers` à mettre, étape 6                |
| 7 | Symlink `sites-enabled` supprimé → 404                 | ⚠️ Opérationnel — recréer le lien, `nginx -t && reload`          |
| 9 | Conflit `server_name` entre projets du VPS             | ✅ Vérifié — seul `renkya.ci` est déclaré sur ce VPS              |
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
docker compose -f docker-compose.prod.yml pull app
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec -T --user www-data app php artisan migrate --force
docker image prune -f
```

## Revenir en arrière

Chaque déploiement publie deux tags : `:latest` et `:<sha du commit>`. Pour
repasser sur une version précédente, sans rien rebuilder :

```bash
cd /var/www/ivoir
IVOIR_IMAGE=ghcr.io/shikileliondor/ivoir-app:<sha> docker compose -f docker-compose.prod.yml up -d
```

Les SHA disponibles sont listés dans l'onglet **Packages** du dépôt GitHub.
Attention : un rollback ne défait pas les migrations déjà appliquées.

## Passage en HTTPS

Une fois le DNS pointé sur le VPS :

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d ivoircuisson.ci -d www.ivoircuisson.ci
```

Puis dans `.env` : `APP_URL=https://ivoircuisson.ci`, et redémarrer le conteneur
`app` pour que `start.sh` reconstruise les caches.
