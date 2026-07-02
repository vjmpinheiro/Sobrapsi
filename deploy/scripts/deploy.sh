#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "==> SOBRAPSI deploy em $(pwd)"

if [[ ! -f .env ]]; then
  echo "Erro: arquivo .env não encontrado. Copie .env.production.example para .env"
  exit 1
fi

echo "==> Garantindo PostgreSQL..."
docker compose up -d postgres

echo "==> Aguardando banco ficar saudável..."
for _ in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U "${POSTGRES_USER:-sobrapsi}" -d "${POSTGRES_DB:-sobrapsi}" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "==> Instalando dependências..."
npm ci

echo "==> Aplicando migrations..."
npm run db:migrate

echo "==> Gerando build de produção..."
npm run build

echo "==> Reiniciando aplicação..."
if pm2 describe sobrapsi >/dev/null 2>&1; then
  pm2 reload deploy/ecosystem.config.cjs --env production --update-env
else
  pm2 start deploy/ecosystem.config.cjs --env production
fi

pm2 save

echo "==> Deploy concluído."
