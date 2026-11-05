# Setup Guide — Biz List Place

## 1. Prerequisites
- **Node.js**: `v20.x` or higher (tested on Node v24)
- **npm**: `v9.x` or higher
- Optional: MongoDB Atlas or local MongoDB instance (if omitted, Biz List Place automatically starts an internal in-memory MongoDB engine for zero-configuration development).

---

## 2. Initial Setup

1. **Clone and navigate to repository:**
   ```bash
   cd bizpockethub
   ```

2. **Install all workspace dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   # Copy sample environment configuration
   cp .env.example .env
   ```

   Key configuration variables in `.env`:
   - `PORT=5000`: Port for the Express.js API.
   - `MONGODB_URI`: Connection string for MongoDB Atlas (or local mongod).
   - `USE_MEMORY_DB=true`: Automatically provisions MongoDB Memory Server when external connection is absent.
   - `JWT_SECRET`: Minimum 32-character secret key for JWT session tokens.
   - `COOKIE_SECRET`: Secret used for signing HttpOnly cookies.
   - `NEXT_PUBLIC_API_URL`: Client-side base URL pointing to `/api/v1`.
   - `NEXT_PUBLIC_SITE_URL`: Frontend canonical root URL (`http://localhost:3000`).

---

## 3. Database Seeding

Populate the database with verified multi-country seed data (categories, fictional businesses in US, UK, Canada, UAE, Germany, Australia, Pakistan, sample branch locations, and customer reviews):

```bash
# 1. Build the shared schemas package
npm run build:shared

# 2. Run the seed script
npm run seed
```

---

## 4. Running the Development Servers

```bash
# Starts both Express API (:5000) and Next.js Frontend (:3000) concurrently
npm run dev
```

You can also run them independently if desired:
```bash
# Terminal 1: Run Express API
npm run dev:api

# Terminal 2: Run Next.js Frontend
npm run dev:web
```

---

## 5. Seed Test Accounts

| Account | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@bizlistplace.com` | `AdminPass123!` | Access to `/admin`, approve/reject listings, feature controls, audit logs |
| **Business Owner** | `owner@bizlistplace.com` | `OwnerPass123!` | Access to `/dashboard`, add branch locations, edit business profiles |
| **Consumer / Reviewer**| `user@bizlistplace.com` | `UserPass123!` | Public profile browsing, writing reviews |
