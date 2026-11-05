# BizPocketHub — Worldwide Verified Business Directory Platform

BizPocketHub is an enterprise-grade, production-oriented, worldwide business directory platform built as a clean TypeScript monorepo with Next.js (App Router, Tailwind CSS, Server Components) and Express.js REST API with Mongoose and MongoDB.

---

## 🌟 Key Features

1. **Worldwide Directory Architecture:**
   - Standardized on ISO 3166-1 country codes and multi-branch physical locations.
   - Comprehensive category hierarchies with aggregated business counts.
   - Geo-indexed branch locations (`2dsphere`) supporting physical premises, service-area businesses, and digital-only entities.

2. **Full Listing Lifecycle & Moderation:**
   - Visitors and business owners register and submit listings.
   - Submissions enter a `pending` state; only admin-reviewed and approved listings are published to the public search index.
   - Administrative portal with live metrics, approval/rejection queues, claim verification, and security audit logs.

3. **Ownership Claims & Trust Verification:**
   - Unclaimed listings display prominent claim funnels.
   - Corporate owners submit claim evidence; administrators verify credentials before transferring ownership.
   - Verified badges backed by transparent documentation explanations.

4. **Technical SEO First:**
   - Next.js Server Components by default with HTTP 404 handling.
   - Schema.org JSON-LD structured data (`LocalBusiness`, `Organization`, `PostalAddress`, `AggregateRating`).
   - Dynamic `sitemap.ts` and `robots.ts` indexing only published, crawl-worthy profiles.
   - Canonical URL policy and breadcrumbs.

5. **Customer Reviews with Fraud Prevention:**
   - 1-to-5 star rating system with rating aggregation.
   - Strict duplicate prevention: 1 review per authenticated user per business.
   - Business owners cannot review their own listings.

---

## 🏗 Monorepo Structure

```text
bizpockethub/
├── frontend/                    # Next.js App Router (Frontend)
│   ├── src/
│   │   ├── app/                 # (public), (auth), dashboard, admin, categories, search
│   │   ├── components/          # UI, layout, business cards, review sections, search hero
│   │   ├── lib/                 # API client, auth context
│   │   └── shared/              # Shared types, constants, and Zod schemas
│   ├── public/                  # Static assets, logos, and images
│   └── package.json
├── backend/                     # Express.js REST API (/api/v1)
│   ├── src/
│   │   ├── config/              # Environment & MongoDB connection (with auto memory-db fallback)
│   │   ├── middleware/          # Auth, roles, error handler, Zod validate
│   │   ├── modules/             # auth, businesses, categories, locations, reviews, claims, admin
│   │   ├── services/            # Search service, audit logging, email abstraction
│   │   └── scripts/seed.ts      # Development seed script with fictional global listings
│   ├── shared/                  # Common TypeScript types, constants, and Zod schemas
│   ├── docs/                    # Architecture, reference analysis, API docs, deployment guide
│   └── package.json
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the example environment configuration:
```bash
cp .env.example .env
```
*(Zero-configuration ready: The backend automatically boots an embedded in-memory MongoDB engine if a local or Atlas MongoDB URI is not active).*

### 3. Build Shared Package & Seed Database
```bash
# Build the shared schemas and types
npm run build:shared

# Seed realistic fictional global listings across 7 countries
npm run seed
```

### 4. Run Development Servers
```bash
# Runs both the Express API (:5000) and Next.js Frontend (:3000) concurrently
npm run dev
```

Visit:
- **Web Directory:** [http://localhost:3000](http://localhost:3000)
- **API Health:** [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 🔑 Demo Credentials (from Seed)

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Directory Admin** | `admin@bizpockethub.com` | `AdminPass123!` | Moderation Portal (`/admin`), full control |
| **Business Owner** | `owner@bizpockethub.com` | `OwnerPass123!` | Owner Dashboard (`/dashboard`), branch manager |
| **Verified User** | `user@bizpockethub.com` | `UserPass123!` | Public review contributor |

---

## 🧪 Testing & Validation

```bash
# Run unit & API integration test suite
npm run test

# Type check all workspaces
npm run typecheck
```

---

## 📚 Documentation Links
- [Reference Website Analysis](docs/reference-analysis.md)
- [Implementation Architecture Plan](docs/implementation-plan.md)
- [Setup & Development Guide](docs/setup-guide.md)
- [REST API Specification](docs/api-documentation.md)
- [Production Deployment Guide](docs/deployment-guide.md)
