# BLACKFORGE API — Backend Architecture & Implementation Plan

> Standalone, production-ready backend service that powers the BLACKFORGE storefront
> (`https://khedmti-storefront.vercel.app`). This is a **greenfield Node.js/Express
> service** — it does **not** replace the storefront's Next.js app and does **not**
> clone the frontend. It exposes a versioned REST API the storefront (and a future
> admin panel / mobile client) can consume.

**Status:** Planning only. No application code is written yet. This document is the
contract we build against.

**Locked decisions (2026-06-07):**
- **Language:** TypeScript.
- **Database:** reuse the existing **Neon** instance with a **separate Postgres schema**
  for the API. The storefront already owns the `blackforge` schema, so the API uses its
  own schema **`bfapi`** to avoid clobbering the storefront's live tables. Both schemas
  live in the same database, so a later consolidation (storefront → API) is a migration,
  not a data move. (All `@@schema(...)` attributes in §5 therefore target `bfapi`.)
- **Catalog:** **digital + physical** goods — addresses, shipping, and order tracking
  are in scope (the schema already models them).

---

## 0. How this plan was produced

The feature list below was reverse-engineered from the **actual storefront source**
(`storefront/src`), not guessed from the rendered page. Every capability the live
frontend currently calls is catalogued in §1 ("Audit"), then §2 extends it to the
full target spec (variants, brands, reviews, coupons, Stripe, admin, RBAC, etc.).

---

## 1. Audit — backend features the current storefront already requires

Mapped directly from the storefront code (`server actions`, `api routes`, `lib/*`,
`prisma/schema.prisma`).

### 1.1 Authentication (today)
| Capability | Source | Notes |
|---|---|---|
| Register (email + password) | `app/login/actions.ts → registerAction` | bcrypt hash (rounds 10), unique email, captures referral code on signup |
| Login (credentials) | `app/login/actions.ts → loginAction`, `auth.ts` | Auth.js v5 Credentials, JWT session |
| Session resolution | `auth.ts` callbacks | injects `user.id` into session |
| Referral attribution at signup | `registerAction` | `?ref=CODE` → links `referredById` |
| (Planned in code comments) Google/Discord/Steam OAuth | `auth.ts` | not yet implemented |

### 1.2 Users & profile (today)
| Capability | Source |
|---|---|
| Update display name | `dashboard/settings/actions.ts → updateProfile` |
| Order stats (count, total spent) | `lib/orders.ts → getUserOrderStats` |
| Gamification state (xp, level, creditCents, streak, lastClaimAt) | `User` model |
| Referral code (lazy assign) | `dashboard/actions.ts → ensureReferralCode` |
| Daily reward claim (streak logic) | `dashboard/actions.ts → claimDaily` |

### 1.3 Catalog / products (today)
| Capability | Source |
|---|---|
| List products + filters (category, platform, rarity, maxPrice, sort) | `lib/products.ts → listProducts` |
| Sort modes: popular / price-asc / price-desc / newest | `lib/products.ts → orderByFor` |
| Product detail by slug | `getProductBySlug` |
| Related products (same category) | `getRelatedProducts` |
| Distinct platforms for filter rail | `listPlatforms` |
| Search (contains, title/platform/description) | `searchProducts` |
| Typeahead search endpoint | `app/api/search/route.ts` |

Product fields in use: `slug, title, description, platform, category, rarity,
priceCents, compareCents, instant, stock, active, imageUrl`.
Enums: `ProductCategory{GAME,ACCOUNT,GIFT_CARD,CURRENCY,SUBSCRIPTION,ACCESSORY}`,
`Rarity{COMMON,PREMIUM,LEGENDARY}`.

### 1.4 Cart (today)
- Client-side only (`lib/cart-store.ts`, Zustand). `Cart`/`CartItem` tables exist in
  the schema but are **not yet used** — checkout receives line items directly.
- **Implication:** server-side persistent cart is a net-new backend feature (§2).

### 1.5 Orders & checkout (today)
| Capability | Source |
|---|---|
| Place order (guest or logged-in) | `checkout/actions.ts → placeOrder` |
| **Server-side price re-validation** (client cannot set price) | `placeOrder` |
| Mock digital-key fulfillment for `instant` items | `mockDeliveredKey` |
| Award XP + Forge Credit on purchase | `placeOrder` |
| Pay referrer on referred user's first order | `placeOrder` |
| Order history (with items + product) | `lib/orders.ts → getUserOrders` |
| Order detail page | `app/order/[id]/page.tsx` |
| Quantity clamp (1–10) | `placeOrder` |

> **Critical gap:** payment is mocked (`status: FULFILLED` with no charge). Real
> Stripe PaymentIntent + webhook fulfillment is the single biggest net-new area.

### 1.6 Gamification (today) — `lib/gamification.ts`
XP/level (1000 xp/level), ranks (Squire→Knight→Warlord→Eclipse), `xpForOrder`
(50 + $1/xp), `creditForOrder` (5% back), daily reward (`25 + streak bonus`, capped),
referral bonus ($5 + 100 xp), derived achievements (no storage), referral code gen.

