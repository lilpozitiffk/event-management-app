# Event Management App (PoC)

## Requirements
- Docker + Docker Compose

## Quick Start (one command)
From the project root:

```bash
docker-compose up --build
```

This will start:
- PostgreSQL
- NestJS backend (dev mode)
- React frontend (Vite)

## URLs
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

## Environment
Default values are in `.env.example`. You can create a local `.env` if you want to override:

```
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
POSTGRES_PORT

DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
JWT_SECRET
PORT
BACKEND_PORT

FRONTEND_PORT
VITE_API_URL
```

## Deployment (Vercel + Fly.io + Neon)
Production setup:
- Frontend: Vercel
- Backend: Fly.io
- Database: Neon (Postgres)

Steps (high level):
1. Create a Neon project and copy the connection string.
2. Deploy backend to Fly.io:
   - Set secrets: `DATABASE_URL`, `JWT_SECRET`
   - Deploy from `server` (`fly deploy`)
3. Deploy frontend to Vercel:
   - Set `VITE_API_URL` to `https://<fly-app>.fly.dev/api`
   - Redeploy

## Notes
- Backend container runs `npm run seed` on startup (if it fails, it continues).
- Use `docker-compose down -v` to stop and reset the database.
