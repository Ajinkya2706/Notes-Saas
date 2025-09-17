# Notes SaaS (Multi-tenant)

Production-ready multi-tenant Notes app with Next.js App Router, TypeScript, MongoDB (Mongoose), JWT auth, and serverless deployment on Vercel.

Architecture
- Multi-tenancy: shared schema with `tenantId` on all models (`User`, `Note`). Every DB query includes `tenantId` to enforce isolation.
- Auth: JWT Bearer tokens with roles `admin` and `member`.
- Plans: `free` (max 3 notes), `pro` (unlimited). Upgrade via `POST /api/tenants/[slug]/upgrade` (admin only).
- DB: MongoDB Atlas.

Environment variables
```
MONGODB_URI=your_mongodb_atlas_connection
MONGODB_DB=notes
JWT_SECRET=please-set-strong-secret
JWT_EXPIRES_IN=7d
```

Seed data
```
npx ts-node src/scripts/seed.ts
```
Accounts (password: `password`):
- admin@acme.test (admin, tenant acme)
- user@acme.test (member, tenant acme)
- admin@globex.test (admin, tenant globex)
- user@globex.test (member, tenant globex)

API
- POST `/api/auth/login`
- POST `/api/auth/signup`
- GET `/api/health`
- GET/POST `/api/notes`
- GET/PUT/DELETE `/api/notes/[id]`
- POST `/api/tenants/[slug]/upgrade`
- POST `/api/tenants/[slug]/invite` (admin only)

Deployment
- Vercel with `vercel.json` setting CORS headers on `/api/*` routes.

Role restrictions
- Admin: can invite users (`POST /api/tenants/[slug]/invite`) and upgrade plan.
- Member: can only CRUD notes; upgrade/invite return 403.

