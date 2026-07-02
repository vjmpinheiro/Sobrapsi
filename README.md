# SOBRAPSI — Sociedade Brasileira de Psicanálise

Plataforma institucional + portal de candidatura + cadastro privado + diretório público controlado de associados.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS 4** + componentes estilo shadcn/ui
- **Prisma** + **PostgreSQL** (Docker na VPS)
- **Nginx** + **PM2** (produção) + **Resend** (e-mails transacionais)

## Início rápido (desenvolvimento)

```bash
# Instalar dependências
npm install

# Subir PostgreSQL
docker compose up -d

# Copiar variáveis de ambiente
cp .env.example .env

# Criar banco e popular dados demo
npm run db:migrate
npm run db:seed

# Desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Admin

- URL: `/admin`
- Senha padrão (dev): valor de `ADMIN_SECRET` no `.env` (`change-me-in-production`)

### Consulta de associados (demo)

Com banco + seed, a consulta usa dados reais. Sem banco, usa 3 associados de demonstração.

## Deploy na VPS (Opção A)

PostgreSQL no Docker + Next.js com PM2 + Nginx na mesma VPS.

### 1. Setup inicial da VPS (uma vez)

```bash
sudo bash deploy/scripts/setup-vps.sh
```

### 2. Configurar aplicação

```bash
cd /var/www/sobrapsi
git clone https://github.com/vjmpinheiro/Sobrapsi.git .
cp .env.production.example .env
# Edite .env: senhas, SESSION_SECRET, ENCRYPTION_KEY, domínio
docker compose up -d
```

### 3. Primeiro deploy

```bash
npm ci
npm run db:migrate
npm run build
pm2 start deploy/ecosystem.config.cjs --env production
pm2 save && pm2 startup
```

### 4. Nginx + HTTPS

```bash
sudo cp deploy/nginx/sobrapsi.conf /etc/nginx/sites-available/sobrapsi
sudo ln -sf /etc/nginx/sites-available/sobrapsi /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d sobrapsi.org.br -d www.sobrapsi.org.br
```

### 5. Deploys seguintes

```bash
npm run deploy
```

### 6. Cron e backups

- Cron de anuidade: `deploy/cron/sobrapsi-cron.example`
- Backup manual: `npm run backup` (PostgreSQL + pasta `uploads/`)

### Variáveis importantes em produção

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | PostgreSQL local (`127.0.0.1:5432`) |
| `SESSION_SECRET` | Segredo de sessão (32+ bytes) |
| `ENCRYPTION_KEY` | Chave hex 32 bytes para CPF/RG |
| `ADMIN_SECRET` | Senha do painel admin |
| `CRON_SECRET` | Token do endpoint `/api/cron/membership` |
| `ALLOW_SIMULATED_PAYMENTS` | `false` em produção |
| `NEXT_PUBLIC_APP_URL` | URL pública com HTTPS |

## Funcionalidades

- Site institucional público (home, sobre, associe-se, código de ética, regulamento, formação, rede, eventos, artigos, contato)
- Páginas legais (privacidade, termos, cookies)
- **Consulta pública de associados** — sem CPF, apenas dados autorizados
- **Validação de carteira** via `/validar/[registro]`
- Perfil público opcional do associado
- **Autenticação** — registro, login, sessão segura (cookie httpOnly)
- **Candidatura em 9 etapas** — categoria, dados pessoais, profissionais, formação, currículo, documentos, perfil público, aceites, envio
- **Upload de documentos** — armazenamento local privado (`uploads/`)
- **Painel admin** — fila de candidaturas, aprovar, reprovar, pedir complementação
- **Carteira digital** — visualização com QR code + download PDF
- **Renovação de anuidade** — fluxo de pagamento + extensão de validade
- **Painel admin de pagamentos** — confirmar Pix/manual
- **Status automático** — vencendo/vencido via cron (`/api/cron/membership`)
- **E-mails transacionais e lembretes** — via Resend (ou log no console em dev)

## Estrutura de rotas

| Rota | Descrição |
|------|-----------|
| `/` | Home institucional |
| `/sobre` | Sobre a SOBRAPSI |
| `/associe-se` | Candidatura e categorias |
| `/consultar-associado` | Busca pública segura |
| `/validar/[registro]` | Validação de carteira (QR code) |
| `/associado/[registro]` | Perfil público (se autorizado) |
| `/app/login` | Login do portal |
| `/app/registro` | Criar conta |
| `/app/carteira` | Carteira digital + QR + PDF |
| `/app/renovacao` | Renovação e pagamentos |
| `/admin` | Painel administrativo |

## Princípio de dados

> **Tudo é privado por padrão. Só vira público o que for necessário, aprovado e autorizado.**

Campos públicos máximos: nome, registro, categoria, UF (com consentimento), status, validade, mini bio opcional, foto opcional, links profissionais opcionais.

**Nunca públicos:** CPF, RG, endereço, telefone, e-mail pessoal, documentos, pareceres internos.

## Roadmap

- CMS de artigos e eventos
- Área exclusiva ampliada e biblioteca institucional
- Integração com gateway de pagamentos (Asaas/Pagar.me)

## Design

Visual inspirado em sipbrasil.com: fundo escuro (#000), acento roxo (#8A5CF5), tipografia Inter, fotos em grayscale, cards com bordas sutis.

## Migração do site atual

1. Remover lista pública com CPF do WordPress
2. Exportar associados e higienizar dados
3. Importar via seed/script com `legacy_registration_number`
4. Revalidação no primeiro login dos associados antigos

## Licença

Propriedade da SOBRAPSI.
