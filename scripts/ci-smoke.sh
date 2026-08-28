#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4173}"
LOG_FILE="$(mktemp)"
SERVER_PID=""

cleanup() {
  if [[ -n "${SERVER_PID}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
  rm -f "${LOG_FILE}"
}
trap cleanup EXIT

NODE_ENV=production \
PORT="${PORT}" \
JWT_SECRET="$(openssl rand -hex 48)" \
DATABASE_URL="mysql://ci:ci@127.0.0.1:3306/medora_ci" \
VITE_APP_ID="ci-smoke" \
OAUTH_SERVER_URL="https://api.manus.im" \
OWNER_OPEN_ID="ci-smoke" \
OWNER_NAME="MEDORA CI" \
BUILT_IN_FORGE_API_URL="https://ci.invalid" \
BUILT_IN_FORGE_API_KEY="ci-only-disabled" \
pnpm start >"${LOG_FILE}" 2>&1 &
SERVER_PID=$!

for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error "http://127.0.0.1:${PORT}/" >/dev/null; then
    echo "MEDORA smoke check passed on port ${PORT}."
    exit 0
  fi
  if ! kill -0 "${SERVER_PID}" 2>/dev/null; then
    cat "${LOG_FILE}"
    exit 1
  fi
  sleep 1
done

cat "${LOG_FILE}"
echo "MEDORA smoke check timed out."
exit 1
