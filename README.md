# tradition-agro

![CI](https://github.com/tradition-agro/tradition-agro/actions/workflows/ci.yml/badge.svg)
![Docker](https://github.com/tradition-agro/tradition-agro/actions/workflows/docker.yml/badge.svg)
![Dependabot](https://github.com/tradition-agro/tradition-agro/actions/workflows/dependabot.yml/badge.svg)

> **⚠️ DATOS DEMO/SOLO DEMOSTRACIÓN — NO USAR EN PRODUCCIÓN**

Portal corporativo para estadísticas agropecuarias de Colombia: precios spot y futuros, estacionalidad, índices, variaciones D+1, mapa choropleth, descargas, PQR y más. Autenticación privada, roles, 2FA, exportaciones auditadas.

## Paleta corporativa

`#0E9F6E`, `#0F4C81`, `#FFFFFF`, `#111827`, `#6B7280`, `#F3F4F6`

## Requisitos mínimos

- Node.js 20+
- Docker
- PostgreSQL 15+
- gh CLI o GITHUB_PAT (scopes: repo, workflow, write:packages)

## Instrucciones locales

```bash
cp .env.example .env
docker-compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run dev