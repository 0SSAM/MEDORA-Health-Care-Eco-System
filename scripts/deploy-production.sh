#!/bin/bash

# MEDORA Production Deployment Script
# This script automates the deployment of MEDORA using Docker and Nginx.
# Usage: ./deploy-production.sh [release-tag-or-sha]

set -e

# --- Configuration ---
APP_NAME="medora"
INSTALL_DIR="/opt/medora"
SOURCE_DIR="$INSTALL_DIR/source"
ENV_FILE="$INSTALL_DIR/medora.env"
DOCKER_NETWORK="medora-private"
DEFAULT_PORT=3000
TIMESTAMP=$(date +%Y%m%d%H%M%S)

# --- Colors for Output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== MEDORA Production Deployment Started ===${NC}"

# 1. Prerequisites Check
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Error: This script must be run as root (sudo).${NC}"
   exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install it first.${NC}"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: Production environment file $ENV_FILE not found.${NC}"
    echo "Please create it with the required secrets (DATABASE_URL, JWT_SECRET, etc.)"
    exit 1
fi

# 2. Update Source Code
echo -e "${BLUE}Updating source code...${NC}"
if [ ! -d "$SOURCE_DIR" ]; then
    git clone https://github.com/0SSAM/MEDORA-Health-Care-Eco-System.git "$SOURCE_DIR"
fi

cd "$SOURCE_DIR"
git fetch --all --tags

# Sanitize input to prevent command injection
RELEASE_REF=$(echo "${1:-main}" | tr -cd '[:alnum:]._-')
echo -e "${BLUE}Checking out $RELEASE_REF...${NC}"
git checkout "$RELEASE_REF"
git pull origin "$RELEASE_REF"

# 3. Build Docker Image
IMAGE_TAG="$APP_NAME:$TIMESTAMP"
echo -e "${BLUE}Building Docker image: $IMAGE_TAG...${NC}"
docker build --pull -t "$IMAGE_TAG" .
docker tag "$IMAGE_TAG" "$APP_NAME:latest"

# 4. Network Setup
if ! docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1; then
    echo -e "${BLUE}Creating private network $DOCKER_NETWORK...${NC}"
    docker network create "$DOCKER_NETWORK"
fi

# 5. Stop Old Container (if exists)
if docker ps -a --format '{{.Names}}' | grep -q "^$APP_NAME$"; then
    echo -e "${BLUE}Stopping and removing existing $APP_NAME container...${NC}"
    docker stop "$APP_NAME" || true
    docker rm "$APP_NAME" || true
fi

# 6. Start New Container
echo -e "${BLUE}Starting new $APP_NAME container...${NC}"
docker run -d \
  --name "$APP_NAME" \
  --restart unless-stopped \
  --env-file "$ENV_FILE" \
  --network "$DOCKER_NETWORK" \
  --health-cmd="node -e \"fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))\"" \
  --health-interval=30s \
  --health-timeout=5s \
  --health-retries=3 \
  -p 127.0.0.1:$DEFAULT_PORT:$DEFAULT_PORT \
  "$IMAGE_TAG"

# 7. Verification
echo -e "${BLUE}Verifying deployment...${NC}"
sleep 5
HEALTH_STATUS=$(docker inspect --format '{{.State.Health.Status}}' "$APP_NAME")

if [ "$HEALTH_STATUS" == "healthy" ] || [ "$HEALTH_STATUS" == "starting" ]; then
    echo -e "${GREEN}SUCCESS: MEDORA is deployed and running!${NC}"
    echo -e "${GREEN}Health Status: $HEALTH_STATUS${NC}"
    echo -e "${BLUE}Check logs with: docker logs -f $APP_NAME${NC}"
else
    echo -e "${RED}WARNING: Container started but health check is $HEALTH_STATUS.${NC}"
    echo -e "${RED}Check logs for errors: docker logs $APP_NAME${NC}"
fi

# 8. Cleanup
echo -e "${BLUE}Cleaning up old images...${NC}"
docker image prune -f --filter "label=stage=build" || true

echo -e "${BLUE}=== Deployment Process Finished ===${NC}"
