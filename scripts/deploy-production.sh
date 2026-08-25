#!/bin/bash
# MEDORA | ميدورا — Production Deployment Script
# Copyright (c) 2026 Hossam Naeim Osman. All rights reserved.

set -e

# --- Configuration ---
APP_NAME="medora"
PROJECT_ROOT="/home/ubuntu/medora-masterpiece"
ENV_FILE="$PROJECT_ROOT/.env"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
LOG_FILE="$PROJECT_ROOT/deployment.log"

# --- Colors for Output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[$(date)] Starting MEDORA production deployment...${NC}" | tee -a "$LOG_FILE"

# 1. Root check
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Error: This script must be run as root (sudo).${NC}"
   exit 1
fi

# 2. Environment check
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found at $ENV_FILE.${NC}"
    echo "Please create it using the PRODUCTION_ENVIRONMENT_GUIDE.md."
    exit 1
fi

cd "$PROJECT_ROOT"

# 3. Git synchronization
echo -e "${BLUE}Syncing with repository...${NC}" | tee -a "$LOG_FILE"
git fetch origin main
git reset --hard origin/main

# 4. Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}" | tee -a "$LOG_FILE"
pnpm install --frozen-lockfile

# 5. Build application
echo -e "${BLUE}Building application...${NC}" | tee -a "$LOG_FILE"
pnpm build

# 6. Database Migration
echo -e "${BLUE}Running database migrations...${NC}" | tee -a "$LOG_FILE"
pnpm drizzle-kit push --force

# 7. Docker Deployment
echo -e "${BLUE}Restarting Docker containers...${NC}" | tee -a "$LOG_FILE"
if [ -f "docker-compose.yml" ]; then
    docker-compose down
    docker-compose up -d --build
else
    echo -e "${RED}Error: docker-compose.yml not found.${NC}"
    exit 1
fi

# 8. Health Check
echo -e "${BLUE}Performing health check...${NC}" | tee -a "$LOG_FILE"
sleep 15
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/trpc/system.healthCheck || echo "failed")

if [ "$HEALTH_STATUS" == "200" ]; then
    echo -e "${GREEN}Deployment successful! System is healthy.${NC}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}Deployment failed! Health check returned $HEALTH_STATUS.${NC}" | tee -a "$LOG_FILE"
    echo "Check deployment.log and docker logs for details."
    exit 1
fi
