#!/usr/bin/env bash
set -euo pipefail

# Setup inicial da VPS (Ubuntu 22.04/24.04)
# Execute como root ou com sudo: bash deploy/scripts/setup-vps.sh

APP_DIR="/var/www/sobrapsi"
APP_USER="${APP_USER:-deploy}"

echo "==> Instalando dependências do sistema..."
apt-get update
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

echo "==> Criando usuário e diretório da aplicação..."
if ! id "$APP_USER" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "$APP_USER"
fi

mkdir -p "$APP_DIR"
mkdir -p /var/backups/sobrapsi
mkdir -p /var/www/certbot
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
chown -R "$APP_USER:$APP_USER" /var/backups/sobrapsi

echo "==> Configurando firewall..."
ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable

echo "==> Próximos passos manuais:"
cat <<EOF

1. Clone o repositório em $APP_DIR
   git clone <repo-url> $APP_DIR

2. Configure o ambiente de produção
   cd $APP_DIR
   cp .env.production.example .env
   # Edite .env com senhas e segredos fortes

3. Suba o PostgreSQL
   docker compose up -d

4. Rode o primeiro deploy
   npm ci
   npm run db:migrate
   npm run db:seed    # opcional — apenas ambiente de testes
   npm run build
   pm2 start deploy/ecosystem.config.cjs --env production
   pm2 save
   pm2 startup

5. Configure o Nginx
   cp deploy/nginx/sobrapsi.conf /etc/nginx/sites-available/sobrapsi
   ln -sf /etc/nginx/sites-available/sobrapsi /etc/nginx/sites-enabled/sobrapsi
   nginx -t && systemctl reload nginx
   certbot --nginx -d sobrapsi.org.br -d www.sobrapsi.org.br

6. Configure o cron (deploy/cron/sobrapsi-cron.example)

EOF
