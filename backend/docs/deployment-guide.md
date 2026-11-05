# Deployment Guide — Biz List Place

## 1. Overview
Biz List Place comprises two deployable artifacts:
1. **Frontend**: Next.js App Router application (`apps/web`) deployed to Vercel, AWS Amplify, Cloudflare Pages, or Docker/Node.js host.
2. **Backend**: Express.js REST API (`apps/api`) deployed to Render, Railway, AWS ECS, Fly.io, or Heroku.
3. **Database**: MongoDB Atlas M10+ cluster with automated daily snapshots and replica sets.

---

## 2. Environment Configuration in Production

Set these production environment variables:

### API (`apps/api`):
```ini
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<dbuser>:<dbpass>@cluster0.mongodb.net/bizpockethub?retryWrites=true&w=majority
USE_MEMORY_DB=false
JWT_SECRET=<secure-random-64-character-string>
JWT_EXPIRES_IN=7d
COOKIE_SECRET=<secure-random-64-character-string>
CLIENT_URL=https://bizlistplace.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
```

### Web Frontend (`apps/web`):
```ini
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://bizlistplace.com
NEXT_PUBLIC_API_URL=https://api.bizlistplace.com/api/v1
INTERNAL_API_URL=https://api.bizlistplace.com/api/v1
```

---

## 3. Database Indexes & Migrations

The Mongoose schemas automatically configure indexes on connection:
- `Business`: Text search index on `{ name, description, shortDescription, serviceAreas }`
- `Business`: Compound index on `{ listingStatus: 1, isFeatured: -1, createdAt: -1 }`
- `BusinessLocation`: Unique index on `{ businessId: 1, branchSlug: 1 }`
- `BusinessLocation`: Geospatial index `{ coordinates: '2dsphere' }`
- `Review`: Unique compound index on `{ businessId: 1, userId: 1 }` preventing duplicate reviews.

---

## 4. HTTPS, CORS & Cookie Policy

- **CORS**: In production, the API only accepts requests originating from `https://bizlistplace.com`.
- **Cookies**: Set with `httpOnly: true`, `secure: true`, and `sameSite: 'none'` (cross-domain) or `sameSite: 'lax'` (same-domain/reverse-proxy).
- **Health Check**: Monitor `GET https://api.bizlistplace.com/api/v1/health` with your uptime provider (e.g. BetterStack, UptimeRobot, or AWS Route53 health checks).
