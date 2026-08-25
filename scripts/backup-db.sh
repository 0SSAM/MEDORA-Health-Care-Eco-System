#!/bin/bash

# MEDORA Automated Database Backup Script
# سكريبت النسخ الاحتياطي الآلي لقاعدة بيانات ميدورا

set -e

# --- Configuration ---
APP_NAME="medora-app-1"
DB_SERVICE="db"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_FILE="$BACKUP_DIR/medora_db_backup_$TIMESTAMP.sql.gz"
RETENTION_DAYS=30

# --- Colors for Output ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== MEDORA Database Backup Started ===${NC}"
echo -e "${BLUE}=== بدأ النسخ الاحتياطي لقاعدة بيانات ميدورا ===${NC}"

# 1. Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    chmod 700 "$BACKUP_DIR"
fi

# 2. Load .env for credentials if running outside docker
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# 3. Perform Backup from DB container
echo -e "${BLUE}Backing up database medora_db to $BACKUP_FILE...${NC}"
echo -e "${BLUE}جاري النسخ الاحتياطي لقاعدة البيانات إلى $BACKUP_FILE...${NC}"

# Execute mysqldump inside the database container
# Find the actual container ID for the db service
DB_CONTAINER=$(docker compose ps -q "$DB_SERVICE")
if [ -z "$DB_CONTAINER" ]; then
    echo -e "${RED}Error: Database container not found for service $DB_SERVICE.${NC}"
    exit 1
fi

docker exec "$DB_CONTAINER" /usr/bin/mysqldump \
    -u root -p"$MYSQL_ROOT_PASSWORD" \
    "$MYSQL_DATABASE" | gzip > "$BACKUP_FILE"

# 4. Verify Backup
if [ -s "$BACKUP_FILE" ]; then
    echo -e "${GREEN}SUCCESS: Backup completed successfully.${NC}"
    echo -e "${GREEN}تم بنجاح: اكتمل النسخ الاحتياطي بنجاح.${NC}"
    ls -lh "$BACKUP_FILE"
else
    echo -e "${RED}Error: Backup file is empty or was not created.${NC}"
    echo -e "${RED}خطأ: ملف النسخ الاحتياطي فارغ أو لم يتم إنشاؤه.${NC}"
    exit 1
fi

# 5. Retention Policy (Delete backups older than RETENTION_DAYS)
echo -e "${BLUE}Applying retention policy (deleting backups older than $RETENTION_DAYS days)...${NC}"
echo -e "${BLUE}تطبيق سياسة الاحتفاظ (حذف النسخ الأقدم من $RETENTION_DAYS يوم)...${NC}"
find "$BACKUP_DIR" -name "medora_db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo -e "${BLUE}=== Backup Process Finished ===${NC}"
echo -e "${BLUE}=== انتهت عملية النسخ الاحتياطي ===${NC}"
