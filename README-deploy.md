# MUSIC 221 - Guide de déploiement continu

Ce dépôt dispose déjà d’un workflow de build/push Docker Hub.  
Ce document décrit la couche de déploiement distant basée sur `deploy.sh`.

## Vue d’ensemble

Le pipeline fonctionne en 5 étapes:

1. Vérification SSH vers le serveur.
2. Connexion à Docker Hub et `docker pull` de l’image ciblée.
3. Arrêt/suppression de l’ancien conteneur puis lancement du nouveau.
4. Health check sur `/health` puis `/` avec retries.
5. Notification Slack en cas de succès ou d’échec.

Le script est compatible:

- avec une exécution locale;
- avec GitHub Actions;
- avec l’option `--rollback`.

Le déploiement GitHub Actions est déclenché après succès du workflow de build/push Docker Hub (`workflow_run`), ce qui évite qu’un serveur tire une image pas encore publiée.

## Prérequis

- Docker installé sur le serveur distant.
- Accès SSH fonctionnel vers le serveur.
- Une image publiée sur Docker Hub.
- Un accès réseau entre le serveur et la base PostgreSQL.

Important: l’application utilise Prisma/PostgreSQL.  
Le conteneur doit donc recevoir `DATABASE_URL` et `DIRECT_URL`, soit via un `.env` local transmis au serveur, soit via des variables d’environnement exportées.

## Fichiers ajoutés

- `deploy.sh` : script principal de déploiement.
- `.env.deploy.example` : modèle des variables de déploiement.
- `.github/workflows/deploy.yml` : déploiement automatique GitHub Actions.

## Variables d’environnement

### Déploiement

- `SSH_HOST` : hôte ou IP du serveur.
- `SSH_USER` : utilisateur SSH.
- `SSH_PORT` : port SSH, défaut `22`.
- `SSH_KEY` : chemin vers la clé privée.
- `DOCKER_USERNAME` : utilisateur Docker Hub.
- `DOCKER_PASSWORD` : mot de passe ou token Docker Hub.
- `IMAGE_NAME` : nom complet de l’image, par exemple `monuser/music221`.
- `IMAGE_TAG` : tag à déployer, par défaut `latest` ou le SHA du commit en CI.
- `CONTAINER_NAME` : nom du conteneur à lancer.
- `HOST_PORT` : port exposé côté serveur.
- `CONTAINER_PORT` : port exposé dans le conteneur.
- `APP_URL` : URL publique de l’application.
- `HEALTH_PATH` : chemin de santé principal, par défaut `/health`.
- `FALLBACK_HEALTH_PATH` : chemin de secours, par défaut `/`.
- `APP_ENV_FILE` : fichier runtime local à copier vers le serveur, par défaut `.env`.
- `SLACK_WEBHOOK_URL` : webhook Slack pour les notifications.

### Runtime applicatif

Si `APP_ENV_FILE` existe, son contenu est envoyé au serveur et utilisé avec `docker run --env-file`.
Sinon, `deploy.sh` génère un fichier runtime temporaire à partir de:

- `DATABASE_URL`
- `DIRECT_URL`
- `NODE_ENV`
- `PORT`

## Utilisation locale

1. Copier le template:

```bash
cp .env.deploy.example .env.deploy
```

2. Renseigner les variables.

3. Lancer le déploiement:

```bash
bash ./deploy.sh
```

4. Lancer un rollback si besoin:

```bash
bash ./deploy.sh --rollback
```

## Utilisation GitHub Actions

Le workflow `.github/workflows/deploy.yml` se déclenche après le succès de `.github/workflows/docker-publish.yml` et reste lançable manuellement via `workflow_dispatch`.

Secrets recommandés:

- `SSH_HOST`
- `SSH_USER`
- `SSH_PORT`
- `SSH_PRIVATE_KEY`
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `DOCKER_IMAGE_NAME`
- `CONTAINER_NAME`
- `HOST_PORT`
- `CONTAINER_PORT`
- `DATABASE_URL`
- `DIRECT_URL`
- `SLACK_WEBHOOK_URL`

Le workflow écrit la clé privée dans le runner, puis appelle `deploy.sh`.

## Exemple de configuration

Exemple pour une API exposée publiquement sur le port 80:

```env
SSH_HOST=203.0.113.10
SSH_USER=deploy
SSH_PORT=22
SSH_KEY=~/.ssh/id_rsa

DOCKER_USERNAME=monuser
DOCKER_PASSWORD=mon-token-dockerhub
IMAGE_NAME=monuser/music221
IMAGE_TAG=latest

CONTAINER_NAME=music221-container
HOST_PORT=80
CONTAINER_PORT=3000
APP_URL=http://203.0.113.10

APP_ENV_FILE=.env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ
```

## Comportement des health checks

Le script:

- attend 10 secondes après le lancement;
- vérifie l’état du conteneur via `docker inspect`;
- tente jusqu’à 3 fois les requêtes HTTP;
- attend 5 secondes entre chaque tentative;
- valide uniquement une réponse HTTP `200`.

## Remarques utiles

- Si ton serveur est derrière un reverse proxy, adapte `APP_URL`.
- Si l’API est déployée derrière HTTPS, mets une URL `https://...`.
- Si tu utilises une base PostgreSQL managée, vérifie que le serveur peut atteindre l’hôte de la base.
