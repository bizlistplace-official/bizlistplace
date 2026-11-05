# REST API Specification — Biz List Place

All endpoints are versioned under `/api/v1` and return standardized JSON responses.

---

## 1. Authentication (`/api/v1/auth`)

### `POST /auth/register`
Creates a new user account with role `user` or `business_owner`.
- **Body:** `{ name, email, password, role }`
- **Response:** `{ success: true, data: { user, token } }` + HttpOnly Session Cookie

### `POST /auth/login`
Authenticates an existing user and sets an HttpOnly session cookie.
- **Body:** `{ email, password }`
- **Response:** `{ success: true, data: { user, token } }`

### `POST /auth/logout`
Clears session cookies and invalidates client credentials.

### `GET /auth/me`
Retrieves current authenticated user's profile and roles. Requires valid session cookie or `Authorization: Bearer <token>`.

### `POST /auth/forgot-password`
Dispatches a password reset link to the registered email address. Generic response prevents email enumeration.

### `POST /auth/reset-password`
- **Body:** `{ token, password }`
- **Response:** Updates password hash and expires the reset token.

---

## 2. Businesses (`/api/v1/businesses`)

### `GET /businesses`
Paginated search for published business listings.
- **Query Parameters:**
  - `q`: Search keyword or company trade name.
  - `category`: Category slug or identifier.
  - `country`: 2-letter ISO-3166-1 country code (e.g. `US`, `GB`, `PK`).
  - `city`: Specific city name (e.g. `London`, `New York`).
  - `businessType`: `physical` | `service_area` | `online_only`.
  - `verifiedOnly`: `true` | `false`.
  - `sort`: `relevance` | `newest` | `rating` | `name_asc`.
  - `page`: Page index (default: `1`).
  - `limit`: Items per page (default: `12`).

### `GET /businesses/featured`
Returns up to 6 admin-curated featured published listings.

### `GET /businesses/recent`
Returns up to 8 recently approved published listings.

### `GET /businesses/:slug`
Fetches a single business profile by unique slug, including verified badge status, category details, primary/secondary branch locations, and approved customer reviews.

### `POST /businesses` (Authenticated)
Submits a new business listing. Enters `pending` status for regular users; automatically published if submitted by an `admin`.
- **Body:** `{ name, description, shortDescription, website, contactEmail, phone, categoryIds, businessType, primaryLocation }`

### `PATCH /businesses/:id` (Authenticated)
Updates listing information. Enforces listing ownership or administrator role.

### `DELETE /businesses/:id` (Authenticated)
Removes a business listing and associated branch locations. Enforces ownership or administrator role.

### `GET /businesses/:id/locations`
Lists all branch offices registered for the specified business.

### `POST /businesses/:id/locations` (Authenticated)
Adds a new branch location (office, showroom, warehouse, or customer service desk) to a business listing.

---

## 3. Categories & Locations

### `GET /categories`
Lists all active categories with calculated counts of published businesses.

### `GET /categories/:slug`
Retrieves category details and metadata.

### `GET /categories/:slug/businesses`
Paginated list of businesses registered within the category.

### `GET /locations/countries`
Aggregated list of global countries with business counts and active metropolitan cities.

### `GET /locations/cities`
Aggregated city directories with listing statistics.

---

## 4. Reviews & Claims

### `GET /businesses/:id/reviews`
Lists all approved reviews and rating scores for a business.

### `POST /businesses/:id/reviews` (Authenticated)
Submits a review with a 1-5 rating. Prevents duplicate reviews from the same user on the same business. Automatically recalculates `ratingAverage` and `reviewCount`.

### `POST /businesses/:id/claim` (Authenticated)
Submits an ownership claim for an unverified or existing business listing.
- **Body:** `{ businessEmail, phone, notes, verificationDocuments }`

---

## 5. Administration (`/api/v1/admin`) — Admin Only

- `GET /admin/stats`: Real database metrics (pending listings, published listings, users, claims, reviews).
- `GET /admin/businesses/pending`: Pending listing moderation queue.
- `PATCH /admin/businesses/:id/approve`: Approves and publishes a pending listing.
- `PATCH /admin/businesses/:id/reject`: Rejects a listing with explanation note.
- `PATCH /admin/businesses/:id/toggle-featured`: Toggles featured showcase status.
- `PATCH /admin/businesses/:id/verify`: Updates official verification status and badge notes.
- `GET /admin/claims`: Reviews pending ownership claim requests.
- `PATCH /admin/claims/:id/approve`: Transfers listing ownership to claimant and verifies profile.
- `PATCH /admin/claims/:id/reject`: Rejects claim request.
- `GET /admin/audit-logs`: Lists security and administrative action audit history.
