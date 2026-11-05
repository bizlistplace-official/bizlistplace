# Implementation Plan — Biz List Place

## 1. Executive Summary
Biz List Place is an enterprise-grade, production-ready, worldwide business directory platform built as a clean TypeScript monorepo with Next.js (App Router, Tailwind CSS, Server Components) and Express.js REST API with Mongoose and MongoDB.

---

## 2. Monorepo Architecture

```text
bizpockethub/
├── apps/
│   ├── web/                     # Next.js (App Router, Tailwind CSS, TypeScript, Server Components)
│   │   ├── src/
│   │   │   ├── app/             # (public), (auth), dashboard, admin, etc.
│   │   │   ├── components/      # UI, layout, business, search, forms
│   │   │   ├── lib/             # API client, auth session helpers, utils
│   │   │   └── types/
│   ├── api/                     # Express.js REST API (/api/v1)
│   │   ├── src/
│   │   │   ├── config/          # Environment, database, constants
│   │   │   ├── middleware/      # Auth, roles, error handler, rate limit, validate
│   │   │   ├── modules/         # auth, businesses, categories, locations, reviews, claims, admin
│   │   │   ├── services/        # Email abstraction, storage/upload abstraction, search service
│   │   │   ├── app.ts
│   │   │   └── server.ts
├── packages/
│   ├── shared/                  # Common Zod schemas, TypeScript types, constants
│   │   ├── src/
│   │   │   ├── schemas/
│   │   │   ├── types/
│   │   │   └── constants/
├── docs/                        # Architecture, reference analysis, API docs, deployment
├── tests/                       # Integration, unit, and e2e tests
├── package.json
└── README.md
```

---

## 3. Database Schema Design (Mongoose)

1. **User:**
   - `name`, `email` (unique, lowercase), `passwordHash`, `role` (`user`, `business_owner`, `admin`), `accountStatus` (`active`, `suspended`), `emailVerifiedAt`, timestamps.
2. **Business:**
   - `name`, `slug` (unique, indexed), `ownerId` (ref User), `description`, `website`, `logoUrl`, `coverImageUrl`, `categoryIds` (ref Category), `businessType` (`physical`, `service_area`, `online_only`), `serviceAreas`, `contactEmail`, `phone`, `listingStatus` (`draft`, `pending`, `published`, `rejected`, `suspended`), `rejectionReason`, `verificationStatus` (`unverified`, `pending_verification`, `verified`), `isFeatured` (boolean, admin controlled), `publishedAt`, timestamps.
3. **BusinessLocation:**
   - `businessId` (ref Business), `branchSlug`, `branchName`, `countryCode` (ISO-3166-1 alpha-2, uppercase), `region`, `city`, `postalCode`, `addressLine1`, `addressLine2`, `isPrimary` (boolean), `location` (GeoJSON Point with 2dsphere index), `openingHours`, `timezone`.
4. **Category:**
   - `name`, `slug` (unique), `parentId` (ref Category, optional for subcategories), `icon`, `description`, `isActive`.
5. **Review:**
   - `businessId` (ref Business), `userId` (ref User), `rating` (1-5 integer), `title`, `content`, `moderationStatus` (`pending`, `approved`, `rejected`), timestamps.
6. **ClaimRequest:**
   - `businessId`, `claimantId`, `verificationDocuments`, `businessEmail`, `notes`, `status` (`pending`, `approved`, `rejected`), `reviewedBy`, timestamps.
7. **Report:**
   - `businessId`, `reporterId` (optional), `reason`, `details`, `status` (`open`, `resolved`, `dismissed`).
8. **AuditLog:**
   - `actorId`, `action`, `entityType`, `entityId`, `details`, `ipAddress`, timestamps.

---

## 4. Phased Implementation Roadmap

- **Phase 1: Foundation & Monorepo Setup**
  - Setup root `package.json` workspaces (`apps/*`, `packages/*`), TypeScript configs, shared packages.
  - Setup fallback database connectivity (MongoDB Atlas or embedded MongoDB Memory Server for self-contained, zero-friction local development & automated testing).
- **Phase 2: Express Backend (`apps/api`)**
  - Setup Express with Helmet, CORS, json parser, cookie-parser, request logging, and rate limiting.
  - Implement full `/api/v1` routes: Auth, Businesses, Locations, Categories, Reviews, Claims, Admin moderation, Audit logs.
  - Implement robust seed script (`scripts/seed.ts`) with realistic, fictional, non-deceptive sample global companies.
- **Phase 3: Next.js Frontend (`apps/web`)**
  - Setup Next.js App Router with Tailwind CSS, professional design system (Deep Navy, Slate, Teal accents).
  - Public pages: Homepage, Search with filters, Category directory & details, Country & City directories, Business details with branch locations, Claim & Add listing forms, Informational pages (About, Contact, Help, Privacy, Terms).
  - Dynamic SEO: Server Components, canonical links, metadata, JSON-LD Schema.org (`LocalBusiness`, `Organization`), `sitemap.ts`, and `robots.ts`.
- **Phase 4: Authentication, Owner Dashboard & Admin Portal**
  - Secure HttpOnly cookie auth session flow.
  - Owner dashboard: Manage listings, add branches, track review feedback, complete profile.
  - Admin dashboard: Live stats, pending approval queue, claim review, report moderation, category manager, audit logs.
- **Phase 5: Verification, Tests & Build Validation**
  - Unit & API integration tests (Supertest, Vitest).
  - Full TypeScript type-checking (`tsc --noEmit`) and production builds.
  - Comprehensive documentation (`README.md`, `docs/setup-guide.md`, `docs/api-documentation.md`).
