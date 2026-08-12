#!/bin/bash
set -e

# storage/ est monté depuis l'host et peut appartenir à root.
mkdir -p /var/www/html/storage/images \
         /var/www/html/storage/app/public \
         /var/www/html/storage/framework/{cache/data,sessions,views} \
         /var/www/html/storage/logs
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# public/ appartient à root dans l'image : www-data ne peut pas créer les liens
# lui-même. config/filesystems.php en déclare deux (storage + images).
# --force : sans lui la commande sort en erreur dès qu'un seul des deux liens
# existe déjà, ce qui tuerait le conteneur au redémarrage (set -e).
php artisan storage:link --force

# Les caches sont construits ici et non au build : le .env réel n'est monté
# qu'au runtime, un cache figé à l'image contiendrait la mauvaise config.
#
# `optimize` seul, jamais `optimize:clear` : ce dernier appelle cache:clear, qui
# avec CACHE_STORE=database fait un DELETE sur la table `cache`. Le démarrage
# dépendrait alors d'une base joignable ET déjà migrée — crashloop au premier
# déploiement. Chaque commande *:cache écrase déjà son propre cache.
php artisan optimize

# PHP-FPM en arrière-plan (daemonize = no dans la config Docker), Nginx au
# premier plan pour maintenir le conteneur actif.
php-fpm &

exec nginx -g 'daemon off;'
