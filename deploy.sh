#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_DEPLOY_ENV_FILE="$SCRIPT_DIR/.env.deploy"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

timestamp() {
  date '+%Y-%m-%d %H:%M:%S %Z'
}

log_info() {
  printf "%b[%s] [INFO]%b %s\n" "$BLUE" "$(timestamp)" "$RESET" "$*"
}

log_ok() {
  printf "%b[%s] [OK]%b %s\n" "$GREEN" "$(timestamp)" "$RESET" "$*"
}

log_warn() {
  printf "%b[%s] [WARN]%b %s\n" "$YELLOW" "$(timestamp)" "$RESET" "$*"
}

log_error() {
  printf "%b[%s] [ERROR]%b %s\n" "$RED" "$(timestamp)" "$RESET" "$*" >&2
}

shell_quote() {
  local value="${1:-}"
  printf "'%s'" "${value//\'/\'\"\'\"\'}"
}

json_escape() {
  local value="${1:-}"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  value="${value//$'\n'/\\n}"
  printf '%s' "$value"
}

usage() {
  cat <<'EOF'
Usage: ./deploy.sh [--rollback]

Options:
  --rollback   Attempt to redeploy the previous image if the new deployment fails.
  -h, --help   Show this help message.

Required environment variables:
  SSH_HOST, SSH_USER, IMAGE_NAME
  DOCKER_USERNAME, DOCKER_PASSWORD
  DATABASE_URL, DIRECT_URL

Optional environment variables:
  SSH_PORT, SSH_KEY, IMAGE_TAG, CONTAINER_NAME, HOST_PORT, CONTAINER_PORT
  APP_URL, HEALTH_PATH, FALLBACK_HEALTH_PATH, APP_ENV_FILE, APP_NAME
  SLACK_WEBHOOK_URL, NODE_ENV
EOF
}

die() {
  local stage="${1:-unknown stage}"
  local message="${2:-Deployment failed}"
  log_error "$message"

  if [[ "${ROLLBACK_ENABLED}" == "true" ]]; then
    if rollback_previous_image; then
      log_warn "Rollback attempted for '$stage' and succeeded."
      message="$message | rollback: success"
    else
      log_warn "Rollback attempted for '$stage' but failed or was unavailable."
      message="$message | rollback: failed"
    fi
  fi

  send_notification "failure" "$stage" "$message" || true
  exit 1
}

send_notification() {
  local status="$1"
  local stage="$2"
  local message="$3"

  if [[ -z "${SLACK_WEBHOOK_URL:-}" ]]; then
    log_warn "SLACK_WEBHOOK_URL is not set, testons notification skipped."
    return 0
  fi

  local now payload text
  now="$(timestamp)"

  if [[ "$status" == "success" ]]; then
    printf -v text '✅ Projet : %s\nStatut : Succès\nImage : %s:%s\nHeure : %s\nURL : %s' \
      "$APP_NAME" "$IMAGE_NAME" "$IMAGE_TAG" "$now" "$APP_URL"
  else
    printf -v text '❌ Projet : %s\nStatut : Échec\nÉtape : %s\nMessage : %s\nHeure : %s' \
      "$APP_NAME" "$stage" "$message" "$now"
  fi

  payload="{\"text\":\"$(json_escape "$text")\"}"

  curl -fsS -X POST \
    -H 'Content-type: application/json' \
    --data "$payload" \
    "$SLACK_WEBHOOK_URL" >/dev/null
}

load_env_file_if_present() {
  local env_file="$1"
  if [[ -f "$env_file" ]]; then
    log_info "Chargement du fichier d'environnement : $env_file"
    set -a
    # shellcheck source=/dev/null
    source "$env_file"
    set +a
  else
    log_info "Aucun fichier d'environnement trouvé à $env_file, on s'appuie sur les variables déjà exportées."
  fi
}

REMOTE_ENV_FILE=""
GENERATED_ENV_FILE="false"
UPLOADED_ENV_FILE="false"
PREVIOUS_IMAGE_ID=""
ROLLBACK_ENABLED="false"
CURRENT_STAGE="initialisation"
REMOTE_TARGET=""
SSH_OPTS=()
SCP_OPTS=()