### 1.7 Wishlist (today)
`dashboard/wishlist/actions.ts → toggleWishlist` — DB-backed `WishlistItem`.

### 1.8 SEO / discovery (today)
`sitemap.ts`, `robots.ts`, Organization + Product JSON-LD, "Recommended for you"
(from purchase history), social-proof / scarcity signals on PDP.

### 1.9 Summary of **net-new** backend work vs. today
1. Real Stripe checkout + webhooks + refunds + payment history
2. Persistent server-side cart
3. Refresh-token rotation, logout, email verification, forgot/reset password
4. Google OAuth
5. RBAC (roles/permissions, admin auth)
6. Product **variants** (color/size/SKU), **brands**, **subcategories**,
   specifications, multi-image galleries, real inventory tracking
7. Reviews + ratings + moderation
8. Coupons (%/fixed, expiry, usage limits)
9. Addresses (shipping/billing)
10. Admin dashboard endpoints + sales analytics + inventory monitoring
11. Cross-cutting: Redis (cache/sessions/rate-limit/queues), Cloudinary uploads,
    full-text search, audit logs, Swagger docs, Docker, CI/CD.

---

## 2. Target feature set (full spec)

The complete feature matrix the new backend must deliver. Items marked **(exists)**
are already implemented in the storefront and are being **ported/owned by the API**;
**(new)** are net-new.

### Authentication
- Register **(exists)** · Login **(exists)** · Refresh token **(new)** · Logout **(new)**
- Forgot password **(new)** · Reset password **(new)** · Email verification **(new)**
- Google OAuth **(new)** · Admin authentication **(new, via RBAC)**

### Users
- Profile / update profile **(exists, partial)** · Change password **(new)**
- Address management **(new)** · Wishlist **(exists)**

### Products
- CRUD products **(new — admin)** · Categories **(exists)** · Subcategories **(new)**
- Brands **(new)** · Product variants **(new)** · Colors **(new)** · Sizes **(new)**
- Specifications **(new)** · Product images (gallery) **(new)** · Inventory **(new)**

### Search
- Full-text search **(new — upgrade from `contains`)** · Category/Brand/Price filters
  **(partial exists)** · Sorting **(exists)** · Pagination **(new)**

### Cart
- Add / remove / update qty / save cart **(new — server-persisted)**

### Orders
- Create **(exists, mock)** · History **(exists)** · Details **(exists)**
- Tracking **(new)** · Cancel **(new)**

### Payments
- Stripe Checkout **(new)** · Webhooks **(new)** · Refunds **(new)** · History **(new)**

### Reviews
- Reviews · Ratings · Moderation — all **(new)**

### Coupons
- Percentage / fixed / expiry / usage limits — all **(new)**

### Admin Dashboard
- User mgmt · Product mgmt · Order mgmt · Sales analytics · Coupon mgmt ·
  Inventory monitoring — all **(new)**

---

## 3. System architecture

```
                         ┌──────────────────────────────────────────────┐
                         │                  Clients                      │
                         │  Storefront (Next.js)   Admin SPA   Mobile    │
                         └───────────────┬──────────────────────────────┘
                                         │ HTTPS / JSON (REST v1)
                                         │ Bearer access-token (JWT)
                         ┌───────────────▼──────────────────────────────┐
                         │              BLACKFORGE API                   │
                         │            (Node.js + Express)                │
                         │                                               │
                         │  ┌─────────── Middleware chain ───────────┐   │
                         │  │ helmet · cors · rateLimit · bodyParser  │   │
                         │  │ requestId · auth(JWT) · rbac · validate │   │
                         │  │ audit · errorHandler                    │   │
                         │  └─────────────────────────────────────────┘  │
                         │                                               │
                         │  Routes → Controllers → Services →            │
                         │                       Repositories → Prisma   │
                         │                                               │
                         │  Modules: auth users products cart orders     │
                         │           payments reviews coupons admin      │
                         └───┬───────────┬───────────┬───────────┬───────┘
                             │           │           │           │
              ┌──────────────▼──┐  ┌─────▼─────┐ ┌───▼─────┐ ┌───▼────────┐
              │  PostgreSQL     │  │   Redis    │ │Cloudinary│ │  Stripe    │
              │  (Prisma ORM)   │  │ cache /    │ │ images   │ │ payments + │
              │  Neon / RDS     │  │ sessions / │ │ uploads  │ │ webhooks   │
              │                 │  │ ratelimit /│ │          │ │            │
              │                 │  │ BullMQ jobs│ │          │ │            │
              └─────────────────┘  └─────┬──────┘ └──────────┘ └────────────┘
                                         │
                                  ┌──────▼───────┐
                                  │ Worker (BullMQ)│  email · webhooks ·
                                  │ background jobs│  fulfillment · analytics
                                  └────────────────┘
```

**Request lifecycle:** `Route → validate(Zod) → controller → service (business rules,
transactions) → repository (Prisma) → DB`. Controllers are thin; services own logic;
repositories own data access. Cross-cutting concerns (auth, rbac, rate-limit, audit,
errors) live in middleware. This keeps the layers testable in isolation and honors
SOLID (esp. Dependency Inversion: services depend on repository interfaces).

