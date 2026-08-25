#!/bin/bash

# MEDORA | Automated .env Generator
# ميدورا | مولد ملف البيئة التلقائي

set -e

ENV_FILE=".env"

# Function to generate a random string
generate_secret() {
    openssl rand -base64 32 | tr -d /=+ | cut -c1-32
}

echo "🚀 Generating MEDORA environment configuration..."
echo "🚀 جاري إنشاء إعدادات بيئة ميدورا..."

if [ -f "$ENV_FILE" ]; then
    echo "⚠️  .env file already exists. Skipping to avoid overwriting."
    echo "⚠️  ملف .env موجود بالفعل. سيتم التخطي لتجنب الكتابة فوقه."
    exit 0
fi

# Generate Secrets
JWT_SECRET=$(generate_secret)
AUDIT_KEY=$(generate_secret)
DB_ROOT_PASS=$(generate_secret)
DB_USER_PASS=$(generate_secret)

cat <<EOF > "$ENV_FILE"
# =================================================================
# MEDORA Environment Configuration | إعدادات بيئة ميدورا
# Generated on: $(date)
# =================================================================

# 🔑 Authentication & Security | المصادقة والأمان
JWT_SECRET=$JWT_SECRET
AUDIT_SIGNING_KEY=$AUDIT_KEY

# 🗄️ Database Configuration | إعدادات قاعدة البيانات
MYSQL_ROOT_PASSWORD=$DB_ROOT_PASS
MYSQL_DATABASE=medora_db
MYSQL_USER=medora_admin
MYSQL_PASSWORD=$DB_USER_PASS

# 🌐 Connection String (Internal Docker) | رابط الاتصال الداخلي
DATABASE_URL=mysql://medora_admin:$DB_USER_PASS@db:3306/medora_db

# 👤 Admin Provisioning | إعدادات المشرف
# Replace with your actual ID if using OAuth
OWNER_OPEN_ID=admin_default_id

# ⚙️ Node Environment
NODE_ENV=production
EOF

chmod 600 "$ENV_FILE"

echo "✅ .env file generated successfully with secure random secrets."
echo "✅ تم إنشاء ملف .env بنجاح مع أسرار عشوائية آمنة."
echo "📝 Please update OWNER_OPEN_ID in .env if needed."
echo "📝 يرجى تحديث OWNER_OPEN_ID في ملف .env إذا لزم الأمر."
