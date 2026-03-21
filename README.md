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

OPENAI_API_KEY
ALLOWED_ORIGINS    (production only)
DATABASE_URL       (production only)
```

## Deployment (Vercel + Railway + Neon)
Production setup:
- Frontend: Vercel
- Backend: Railway
- Database: Neon (Postgres)

Steps:
1. Create a Neon project and copy the connection string.
2. Deploy backend to Railway:
   - Connect GitHub repo, set root directory to `server`
   - Set variables: `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `ALLOWED_ORIGINS`
   - `ALLOWED_ORIGINS` = your Vercel domain (e.g. `https://your-app.vercel.app`)
3. Deploy frontend to Vercel:
   - Connect GitHub repo, set root directory to `client`
   - Set `VITE_API_URL` to `https://<railway-app>.up.railway.app/api`
4. Seed production database:
   - `cd server && railway run npm run reset-and-seed`

## Default Users (seeded automatically)
Name        Email               Password      
John Doe    john12@example.com password123 
Jane Smith  jane@example.com   password123  

You can log in with any of these credentials right after `docker-compose up`.

## Notes
- Backend container runs `npm run seed` on startup (if it fails, it continues).
- Use `docker-compose down -v` to stop and reset the database.
- AI Assistant requires a valid `OPENAI_API_KEY` (uses GPT-4o-mini).
- AI Assistant is read-only access - it cant create, edit, or delete events.