**Runtime topology (prod):** stateless API containers behind a load balancer
(horizontally scalable), one Redis, one Postgres (pooled via PgBouncer/Neon pooler),
and a separate worker container consuming the BullMQ queues. Stripe → API via signed
webhooks.

---

## 4. Clean-architecture folder structure

```
blackforge-api/
├── src/
│   ├── modules/                  # feature-first; each module wires its own layers
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validators.ts
│   │   │   └── auth.types.ts
│   │   ├── users/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── brands/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── reviews/
│   │   ├── coupons/
│   │   ├── wishlist/
│   │   ├── addresses/
│   │   ├── search/
│   │   ├── gamification/         # ported from storefront lib/gamification.ts
│   │   └── admin/                # analytics, moderation, dashboards
│   ├── controllers/              # (thin) shared/base controllers if any
│   ├── services/                 # shared domain services (email, payment, upload, cache)
│   │   ├── email.service.ts
│   │   ├── stripe.service.ts
│   │   ├── cloudinary.service.ts
│   │   ├── cache.service.ts      # Redis wrapper
│   │   └── queue.service.ts      # BullMQ
│   ├── repositories/             # shared repo base (PrismaClient injection)
│   │   └── base.repository.ts
│   ├── middleware/
│   │   ├── authenticate.ts       # verify JWT → req.user
│   │   ├── authorize.ts          # RBAC (requireRole / requirePermission)
│   │   ├── validate.ts           # Zod schema runner
│   │   ├── rateLimit.ts
│   │   ├── audit.ts              # write AuditLog
│   │   ├── errorHandler.ts
│   │   ├── notFound.ts
│   │   └── requestContext.ts     # requestId, logger child
│   ├── validators/               # shared Zod schemas (pagination, id params)
│   ├── routes/
│   │   └── index.ts              # mounts all module routers under /api/v1
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   ├── seed.ts
│   │   └── client.ts             # singleton PrismaClient
│   ├── utils/
│   │   ├── jwt.ts                # sign/verify access+refresh, rotation
│   │   ├── password.ts           # bcrypt hash/compare
│   │   ├── apiError.ts           # typed error class
│   │   ├── apiResponse.ts        # uniform envelope
│   │   ├── pagination.ts
│   │   └── logger.ts             # pino
│   ├── config/
│   │   ├── env.ts                # zod-validated process.env
│   │   ├── redis.ts
│   │   ├── swagger.ts
│   │   └── constants.ts
│   ├── docs/
│   │   └── openapi/              # OpenAPI fragments per module
│   ├── app.ts                    # express app (middleware + routes), no listen
│   ├── server.ts                 # http listen + graceful shutdown
│   └── worker.ts                 # BullMQ worker entrypoint
├── tests/
│   ├── unit/                     # services with mocked repos
│   ├── integration/              # supertest + test DB (Testcontainers)
│   └── fixtures/
├── prisma/                       # (alt root location; keep one — see note)
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── .github/workflows/ci.yml
├── package.json
├── tsconfig.json
└── README.md
```

