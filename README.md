# Plataforma de Invitaciones Digitales

Base inicial para una plataforma de invitaciones digitales multi-evento.

## Stack

- Frontend: React 19 + Vite 7
- Backend: Node.js 20 + Express 5
- Base de datos: PostgreSQL 17
- Reverse proxy interno: Nginx
- Orquestación: Docker Compose
- Almacenamiento inicial: `./storage`

## Arranque

1. Copiar variables:

```bash
cp .env.example .env
```

2. Cambiar `POSTGRES_PASSWORD` en `.env`.

3. Levantar:

```bash
docker compose up -d --build
```

4. Abrir:

```text
http://localhost:8080
```

API de salud:

```text
http://localhost:8080/api/health
```

## API inicial

- `GET /api/health`
- `GET /api/invitations`
- `GET /api/invitations/:slug`
- `POST /api/invitations`
- `PATCH /api/invitations/:id`
- `GET /api/invitations/:id/guests`
- `POST /api/invitations/:id/guests`

## Rutas públicas

Una invitación se consulta como:

```text
/i/slug-de-la-invitacion
```

## Próximas fases

1. Constructor visual de invitaciones.
2. Sistema de plantillas.
3. Subida y gestión de fotografías.
4. Música y multimedia.
5. RSVP/invitados.
6. Panel de administración.
7. Autenticación y roles.
8. Integración con n8n.
9. Dominio personalizado o subdominios.
10. Backups y almacenamiento externo/NAS.