cleanup() {
  if [[ "$GENERATED_ENV_FILE" == "true" && -n "${LOCAL_TEMP_ENV_FILE:-}" && -f "$LOCAL_TEMP_ENV_FILE" ]]; then
    rm -f "$LOCAL_TEMP_ENV_FILE"
  fi

  if [[ "$UPLOADED_ENV_FILE" == "true" && -n "$REMOTE_ENV_FILE" ]]; then
    ssh "${SSH_OPTS[@]}" "$REMOTE_TARGET" "rm -f $(shell_quote "$REMOTE_ENV_FILE")" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

while [[ $# -gt 0 ]]; do
  case "$1" in
    --rollback)
      ROLLBACK_ENABLED="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      log_error "Option inconnue : $1"
      usage
      exit 1
      ;;
  esac
done

load_env_file_if_present "$DEFAULT_DEPLOY_ENV_FILE"

: "${SSH_HOST:?SSH_HOST is required}"
: "${SSH_USER:?SSH_USER is required}"
: "${IMAGE_NAME:?IMAGE_NAME is required}"
: "${DOCKER_USERNAME:?DOCKER_USERNAME is required}"
: "${DOCKER_PASSWORD:?DOCKER_PASSWORD is required}"

SSH_PORT="${SSH_PORT:-22}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_rsa}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
CONTAINER_NAME="${CONTAINER_NAME:-music221-container}"
HOST_PORT="${HOST_PORT:-80}"
CONTAINER_PORT="${CONTAINER_PORT:-3000}"
HEALTH_PATH="${HEALTH_PATH:-/health}"
FALLBACK_HEALTH_PATH="${FALLBACK_HEALTH_PATH:-/}"
NODE_ENV="${NODE_ENV:-production}"
APP_URL="${APP_URL:-http://${SSH_HOST}:${HOST_PORT}}"
APP_URL="${APP_URL%/}"
APP_ENV_FILE="${APP_ENV_FILE:-$SCRIPT_DIR/.env}"
APP_NAME="${APP_NAME:-MUSIC 221}"

SSH_KEY="${SSH_KEY/#\~/$HOME}"
REMOTE_TARGET="${SSH_USER}@${SSH_HOST}"
FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"
REMOTE_ENV_FILE="/tmp/${CONTAINER_NAME}.env"
HOST_MAPPING="${HOST_PORT}:${CONTAINER_PORT}"

SSH_OPTS=(
  -i "$SSH_KEY"
  -p "$SSH_PORT"
  -o BatchMode=yes
  -o ConnectTimeout=10
  -o ServerAliveInterval=15
  -o ServerAliveCountMax=2
  -o StrictHostKeyChecking=accept-new
)
SCP_OPTS=(
  -i "$SSH_KEY"
  -P "$SSH_PORT"
  -o BatchMode=yes
  -o ConnectTimeout=10
  -o StrictHostKeyChecking=accept-new
)

if [[ -n "$APP_ENV_FILE" && "$APP_ENV_FILE" != /* ]]; then
  APP_ENV_FILE="$SCRIPT_DIR/$APP_ENV_FILE"
fi

if [[ -f "$APP_ENV_FILE" ]]; then
  APP_ENV_FILE="$(cd -- "$(dirname -- "$APP_ENV_FILE")" && pwd)/$(basename -- "$APP_ENV_FILE")"
else
  APP_ENV_FILE=""
fi

prepare_runtime_env_file() {
  if [[ -n "$APP_ENV_FILE" && -f "$APP_ENV_FILE" ]]; then
    LOCAL_TEMP_ENV_FILE="$APP_ENV_FILE"
    return 0
  fi

  : "${DATABASE_URL:?DATABASE_URL is required when no APP_ENV_FILE is present}"
  : "${DIRECT_URL:?DIRECT_URL is required when no APP_ENV_FILE is present}"

  LOCAL_TEMP_ENV_FILE="$(mktemp "${TMPDIR:-/tmp}/music221-runtime-env.XXXXXX")"
  GENERATED_ENV_FILE="true"

  {
    printf 'NODE_ENV=%s\n' "$NODE_ENV"
    printf 'PORT=%s\n' "$CONTAINER_PORT"
    printf 'DATABASE_URL=%s\n' "$DATABASE_URL"
    printf 'DIRECT_URL=%s\n' "$DIRECT_URL"
  } > "$LOCAL_TEMP_ENV_FILE"

  log_info "Fichier runtime temporaire généré : $LOCAL_TEMP_ENV_FILE"
}

remote_eval() {
  local command="$1"
  ssh "${SSH_OPTS[@]}" "$REMOTE_TARGET" bash -lc "$(shell_quote "$command")"
}

rollback_previous_image() {
  if [[ -z "$PREVIOUS_IMAGE_ID" ]]; then
    log_warn "Aucune image précédente détectée, rollback impossible."
    return 1
  fi

  log_info "Tentative de rollback avec l'image précédente : $PREVIOUS_IMAGE_ID"

  local env_flag=""
  if [[ "$UPLOADED_ENV_FILE" == "true" ]]; then
    env_flag="--env-file $(shell_quote "$REMOTE_ENV_FILE")"
  fi

  remote_eval "set -euo pipefail; docker rm -f $(shell_quote "$CONTAINER_NAME") >/dev/null 2>&1 || true; docker run -d --name $(shell_quote "$CONTAINER_NAME") --restart unless-stopped -p $(shell_quote "$HOST_MAPPING") ${env_flag} $(shell_quote "$PREVIOUS_IMAGE_ID")"
}

log_info "Déploiement lancé"
log_info "Serveur : ${SSH_USER}@${SSH_HOST}:${SSH_PORT}"
log_info "Image   : ${FULL_IMAGE}"
log_info "Conteneur : ${CONTAINER_NAME}"
log_info "URL cible : ${APP_URL}"

CURRENT_STAGE="connexion SSH"
log_info "Étape 1/5 - Vérification de la connexion SSH"
if ! remote_eval "echo SSH_OK >/dev/null"; then
  die "$CURRENT_STAGE" "Connexion SSH impossible vers ${REMOTE_TARGET}"
fi
log_ok "Connexion SSH établie"

CURRENT_STAGE="préparation runtime"
log_info "Étape 2/5 - Préparation du fichier d'environnement"
prepare_runtime_env_file
if [[ -n "$APP_ENV_FILE" ]]; then
  log_info "Envoi du fichier d'environnement vers le serveur"
  if ! scp "${SCP_OPTS[@]}" "$LOCAL_TEMP_ENV_FILE" "${REMOTE_TARGET}:$REMOTE_ENV_FILE" >/dev/null; then
    die "$CURRENT_STAGE" "Impossible de copier le fichier d'environnement vers le serveur"
  fi
  UPLOADED_ENV_FILE="true"
  log_ok "Fichier d'environnement transféré"
else
  log_warn "Aucun fichier runtime local n'a été trouvé et les variables ont été générées temporairement."
  if ! scp "${SCP_OPTS[@]}" "$LOCAL_TEMP_ENV_FILE" "${REMOTE_TARGET}:$REMOTE_ENV_FILE" >/dev/null; then
    die "$CURRENT_STAGE" "Impossible de copier le fichier d'environnement généré vers le serveur"
  fi
  UPLOADED_ENV_FILE="true"
  log_ok "Fichier runtime temporaire transféré"
fi

CURRENT_STAGE="inspection du conteneur précédent"
log_info "Récupération de l'image du conteneur actuel si elle existe"
PREVIOUS_IMAGE_ID="$(remote_eval "docker inspect -f '{{.Image}}' $(shell_quote "$CONTAINER_NAME") 2>/dev/null || true" || true)"
if [[ -n "$PREVIOUS_IMAGE_ID" ]]; then
  log_info "Image précédente détectée : $PREVIOUS_IMAGE_ID"
else
  log_warn "Aucun conteneur existant trouvé, le rollback sera indisponible si l'étape suivante échoue."
fi

CURRENT_STAGE="auth Docker Hub et pull"
log_info "Étape 3/5 - Connexion à Docker Hub et récupération de l'image"
if ! remote_eval "set -euo pipefail; printf '%s\n' $(shell_quote "$DOCKER_PASSWORD") | docker login -u $(shell_quote "$DOCKER_USERNAME") --password-stdin >/dev/null"; then
  die "$CURRENT_STAGE" "Échec de l'authentification Docker Hub"
fi

pull_ok="false"
for attempt in 1 2 3 4 5; do
  if remote_eval "set -euo pipefail; docker pull $(shell_quote "$FULL_IMAGE")"; then
    pull_ok="true"
    break
  fi

  if [[ "$attempt" -lt 5 ]]; then
    log_warn "Pull Docker échoué, nouvelle tentative dans 5 secondes..."
    sleep 5
  fi
done

if [[ "$pull_ok" != "true" ]]; then
  die "$CURRENT_STAGE" "Échec du pull de l'image ${FULL_IMAGE}"
fi
log_ok "Image Docker récupérée avec succès"

CURRENT_STAGE="lancement du conteneur"
log_info "Étape 4/5 - Arrêt, suppression et redémarrage du conteneur"
REMOTE_RUN_COMMAND="set -euo pipefail; docker rm -f $(shell_quote "$CONTAINER_NAME") >/dev/null 2>&1 || true; docker run -d --name $(shell_quote "$CONTAINER_NAME") --restart unless-stopped -p $(shell_quote "$HOST_MAPPING")"
if [[ "$UPLOADED_ENV_FILE" == "true" ]]; then
  REMOTE_RUN_COMMAND+=" --env-file $(shell_quote "$REMOTE_ENV_FILE")"
fi
REMOTE_RUN_COMMAND+=" $(shell_quote "$FULL_IMAGE")"

if ! remote_eval "$REMOTE_RUN_COMMAND"; then
  die "$CURRENT_STAGE" "Impossible de lancer le conteneur ${CONTAINER_NAME}"
fi
log_ok "Conteneur démarré"

CURRENT_STAGE="health check"
log_info "Étape 5/5 - Vérification de santé"
log_info "Attente de 10 secondes avant le premier test"
sleep 10

check_http() {
  local url="$1"
  local http_code=""
  http_code="$(curl -sS --connect-timeout 5 --max-time 10 -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo "000")"
  [[ "$http_code" == "200" ]]
}

health_ok="false"
for attempt in 1 2 3; do
  local_state=""
  local_state="$(remote_eval "docker inspect -f '{{.State.Status}}' $(shell_quote "$CONTAINER_NAME") 2>/dev/null || true" || true)"
  log_info "Tentative ${attempt}/3 - état conteneur : ${local_state:-inconnu}"

  if [[ "$local_state" != "running" ]]; then
    log_warn "Le conteneur n'est pas encore prêt."
  else
    if check_http "${APP_URL}${HEALTH_PATH}"; then
      health_ok="true"
      break
    fi

    if [[ "$FALLBACK_HEALTH_PATH" != "$HEALTH_PATH" ]] && check_http "${APP_URL}${FALLBACK_HEALTH_PATH}"; then
      health_ok="true"
      break
    fi

    log_warn "Aucune réponse HTTP 200 pour ${HEALTH_PATH} ni ${FALLBACK_HEALTH_PATH}."
  fi

  if [[ "$attempt" -lt 3 ]]; then
    log_info "Nouvelle tentative dans 5 secondes..."
    sleep 5
  fi
done

if [[ "$health_ok" != "true" ]]; then
  die "$CURRENT_STAGE" "Le déploiement ne répond pas encore en HTTP 200 sur ${APP_URL}${HEALTH_PATH} ou ${APP_URL}${FALLBACK_HEALTH_PATH}"
fi

log_ok "Health check validé"

CURRENT_STAGE="notification de succès"
send_notification "success" "$CURRENT_STAGE" "Déploiement terminé avec succès" || log_warn "Impossible d'envoyer la notification Slack de succès."

log_ok "Déploiement réussi"

if [[ "$UPLOADED_ENV_FILE" == "true" ]]; then
  ssh "${SSH_OPTS[@]}" "$REMOTE_TARGET" "rm -f $(shell_quote "$REMOTE_ENV_FILE")" >/dev/null 2>&1 || true
  UPLOADED_ENV_FILE="false"
fi

exit 0