> **Note:** Spec listed both `src/modules` and top-level `controllers/services/...`.
> We adopt **feature-first modules** (each module contains its own controller/service/
> repository/routes/validators) and reserve the flat `controllers/services/...` dirs
> for **shared/base** cross-module pieces only. This avoids the "split a single
> feature across six folders" friction while staying SOLID. TypeScript is used
> (not in the spec's stack list but strongly recommended — say the word to drop to JS).

---

## 5. Database design (Prisma schema)

Full schema covering every required model with relationships and indexes. Lives in
its own Postgres schema **`bfapi`** so it can share the Neon instance with both Django
(`public`) and the storefront (`blackforge`) without collisions.

```prisma
// ---------- generator / datasource ----------
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_URL_UNPOOLED")
  // API owns its own schema; storefront keeps "blackforge". Same Neon DB.
  schemas   = ["bfapi"]
}

// ---------- RBAC ----------
model Role {
  id          String           @id @default(cuid())
  name        String           @unique        // ADMIN, STAFF, CUSTOMER
  description String?
  permissions RolePermission[]
  users       User[]
  @@schema("bfapi")
}
model Permission {
  id    String           @id @default(cuid())
  key   String           @unique              // e.g. "product:write", "order:refund"
  roles RolePermission[]
  @@schema("bfapi")
}
model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  @@id([roleId, permissionId])
  @@schema("bfapi")
}

// ---------- Users / auth ----------
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  emailVerified   DateTime?
  name            String?
  image           String?
  passwordHash    String?
  roleId          String
  role            Role      @relation(fields: [roleId], references: [id])

  // gamification (ported)
  xp              Int       @default(0)
  level           Int       @default(1)
  creditCents     Int       @default(0)
  streak          Int       @default(0)
  lastClaimAt     DateTime?

  // referrals
  referralCode    String?   @unique
  referredById    String?
  referredBy      User?     @relation("Referrals", fields: [referredById], references: [id], onDelete: SetNull)
  referrals       User[]    @relation("Referrals")

  oauthAccounts   OAuthAccount[]
  refreshTokens   RefreshToken[]
  addresses       Address[]
  cart            Cart?
  orders          Order[]
  reviews         Review[]
  wishlist        WishlistItem[]
  couponUses      CouponRedemption[]
  auditLogs       AuditLog[]
  verifyTokens    VerificationToken[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([roleId])
  @@map("user")
  @@schema("bfapi")
}

model OAuthAccount {                            // Google OAuth, future Discord/Steam
  id                String @id @default(cuid())
  userId            String
  provider          String                       // "google"
  providerAccountId String
  accessToken       String?
  refreshToken      String?
  expiresAt         Int?
  user              User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
  @@map("oauth_account")
  @@schema("bfapi")
}

model RefreshToken {                            // rotation: hash stored, not raw
  id        String   @id @default(cuid())
  userId    String
  tokenHash String   @unique
  expiresAt DateTime
  revokedAt DateTime?
  replacedBy String?
  userAgent String?
  ip        String?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  @@index([userId])
  @@map("refresh_token")
  @@schema("bfapi")
}

model VerificationToken {                       // email verify + password reset
  id         String   @id @default(cuid())
  userId     String
  type       TokenType
  tokenHash  String   @unique
  expiresAt  DateTime
  consumedAt DateTime?
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, type])
  @@map("verification_token")
  @@schema("bfapi")
}
enum TokenType { EMAIL_VERIFY PASSWORD_RESET  @@schema("bfapi") }

model Address {
  id         String      @id @default(cuid())
  userId     String
  type       AddressType @default(SHIPPING)
  fullName   String
  line1      String
  line2      String?
  city       String
  state      String?
  postalCode String
  country    String
  phone      String?
  isDefault  Boolean     @default(false)
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders     Order[]
  @@index([userId])
  @@map("address")
  @@schema("bfapi")
}
enum AddressType { SHIPPING BILLING  @@schema("bfapi") }

// ---------- Catalog ----------
model Category {
  id        String     @id @default(cuid())
  slug      String     @unique
  name      String
  parentId  String?                              // self-relation = subcategories
  parent    Category?  @relation("SubCats", fields: [parentId], references: [id], onDelete: SetNull)
  children  Category[] @relation("SubCats")
  products  Product[]
  @@index([parentId])
  @@map("category")
  @@schema("bfapi")
}

model Brand {
  id       String    @id @default(cuid())
  slug     String    @unique
  name     String
  logoUrl  String?
  products Product[]
  @@map("brand")
  @@schema("bfapi")
}

model Product {
  id           String           @id @default(cuid())
  slug         String           @unique
  title        String
  description  String?
  platform     String?
  categoryId   String
  brandId      String?
  rarity       Rarity           @default(COMMON)
  priceCents   Int                                  // base/display price
  compareCents Int?
  instant      Boolean          @default(true)
  active       Boolean          @default(true)
  avgRating    Float            @default(0)         // denormalized for sort/filter
  reviewCount  Int              @default(0)
  searchVector Unsupported("tsvector")?             // full-text search (GIN index)

  category     Category         @relation(fields: [categoryId], references: [id])
  brand        Brand?           @relation(fields: [brandId], references: [id], onDelete: SetNull)
  variants     ProductVariant[]
  images       ProductImage[]
  specs        ProductSpec[]
  orderItems   OrderItem[]
  cartItems    CartItem[]
  reviews      Review[]
  wishlisted   WishlistItem[]

  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  @@index([categoryId])
  @@index([brandId])
  @@index([active, priceCents])
  @@index([avgRating])
  // @@index([searchVector], type: Gin)  // added via raw migration
  @@map("product")
  @@schema("bfapi")
}
enum Rarity { COMMON PREMIUM LEGENDARY  @@schema("bfapi") }

model ProductVariant {
  id         String  @id @default(cuid())
  productId  String
  sku        String  @unique
  color      String?
  size       String?
  priceCents Int?                                  // overrides product price if set
  stock      Int     @default(0)                   // real inventory lives here
  active     Boolean @default(true)
  product    Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  cartItems  CartItem[]
  orderItems OrderItem[]
  @@unique([productId, color, size])
  @@index([productId])
  @@map("product_variant")
  @@schema("bfapi")
}

model ProductImage {
  id         String  @id @default(cuid())
  productId  String
  url        String                                 // Cloudinary secure_url
  publicId   String                                 // Cloudinary public_id (for deletes)
  alt        String?
  position   Int     @default(0)
  product    Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@index([productId])
  @@map("product_image")
  @@schema("bfapi")
}

model ProductSpec {
  id        String  @id @default(cuid())
  productId String
  key       String                                  // "Region", "Activation"
  value     String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@index([productId])
  @@map("product_spec")
  @@schema("bfapi")
}

// ---------- Cart ----------
model Cart {
  id        String     @id @default(cuid())
  userId    String?    @unique                       // null = guest (keyed by token)
  guestId   String?    @unique                       // anonymous cart cookie
  items     CartItem[]
  user      User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  updatedAt DateTime   @updatedAt
  createdAt DateTime   @default(now())
  @@map("cart")
  @@schema("bfapi")
}
model CartItem {
  id        String          @id @default(cuid())
  cartId    String
  productId String
  variantId String?
  quantity  Int             @default(1)
  cart      Cart            @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
  variant   ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)
  @@unique([cartId, productId, variantId])
  @@map("cart_item")
  @@schema("bfapi")
}

// ---------- Orders ----------
model Order {
  id          String      @id @default(cuid())
  number      String      @unique                    // human-friendly BF-XXXXXX
  userId      String?
  email       String
  status      OrderStatus @default(PENDING)
  subtotalCents Int
  discountCents Int       @default(0)
  totalCents  Int
  couponId    String?
  addressId   String?
  trackingCode String?
  user        User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  coupon      Coupon?     @relation(fields: [couponId], references: [id], onDelete: SetNull)
  address     Address?    @relation(fields: [addressId], references: [id], onDelete: SetNull)
  items       OrderItem[]
  payment     Payment?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  @@index([userId])
  @@index([status])
  @@map("order")
  @@schema("bfapi")
}
enum OrderStatus { PENDING PAID FULFILLED SHIPPED REFUNDED CANCELLED  @@schema("bfapi") }

model OrderItem {
  id           String          @id @default(cuid())
  orderId      String
  productId    String
  variantId    String?
  title        String                                // snapshot at purchase time
  quantity     Int             @default(1)
  priceCents   Int                                   // snapshot price
  deliveredKey String?
  order        Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product      Product         @relation(fields: [productId], references: [id], onDelete: Restrict)
  variant      ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)
  @@index([orderId])
  @@map("order_item")
  @@schema("bfapi")
}

// ---------- Payments ----------
model Payment {
  id                    String        @id @default(cuid())
  orderId               String        @unique
  provider              String        @default("stripe")
  stripePaymentIntentId String?       @unique
  stripeChargeId        String?
  amountCents           Int
  currency              String        @default("usd")
  status                PaymentStatus @default(REQUIRES_PAYMENT)
  refundedCents         Int           @default(0)
  rawEvent              Json?
  order                 Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  @@index([status])
  @@map("payment")
  @@schema("bfapi")
}
enum PaymentStatus { REQUIRES_PAYMENT PROCESSING SUCCEEDED FAILED REFUNDED PARTIALLY_REFUNDED  @@schema("bfapi") }

// ---------- Coupons ----------
model Coupon {
  id            String       @id @default(cuid())
  code          String       @unique
  type          CouponType
  value         Int                                  // percent (1-100) or cents
  maxRedemptions Int?
  redeemedCount Int          @default(0)
  perUserLimit  Int?
  minSpendCents Int?
  startsAt      DateTime?
  expiresAt     DateTime?
  active        Boolean      @default(true)
  orders        Order[]
  redemptions   CouponRedemption[]
  createdAt     DateTime     @default(now())
  @@index([active, expiresAt])
  @@map("coupon")
  @@schema("bfapi")
}
enum CouponType { PERCENT FIXED  @@schema("bfapi") }

model CouponRedemption {
  id        String   @id @default(cuid())
  couponId  String
  userId    String
  orderId   String?
  coupon    Coupon   @relation(fields: [couponId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  @@index([couponId, userId])
  @@map("coupon_redemption")
  @@schema("bfapi")
}

// ---------- Reviews ----------
model Review {
  id         String       @id @default(cuid())
  productId  String
  userId     String
  rating     Int                                     // 1..5 (validated in service)
  title      String?
  body       String?
  status     ReviewStatus @default(PENDING)          // moderation
  product    Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  user       User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
  @@unique([productId, userId])                       // one review per user/product
  @@index([productId, status])
  @@map("review")
  @@schema("bfapi")
}
enum ReviewStatus { PENDING APPROVED REJECTED  @@schema("bfapi") }

// ---------- Wishlist ----------
model WishlistItem {
  id        String   @id @default(cuid())
  userId    String
  productId String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  @@unique([userId, productId])
  @@map("wishlist_item")
  @@schema("bfapi")
}

// ---------- Audit ----------
model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String                                  // "product.update", "order.refund"
  entity     String?
  entityId   String?
  metadata   Json?
  ip         String?
  userAgent  String?
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  createdAt  DateTime @default(now())
  @@index([userId])
  @@index([entity, entityId])
  @@map("audit_log")
  @@schema("bfapi")
}
```

### Key relationships
- `User → Role` (RBAC), `Role ↔ Permission` (many-to-many via `RolePermission`).
- `User 1—* Address / Order / Review / WishlistItem / RefreshToken`, self-relation for **referrals**.
- `Category` self-relation = **subcategories**; `Product → Category`, `Product → Brand?`.
- `Product 1—* ProductVariant / ProductImage / ProductSpec`.
- `Cart 1—* CartItem`; `CartItem → Product (+ optional Variant)`.
- `Order 1—* OrderItem`, `Order 1—1 Payment`, `Order → Coupon? / Address?`.
- `Coupon 1—* CouponRedemption` enforces per-user + global usage limits.

### Indexing strategy
- Unique business keys: `slug`, `sku`, `coupon.code`, `order.number`, `email`.
- Filter/sort hot paths: `product(active, priceCents)`, `product(avgRating)`, `order(status)`, `coupon(active, expiresAt)`.
- Full-text: GIN index on `product.searchVector` (raw migration; tsvector over title+description+platform).
- FK lookups indexed (`categoryId`, `brandId`, `userId`, `orderId`, …).

---

## 6. API endpoints (REST v1)

Base path: `/api/v1`. Auth via `Authorization: Bearer <accessToken>`. Uniform
response envelope: `{ success, data, error, meta }`. `🔒` = auth required,
`👑` = admin/permission required.

### Auth — `/auth`
| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | create account (+ optional `?ref` code) |
| POST | `/auth/login` | email+password → access + refresh tokens |
| POST | `/auth/refresh` | rotate refresh → new access+refresh |
| POST | `/auth/logout` 🔒 | revoke current refresh token |
| POST | `/auth/forgot-password` | email reset link |
| POST | `/auth/reset-password` | consume token, set new password |
| POST | `/auth/verify-email` | consume email-verify token |
| POST | `/auth/resend-verification` 🔒 | new verify email |
| GET | `/auth/google` | start Google OAuth |
| GET | `/auth/google/callback` | finish OAuth, issue tokens |
| GET | `/auth/me` 🔒 | current user + role |

### Users — `/users`
| GET `/users/me` 🔒 · PATCH `/users/me` 🔒 (profile) · POST `/users/me/change-password` 🔒 |
| Addresses: GET/POST `/users/me/addresses` 🔒 · PATCH/DELETE `/users/me/addresses/:id` 🔒 |
| Wishlist: GET `/users/me/wishlist` 🔒 · POST/DELETE `/users/me/wishlist/:productId` 🔒 (toggle) |
| Gamification: GET `/users/me/gamification` 🔒 · POST `/users/me/daily-claim` 🔒 · GET `/users/me/referral` 🔒 |

### Products — `/products`
| GET | `/products` | list + filter (`category, brand, platform, rarity, minPrice, maxPrice, sort, q, page, limit`) |
| GET | `/products/:slug` | detail (variants, images, specs, approved reviews summary) |
| GET | `/products/:slug/related` | same-category recommendations |
| GET | `/products/:slug/reviews` | approved reviews (paginated) |
| POST | `/products` 👑 | create |
| PATCH | `/products/:id` 👑 | update |
| DELETE | `/products/:id` 👑 | soft-delete (`active=false`) |
| POST | `/products/:id/images` 👑 | upload (Cloudinary, multipart) |
| DELETE | `/products/:id/images/:imageId` 👑 | remove image |
| POST/PATCH/DELETE | `/products/:id/variants[/:variantId]` 👑 | variant CRUD |

### Categories / Brands
| GET `/categories` (tree) · CRUD `/categories` 👑 · GET `/brands` · CRUD `/brands` 👑 |

### Search — `/search`
| GET | `/search?q=` | full-text typeahead (name kept compatible with storefront's `{slug,title,platform,priceCents}`) |
| GET | `/search/suggest?q=` | lightweight suggestions |

### Cart — `/cart`
| GET `/cart` (user or guest token) · POST `/cart/items` (add) · PATCH `/cart/items/:id` (qty) · DELETE `/cart/items/:id` · POST `/cart/merge` 🔒 (merge guest→user on login) |

### Coupons — `/coupons`
| POST `/coupons/validate` (code, cartTotal) → discount preview · CRUD `/coupons` 👑 |

### Orders — `/orders`
| POST | `/orders` 🔒/guest | create order from cart (server re-prices, applies coupon) → returns order + Stripe client secret |
| GET | `/orders` 🔒 | history (paginated) |
| GET | `/orders/:id` 🔒 | detail (+ delivered keys when fulfilled) |
| GET | `/orders/:id/track` 🔒 | status/tracking |
| POST | `/orders/:id/cancel` 🔒 | cancel if not yet fulfilled |
| GET | `/orders` 👑 (admin scope) · PATCH `/orders/:id/status` 👑 |

### Payments — `/payments`
| POST | `/payments/create-intent` | Stripe PaymentIntent for an order |
| POST | `/payments/webhook` | **Stripe webhook** (raw body, signature-verified) → mark paid + fulfill + gamify |
| GET | `/payments/history` 🔒 | user payment history |
| POST | `/payments/:id/refund` 👑 | full/partial refund |

### Reviews — `/reviews`
| POST `/reviews` 🔒 (must own a delivered order of the product) · PATCH/DELETE `/reviews/:id` 🔒 (own) · GET `/reviews/pending` 👑 · PATCH `/reviews/:id/moderate` 👑 (approve/reject) |

### Admin — `/admin`
| GET `/admin/users` 👑 (search/paginate) · PATCH `/admin/users/:id/role` 👑 |
| GET `/admin/analytics/sales` 👑 (revenue, AOV, top products, by period) |
| GET `/admin/analytics/inventory` 👑 (low-stock alerts) |
| GET `/admin/audit-logs` 👑 |

### Docs / ops
| GET `/docs` (Swagger UI) · GET `/openapi.json` · GET `/health` (liveness) · GET `/ready` (DB+Redis) |

### Example request/response (one canonical sample)
**POST `/api/v1/orders`** (logged-in)
```jsonc
// request
{ "addressId": "addr_123", "couponCode": "FORGE10" }
// 201 response
{
  "success": true,
  "data": {
    "order": { "id": "ord_abc", "number": "BF-7F3K9Q", "status": "PENDING",
               "subtotalCents": 5998, "discountCents": 600, "totalCents": 5398 },
    "payment": { "clientSecret": "pi_..._secret_...", "amountCents": 5398 }
  },
  "error": null, "meta": null
}
// 400 (coupon expired)
{ "success": false, "data": null,
  "error": { "code": "COUPON_EXPIRED", "message": "This coupon has expired." } }
// 401 / 403 / 404 / 422 / 429 follow the same error envelope
```

### Swagger/OpenAPI structure
- `src/config/swagger.ts` assembles the spec; each module ships an OpenAPI fragment in
  `src/docs/openapi/<module>.ts` (paths + component schemas) **derived from the same Zod
  validators** via `zod-to-openapi` (single source of truth → no drift).
- Served at `/docs` (Swagger UI) and `/openapi.json`. Tagged by module. Security scheme:
  `bearerAuth` (HTTP bearer JWT).

---

## 7. Security implementation

| Concern | Implementation |
|---|---|
| Rate limiting | `express-rate-limit` + Redis store; strict bucket on `/auth/*` (e.g. 5/min/IP), global default bucket |
| HTTP hardening | `helmet` (CSP, HSTS, no-sniff, frameguard) |
| CORS | `cors` with explicit allowlist (storefront + admin origins), credentials only where needed |
| Input validation | `zod` on every body/query/param via `validate` middleware; reject unknown keys |
| XSS | output is JSON (no SSR HTML); sanitize free-text (review body) with `sanitize-html`; CSP header |
| SQL injection | Prisma parameterized queries only; raw SQL (FTS) uses `$queryRaw` tagged templates |
| Password hashing | `bcrypt` (cost 12); never log/return hashes |
| JWT rotation | short-lived access (15m) + rotating refresh (7d, hashed in DB, single-use, reuse-detection revokes family) |
| Secrets | `config/env.ts` zod-validates all env at boot; fail fast if missing |
| Audit logs | `audit` middleware records mutating admin actions + auth events to `AuditLog` |
| Webhooks | Stripe signature verification on raw body; idempotency keys to dedupe events |
| Authorization | `authorize(permission)` middleware checks role→permission set (RBAC); ownership checks in services |
| Misc | request size limits, `hpp` (param pollution), disable `x-powered-by`, structured pino logs w/ redaction |

---

## 8. Payments flow (Stripe) — replacing the mock

1. Client `POST /orders` → service re-prices cart from DB (never trusts client),
   applies coupon, creates `Order(PENDING)` + `Payment(REQUIRES_PAYMENT)` and a Stripe
   **PaymentIntent**, returns `clientSecret`.
2. Client confirms payment with Stripe.js.
3. Stripe → `POST /payments/webhook` (`payment_intent.succeeded`): verify signature,
   idempotently mark `Payment.SUCCEEDED` + `Order.PAID→FULFILLED`, generate/issue
   digital keys (from a key vault, not random), then enqueue: gamification awards
   (XP/credit/referrer payout — ported from current `placeOrder`), confirmation email.
4. Refunds: `POST /payments/:id/refund` 👑 → Stripe refund → webhook updates
   `refundedCents` + status; restock inventory; audit log.

This keeps the **server-authoritative pricing** guarantee the storefront already has,
and moves fulfillment/side-effects to idempotent, queue-backed handlers.

---

## 9. DevOps

### Environment variables (`.env.example`)
```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://...&schema=blackforge
DATABASE_URL_UNPOOLED=postgresql://...   # migrations
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SMTP_URL=...               # or Resend/SES key
CORS_ORIGINS=https://khedmti-storefront.vercel.app,http://localhost:3000
```

### Docker
- **Dockerfile**: multi-stage (deps → build → runtime), non-root user, `node:22-alpine`,
  `prisma generate` at build, `prisma migrate deploy` on container start (entrypoint),
  healthcheck on `/health`.
- **docker-compose.yml** (local): `api`, `worker`, `postgres:16`, `redis:7`, optional
  `mailhog`. Volumes for pg data; api depends_on healthchecks.

### CI/CD (`.github/workflows/ci.yml`)
1. **lint** (eslint + prettier check) → 2. **typecheck** (`tsc --noEmit`) →
3. **test** (spin Postgres+Redis services, `prisma migrate deploy`, run unit+integration) →
4. **build** Docker image → 5. **push** to registry (GHCR) → 6. **deploy** (staging on
   `main`, prod on tag/manual approval). Migrations run as a release step before traffic
   shift. Secrets via GitHub Environments.

### Production deployment strategy
- Stateless API + worker containers on a container platform (Render/Railway/Fly/ECS),
  autoscaled; Neon/managed Postgres with pooler; managed Redis (Upstash).
- Zero-downtime: `migrate deploy` (expand/contract migrations) → rolling deploy →
  health gated. Stripe webhook endpoint registered to prod URL.
- Observability: pino → log drain; `/health` + `/ready` probes; Sentry for errors;
  Stripe + queue dashboards.

---

## 10. Development roadmap & sprint plan

Assumes **2-week sprints**, 1–2 backend engineers. Test-driven throughout (services
unit-tested with mocked repos; routes integration-tested with a real test DB).

| Sprint | Theme | Deliverables | Exit criteria |
|---|---|---|---|
| **0 — Foundations** (wk 1) | Scaffolding | TS+Express skeleton, `config/env`, Prisma+Postgres+Redis wired, Docker compose, logger, error/response envelope, health checks, Swagger shell, CI green | App boots, `/health` ok, CI passes |
| **1 — Auth & RBAC** (wk 2–3) | Identity | register/login/refresh/logout, JWT rotation, email verify, forgot/reset, Role/Permission seed, `authenticate`+`authorize` middleware, audit log | Full auth suite tested; protected route demo |
| **2 — Catalog** (wk 4–5) | Products | Product/Category/Brand/Variant/Image/Spec CRUD, Cloudinary upload, list+filter+sort+**pagination**, full-text search, related products | Storefront can list/detail products against API |
| **3 — Cart & Coupons** (wk 6) | Pre-checkout | server cart (user+guest+merge), coupon validate + admin CRUD + limits | Cart persists; coupon discount preview works |
| **4 — Orders & Payments** (wk 7–8) | Money | order create (server re-price), Stripe intent + **webhook** fulfillment, key delivery, gamification port (XP/credit/referrer), order history/detail/cancel/track, refunds | End-to-end test purchase in Stripe test mode |
| **5 — Reviews & Gamification** (wk 9) | Engagement | reviews + ratings + moderation, denormalized `avgRating`, daily claim, referral endpoints, achievements | Verified-purchase review + moderation flow |
| **6 — Admin & Analytics** (wk 10) | Operations | user/role mgmt, sales analytics, inventory monitoring, audit-log browse | Admin dashboards return real metrics |
| **7 — Hardening & Launch** (wk 11–12) | Production | rate-limit tuning, security pass (OWASP), load test, complete Swagger, runbooks, prod deploy + Stripe webhook live, monitoring | Pen-test checklist clear; prod smoke test green |

### Estimated timeline
- **~12 weeks (6 sprints + foundations + hardening)** for one engineer to full prod.
- **~7–8 weeks** with two engineers (parallelize: catalog vs. auth, then payments vs.
  reviews/admin).
- MVP that can power the *current* storefront (auth, catalog, cart, orders, real
  payments) lands end of **Sprint 4 (~wk 8)**; Sprints 5–7 add the expanded spec.

---

## 11. Implementation strategy (principles)

- **TDD per module:** write the service test against the repository interface first,
  then implement; integration-test the route. Keeps controllers thin and logic covered.
- **SOLID via DI:** services receive repositories through constructors/factory so they
  mock cleanly and swap implementations (e.g. cache-decorated repo).
- **Single source of truth:** Zod schemas drive both runtime validation *and* the
  OpenAPI spec; Prisma is the only data gateway.
- **Idempotency everywhere money moves:** webhook + fulfillment handlers are safe to
  replay.
- **Port, don't rewrite, proven logic:** the gamification rules and server-authoritative
  pricing already validated in the storefront move over verbatim into
  `modules/gamification` and the orders service.
- **Migrate incrementally:** the storefront can adopt the API endpoint-by-endpoint
  (e.g. point search at `/api/v1/search` first) while the rest stays on its current
  server actions — no big-bang cutover.

---

## 12. Decisions & remaining open questions

**Resolved (2026-06-07):**
1. **Language:** ✅ TypeScript.
2. **Database:** ✅ reuse the same Neon instance, API gets its own schema **`bfapi`**
   (separate from storefront's `blackforge` and Django's `public`).
3. **Catalog/shipping:** ✅ digital **+ physical** — addresses, shipping, tracking in scope.

**Still open (needed before/around the relevant sprint, not blocking Sprint 0):**
4. **Email provider:** Resend / SES / SMTP? (needed by Sprint 1 — verification + reset)
5. **Relationship to the existing Django `backend/`:** replace eventually or coexist?
6. **Hosting target** for the container (Render/Railway/Fly/AWS) — shapes CI deploy step
   (needed by Sprint 7).
7. **Payment regions/currency:** USD-only or multi-currency? Tax/VAT handling? (Sprint 4)
```
