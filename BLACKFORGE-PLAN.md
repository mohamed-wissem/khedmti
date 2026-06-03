# BLACKFORGE — Premium Dark-Fantasy Gaming Marketplace
### Production Master Plan · v1.0
> *"Arm yourself."*

**Aesthetic North Star:** brutal medieval dark-fantasy — eclipses, ancient kingdoms, colossal swords, runes, black armor, storms. *Berserk is mood reference only.* Every asset, name, glyph, and illustration in this build is **original**. No copyrighted characters, logos, panels, or artwork are reproduced.

---

## 0. How to read this document
This is a build-ready spec for a cross-functional team (1 design lead, 2–3 frontend, 2 backend, 1 PM). Sections 1–9 are the *what & why*; Section 10 is the *when*. Hex values, type scales, component states, and stack versions are concrete on purpose — treat them as defaults to ship, not suggestions to debate.

---

# 1. Brand Identity

### 1.1 Brand name & rationale
**BLACKFORGE** — a forge is where weapons (and legends) are made; "black" sets the tone. It's short, ownable, pronounceable globally, and works as a verb in marketing ("Forged for players"). Domain target: `blackforge.gg` (the `.gg` TLD reads as "gaming").

### 1.2 Brand story
> In an age after the kingdoms fell, the great forges went cold — all but one. BLACKFORGE kept its fires lit, arming those who refuse to be ordinary. We don't sell games. We hand you the blade and point you at the dark.

The story positions the *customer as the hero* and BLACKFORGE as the **armorer** — never the protagonist. This is deliberate: marketplaces convert better when the brand is an enabler, not a star.

### 1.3 Mission
**Make every player feel armed, elite, and ahead.** Operationally: the fastest, most trustworthy place to buy games, accounts, currency, gift cards, subscriptions, and gear — with an experience that feels like gearing up before a raid, not filling a shopping cart.

### 1.4 Brand pillars
| Pillar | Meaning | Shows up as |
|---|---|---|
| **Forged** | Craft, weight, permanence | Heavy type, metal textures, "forged" copy |
| **Eclipse** | Drama, threshold, transformation | The recurring eclipse motif & hero |
| **Honor** | Trust, fairness, safety | Visible guarantees, instant delivery, reviews |
| **Ascend** | Progression, mastery | Gamification, levels, ranks |

### 1.5 Color palette
A restrained, cinematic palette — mostly black, with ember and moonlight as the emotional accents. Restraint is what makes it read "premium" instead of "edgy teen."

| Token | Hex | Use |
|---|---|---|
| `--void` | `#0A0A0C` | Page base (near-black, slightly cool) |
| `--obsidian` | `#121317` | Surfaces / cards |
| `--iron` | `#1C1E24` | Raised surfaces, inputs |
| `--ash` | `#2A2D35` | Borders, dividers |
| `--smoke` | `#8A8F9A` | Secondary text |
| `--moon` | `#E8E6E1` | Primary text (warm off-white, never pure #FFF) |
| `--ember` | `#C2410C` → `#F97316` | **Primary CTA** (blood-ember gradient) |
| `--ember-glow` | `#FF6A1A` | Hover / glow accents |
| `--blood` | `#7F1D1D` | Sale / scarcity / destructive |
| `--bronze` | `#B08D57` | Premium tier, badges, runes |
| `--rune` | `#5B8DEF` | Rare cold accent (legendary items, sparingly) |

**Rules:** Ember is for action only (buy, add, confirm). Bronze signals premium/rarity. Pure white and pure black are banned — they flatten the cinematic depth.

### 1.6 Typography system
Pairing a high-drama display face with a clean, legible workhorse for UI and a mono for prices/codes.

| Role | Family | Notes |
|---|---|---|
| **Display / H1–H2** | *Cinzel* or *Marcellus* (serif, engraved feel) | Hero, section titles. Tight tracking, uppercase for impact. |
| **UI / Body** | *Inter* or *Geist* (variable) | All interface text. Optical sizing on. |
| **Numeric / Codes** | *JetBrains Mono* | Prices, countdowns, gift-card codes, order IDs. |

**Type scale (rem, 1.250 major-third):** 0.8 / 1.0 / 1.25 / 1.563 / 1.953 / 2.441 / 3.052 / 3.815. Line-height 1.5 body, 1.1 display. Display always paired with a thin `--bronze` hairline rule for the "engraved plaque" effect.

### 1.7 Iconography style
- **Line icons**, 1.5px stroke, slightly squared joints (forged-metal feel), 24px grid. Lucide as the base set, custom-drawn for fantasy concepts (rune, sword, shield, eclipse, ember).
- **Rune accents**: a small original glyph set (8–12 marks) used as decorative dividers and rank symbols — *invented*, not real Norse/occult symbols, to avoid cultural/IP issues.
- Two-state icons: idle = `--smoke`, active/hover = `--ember` with a 4px soft glow.

### 1.8 Design language
- **Material:** brushed black metal, etched stone, faint embered edges. Surfaces have a 1px top highlight (`rgba(255,255,255,0.04)`) and bottom shadow to feel forged/raised.
- **Light:** single dramatic key light from upper-left; deep shadows. UI elements "catch" ember light on hover.
- **Shape:** 4–8px radii (sharp enough to feel weaponized, soft enough to feel premium). Corner "notches" on hero cards echo armor plating.
- **Negative space:** generous. Darkness *is* the design — let elements breathe in the void.

### 1.9 Moodboard description (for the design lead)
A single shaft of cold moonlight across a black throne room. A two-handed greatsword planted in cracked stone, ember sparks drifting up. A blood-red eclipse low on a storm horizon. Etched bronze runes catching light. Chainmail texture in extreme close-up. Cinematic film grain, teal-orange grade pushed dark. *Reference feelings: Elden Ring UI restraint, Diablo IV menus, Berserk's chiaroscuro — none copied, all reinterpreted.*

---

# 2. Complete Site Architecture

For every page: **Purpose · Key Sections · Components · Conversion goal.**

### 2.1 Homepage
- **Purpose:** Set tone in 2 seconds, route shoppers to intent, surface deals.
- **Sections:** Cinematic hero → category portals → flash deals → best sellers → popular games → trust strip → reviews → newsletter → footer.
- **Components:** `Hero3D`, `CategoryPortalGrid`, `DealCountdown`, `ProductTileRail`, `TrustStrip`, `ReviewMarquee`, `NewsletterForge`.
- **Conversion goal:** Click-through to a category/PDP within first scroll; capture email.

### 2.2 Shop / Catalog
- **Purpose:** Let players filter the entire inventory fast.
- **Sections:** Sticky filter rail, sort bar, result grid, pagination/infinite scroll, "compare" tray.
- **Components:** `FilterRail` (platform, genre, price, rarity, delivery type), `SortBar`, `ProductGrid`, `ActiveFilterChips`, `QuickViewModal`.
- **Conversion goal:** Reduce time-to-product; QuickView add-to-cart without leaving grid.

### 2.3 Product Page (PDP)
- **Purpose:** The money page — convert intent to purchase.
- **Sections:** Gallery/preview, title + rating + price block, variant/edition selector, **instant-delivery badge**, buy box (Add to Cart / Buy Now), trust accordion (delivery, warranty, refund), description, requirements/specs, "Forged with" cross-sell, reviews, recently viewed.
- **Components:** `MediaGallery`, `BuyBox` (sticky on mobile), `EditionSelector`, `DeliveryBadge`, `ScarcityMeter`, `ReviewBlock`, `CrossSellRail`, `StickyMobileBuyBar`.
- **Conversion goal:** Add-to-cart / Buy-Now rate; AOV via edition upsell + cross-sell.

### 2.4 Categories (landing per vertical)
- **Purpose:** SEO + curated entry for each product type (Games, Accounts, Gift Cards, Currency, Subscriptions, Accessories).
- **Sections:** Category hero, sub-category chips, featured/curated rails, full grid, SEO copy block, category FAQ.
- **Components:** `CategoryHero`, `SubCategoryChips`, `CuratedRail`, `SeoContentBlock`, `FaqAccordion`.
- **Conversion goal:** Organic-search capture; funnel to PDP.

### 2.5 Search Results
- **Purpose:** Instant, forgiving discovery.
- **Sections:** Search-as-you-type dropdown (products, categories, "did you mean"), full results with same filters as Shop, zero-result rescue ("no results → top sellers + contact").
- **Components:** `SearchOverlay`, `TypeaheadResults`, `EmptyStateRescue`.
- **Conversion goal:** Convert searchers (highest-intent traffic); never dead-end.

### 2.6 Cart
- **Purpose:** Hold intent, raise AOV, push to checkout.
- **Sections:** Line items, qty/edition edit, order summary, promo input, **"You're 1 item from free X" progress**, recommended add-ons, secure-checkout CTA.
- **Components:** `CartDrawer` (slide-over) + full `CartPage`, `OrderSummary`, `PromoField`, `FreeShippingMeter`, `CrossSellRail`.
- **Conversion goal:** Minimize abandonment; lift AOV via threshold + add-ons.

### 2.7 Checkout
- **Purpose:** Frictionless payment.
- **Sections:** Single-page, 3 collapsible steps (contact → payment → review), express wallets up top, trust seals, live total.
- **Components:** `ExpressPayRow` (Apple/Google Pay, PayPal), `PaymentForm`, `OrderReview`, `TrustSeals`, guest-checkout default.
- **Conversion goal:** Highest-leverage page — every removed field matters. Target <90s completion.

### 2.8 User Dashboard
- **Purpose:** Home base for returning customers; retention engine.
- **Sections:** Player card (level/XP/rank), quick stats, active subscriptions, recent orders, wallet/credit, daily reward claim, recommendations.
- **Components:** `PlayerCard`, `XpBar`, `DailyRewardModal`, `SubscriptionManager`, `OrderSnippetList`.
- **Conversion goal:** Repeat purchase, subscription renewal, daily return habit.

### 2.9 Order History
- **Purpose:** Self-serve access to purchases & digital keys.
- **Sections:** Filterable order list, order detail (keys/codes with copy + reveal, invoice, re-buy, support link).
- **Components:** `OrderTable`, `OrderDetail`, `KeyRevealCard`, `ReorderButton`.
- **Conversion goal:** Reduce support load; drive re-buy.

### 2.10 Wishlist
- **Purpose:** Capture deferred intent; remarket.
- **Sections:** Saved grid, price-drop indicators, "notify me" on restock, move-to-cart.
- **Components:** `WishlistGrid`, `PriceDropBadge`, `NotifyRestock`.
- **Conversion goal:** Convert later via price-drop/stock emails.

### 2.11 Blog / "The Codex"
- **Purpose:** SEO, authority, top-of-funnel.
- **Sections:** Featured article, category feed, article page (TOC, related products inline), author.
- **Components:** `ArticleCard`, `ArticleBody`, `InlineProductCallout`, `RelatedRail`.
- **Conversion goal:** Organic traffic → product callouts.

### 2.12 About
- **Purpose:** Trust + brand world.
- **Sections:** Brand story (Section 1.2 cinematic), stats (orders fulfilled, players armed), guarantees, team/values.
- **Conversion goal:** Trust lift for hesitant buyers.

### 2.13 Contact
- **Purpose:** Reachability = trust.
- **Sections:** Form, live-chat launcher, response-time promise, links to Support/FAQ.
- **Conversion goal:** Reduce pre-purchase anxiety.

### 2.14 Support Center
- **Purpose:** Self-serve resolution.
- **Sections:** Search, category tiles (orders, delivery, payments, accounts, refunds), ticket submission, status.
- **Conversion goal:** Deflect tickets; protect reputation.

### 2.15 FAQ
- **Purpose:** Kill objections at the source.
- **Sections:** Accordion by topic, "is this legit/safe?", delivery times, refund policy, region locks.
- **Conversion goal:** Remove last-mile doubts before checkout.

### 2.16 Login / Register
- **Purpose:** Low-friction account creation.
- **Sections:** Social auth (Google/Discord/Steam), email magic-link, benefits reminder ("save XP, track orders"), guest-continue.
- **Components:** `AuthCard`, `SocialAuthRow`, `MagicLinkForm`.
- **Conversion goal:** Account creation without blocking purchase (guest-first).

---

# 3. Homepage Master Layout (wireframe + conversion logic)

```
┌───────────────────────────────────────────────────────────────┐
│ TOPBAR: ⚔ BLACKFORGE   [Games][Accounts][Cards][Currency][Subs] │  ← persistent search + cart + level
│         🔍 search…                         ⛨ Lvl12  🛒 (3)  ◐    │
├───────────────────────────────────────────────────────────────┤
│                                                                 │
│      ░░░ HERO — cinematic dark-fantasy scene ░░░                │
│      • animated blood-eclipse (canvas/WebGL)                    │
│      • drifting fog layers + floating ash embers                │
│      • greatsword silhouette planted center                     │
│                                                                 │
│        FORGED FOR PLAYERS WHO REFUSE TO LOSE                    │
│        Games · Accounts · Currency — delivered instantly.       │
│        [  SHOP NOW  ▸ ]   [  Today's Deals  ]                   │
│                                                                 │
├───────────────────────────────────────────────────────────────┤
│ CATEGORY PORTALS (6 armor-plate tiles, hover = ember ignite)    │
│ [Games] [Accounts] [Gift Cards] [Currency] [Subscriptions] [Gear]│
├───────────────────────────────────────────────────────────────┤
│ ⚡ FLASH DEALS   ⏳ 03:42:11   (live countdown, scarcity meter)  │
│ [tile][tile][tile][tile]  → horizontal rail                     │
├───────────────────────────────────────────────────────────────┤
│ 🏆 BEST SELLERS        rail → [tile][tile][tile][tile]          │
├───────────────────────────────────────────────────────────────┤
│ 🔥 POPULAR GAMES       rail → [tile][tile][tile][tile]          │
├───────────────────────────────────────────────────────────────┤
│ TRUST STRIP: ⚡Instant Delivery · 🛡 Buyer Protection ·          │
│              ★4.9/5 (12,480) · 🔒 Secure Pay · ↺ Refund Guard    │
├───────────────────────────────────────────────────────────────┤
│ ⭐ REVIEWS — auto-scrolling marquee of verified ratings          │
├───────────────────────────────────────────────────────────────┤
│ NEWSLETTER "JOIN THE FORGE" — email + "get 5% + 100 XP"         │
├───────────────────────────────────────────────────────────────┤
│ FOOTER — columns, payment logos, socials, trust seals, legal    │
└───────────────────────────────────────────────────────────────┘
```

**How each section drives conversion:**
- **Hero** — establishes premium trust in <2s (perceived quality = price tolerance ↑); dual CTA splits "browsers" vs "deal-hunters" so both find a path. Eclipse/fog motion creates *cinematic dwell time* without blocking the CTA (text never sits on busy motion).
- **Category portals** — intent routing above the fold; shortens the path to PDP, the #1 lever on marketplaces with many verticals.
- **Flash deals + countdown** — urgency & scarcity (loss aversion); the live timer is the single highest-CTR module on most stores.
- **Best sellers** — social proof + decision shortcut ("others bought this") reduces choice paralysis.
- **Popular games** — recognition-driven clicks; familiar titles lower entry friction.
- **Trust strip** — directly attacks the #1 objection in digital-goods ("is this safe/instant?"); placing it before reviews primes credibility.
- **Reviews marquee** — concrete social proof; verified badges beat star averages alone.
- **Newsletter** — captures the 95%+ who won't buy on visit one; XP+discount doubles incentive (immediate + gamified).
- **Footer** — payment & security logos are a final trust reassurance; SEO link equity.

---

# 4. Visual Design System (components & motion)

> Built as a token-driven library (see §8). Every component has: idle · hover · active · focus-visible · disabled · loading states.

### Buttons
- **Primary** (`--ember` gradient): heavy, 48px, 8px radius, 1px inner highlight. **Hover:** brightness +8%, 6px ember glow, label letter-spacing +0.5px (200ms). **Active:** scale 0.98. **Loading:** label → forging spinner (sparks).
- **Secondary** (ghost): `--ash` border, `--moon` text. Hover: border → `--ember`, faint glow.
- **Tertiary/link:** underline-on-hover with ember.

### Cards / Product tiles
- Obsidian surface, 1px top highlight, armor-notch top-right corner. **Hover:** lift `translateY(-4px)`, ember edge-glow, cover image parallax 4%, quick-actions (♥ wishlist, 👁 quick view) fade in. Rarity ribbon (`--bronze`/`--rune`) for premium/legendary. Price in mono; original price struck in `--smoke`.

### Navigation
- Sticky topbar, blurred `--void/80` backdrop on scroll, shrinks 72→56px. Mega-menu per category (slide+fade 180ms) with featured product preview. Mobile: full-screen forge-door overlay menu.

### Dropdowns / Selects
- Dark glass panel, 8px radius, item hover = `--iron` + ember left-marker. Keyboard-navigable, 150ms stagger reveal.

### Modals (QuickView, Daily Reward, Auth)
- Backdrop `--void/70` + blur, panel scales 0.96→1 + fades (220ms, ease-out-back). Focus-trapped, ESC/click-out close, scroll-locked.

### Forms / Inputs
- `--iron` fill, `--ash` border, 44px. **Focus:** border `--ember` + 4px soft ring. Inline validation (✓ ember-bronze / ✕ blood). Floating labels. Error text mono, never red-on-black harsh — use `--blood` desaturated.

### Motion language (global)
- **Hover:** 150–220ms, ease-out. **Entrance:** 300–500ms with 40–60ms stagger. **Loading:** skeleton shimmer in `--iron`→`--ash`, plus the ember "forge spark" spinner for actions.
- **Micro-interactions:** add-to-cart → tile sparks + cart icon pulse + count roll; wishlist → heart ember-fill; reward claim → coin burst.
- **Accessibility:** all motion respects `prefers-reduced-motion` (cuts to instant/opacity-only).

---

# 5. Dynamic Background System

**Goal:** an original, elegant, *subtle* living backdrop — atmosphere, not clutter. Layered, GPU-cheap, 60fps, mobile-degraded.

### Layered architecture (back → front)
1. **Base gradient + grain** — CSS radial `--void`→`#06060A`, static SVG/PNG grain (no JS cost).
2. **Parallax fog** — 2–3 pre-rendered fog PNGs drifting via CSS `transform: translate3d` keyframes (8–40s loops). GPU-composited, zero JS.
3. **Eclipse glow** — single absolutely-positioned radial-gradient with a slow opacity/scale "breathe" (CSS, 12s). On homepage hero it's a higher-fidelity canvas; elsewhere it's pure CSS.
4. **Embers/ash particles** — lightweight `<canvas>` (or `tsParticles`) with **capped 25–40 particles desktop / 12 mobile**, additive blend, ember color, upward drift + slight sway. Paused when tab hidden (`visibilitychange`) and off-screen (IntersectionObserver).
5. **Rare event layer** — *occasional* flourishes, never looping noise:
   - faint **rune** fades in/out at a random edge every ~25–40s (opacity ≤0.15),
   - distant **lightning** flash on storm sections (1 frame brighten every ~30–60s),
   - **sword silhouette** parallax only in hero.

### Performance contract
- Hero WebGL (Section 9) is the only heavy layer and is **lazy-mounted, intersection-gated, and replaced by a static cinematic poster** on mobile/low-power (`navigator.hardwareConcurrency`, `prefers-reduced-motion`, save-data).
- Everything else is CSS transforms/opacity (compositor-only — no layout/paint).
- Particle canvas: single rAF loop, fixed particle pool (no GC churn), DPR-capped at 2.
- **Budget:** background ≤ 2% CPU idle desktop, no jank on a mid Android; total background weight ≤ 250KB.

---

# 6. Gamification System (retention engine)

| Mechanic | What it does | Retention effect |
|---|---|---|
| **XP points** | Earn on purchase, review, referral, daily visit | Turns spending into progress → variable-reward dopamine loop |
| **Levels & ranks** (Squire→Knight→Warlord→Eclipse) | Visible rank on profile + reviews | Status & sunk-cost identity → players don't abandon a leveled account |
| **Achievement badges** | "First Blade," "Big Spender," "Reviewer," "Night Owl" | Collection drive → repeat actions to complete sets |
| **Loyalty rewards (Forge Credit)** | XP/levels unlock store credit & tier perks (free delivery, early flash access) | Tangible ROI on loyalty → higher LTV, switching cost ↑ |
| **Daily rewards** | Claim escalating reward on consecutive logins (streak) | Habit formation; streak loss-aversion drives daily return |
| **Referral system** | Unique link → both parties get XP + credit on friend's first order | Viral CAC reduction; social proof from trusted source |

**Design guardrails:** rewards must feel *earned and fair* (no dark-pattern hostage tactics), credits have clear value, and gamification never blocks core shopping. Streaks forgive 1 missed day/week (reduces rage-quit churn). All progression visible on the `PlayerCard` (Section 2.8) for constant reinforcement.

---

# 7. Conversion Optimization

### Psychological triggers
- **Loss aversion** — flash timers, "low stock," "price ends soon."
- **Social proof** — verified reviews, "1,240 bought this week," live "someone in {city} just bought."
- **Authority** — guarantees, security seals, editorial Codex content.
- **Reciprocity** — newsletter gift (5% + XP), daily rewards.
- **Commitment/consistency** — gamified progress, wishlist, saved carts.
- **Anchoring** — show original price struck-through; lead premium edition first.

### Scarcity systems
Real, honest scarcity only: live stock counts on limited accounts/keys, flash-deal countdowns, "X left at this price" tiers, seasonal/eclipse-event drops. *Never fake timers* — trust is the asset.

### Trust-building
Instant-delivery badges, buyer-protection guarantee, transparent refund policy, verified-review system, visible support response time, security/payment logos, real order counters, SSL/seal, region-lock clarity.

### Product recommendation system
- **Homepage/PDP rails:** "Best sellers," "Popular," "Forged with" (frequently bought together).
- **Engine:** start rules-based (category + co-purchase + popularity), evolve to collaborative-filtering (viewed/bought vectors) once data volume allows. Personalized "For You" rail on dashboard from browse/purchase history.

### Upselling
- Edition ladder on PDP (Standard → Deluxe → Ultimate) with value-framed deltas ("+Season Pass, save 15%").
- Subscription upsell ("buy 3 mo → 12 mo saves 30%").
- Post-add "complete your loadout" modal.

### Cross-selling
- "Forged with" bundle on PDP & cart (game + currency + gift card).
- Cart threshold meter ("$8 from free delivery / +200 XP").
- Order-confirmation cross-sell email (accessories/subscriptions).

---

# 8. Technical Architecture

> **Context:** you already have a Django API + Neon Postgres + Vercel from the current project. The recommendation **reuses Neon and Vercel** and proposes the storefront as a **Next.js app** (SEO + performance are non-negotiable for commerce — a client-only Vite SPA would bleed organic traffic and Core Web Vitals). Django can remain as an optional headless admin/service or be folded into Next API routes — decision flagged below.

| Layer | Recommendation | Why |
|---|---|---|
| **Framework** | **Next.js 16 (App Router, RSC, PPR)** + TypeScript | SSR/SSG for SEO + fast TTFB; partial-prerender for dynamic price/stock on cached pages |
| **UI** | Tailwind CSS + shadcn/ui (themed to BLACKFORGE tokens) + Radix primitives | Token-driven, accessible, fast to build |
| **State/Data** | TanStack Query + Zustand (cart/UI) | Server-cache + light client state |
| **Animation** | Framer Motion (UI), GSAP + ScrollTrigger (scroll cinematics), Three.js/R3F (hero only) | See §9 |
| **Backend** | Next.js Route Handlers + a typed service layer; **or** keep Django headless | Start integrated for velocity; extract services if scale demands |
| **Commerce core** | **Medusa.js** (open-source, JS-native) *or* custom on Postgres | Medusa gives carts, orders, payments, regions out-of-box; custom if requirements are simple |
| **Database** | **Neon Postgres** (already provisioned) + Prisma ORM | Reuse existing infra; Prisma for type-safe schema/migrations |
| **Search** | Typesense or Algolia | Instant typeahead, typo-tolerance, faceting |
| **Auth** | Auth.js (NextAuth) with Google/Discord/Steam + email magic-link | Social-first lowers friction; Steam/Discord fit the audience |
| **Payments** | **Stripe** (cards, wallets, Apple/Google Pay) + **PayPal**; crypto (Coinbase Commerce) optional | Stripe = best DX + wallets; PayPal trust for gaming demo |
| **Digital delivery** | Keys/codes vault (encrypted at rest), instant fulfillment service, webhook on payment success | Core to "instant delivery" promise |
| **Media/CDN** | Vercel Edge + Next/Image; large art on Cloudflare R2 / Bunny CDN | Fast global art delivery |
| **Hosting** | Vercel (frontend + edge); Neon (DB); optional Railway/Fly for Medusa/Django | Matches current setup |
| **Email/Notif** | Resend (transactional) + Customer.io/Klaviyo (lifecycle) | Order emails + remarketing |
| **Analytics** | Vercel Analytics + PostHog (events, funnels, A/B) | Conversion instrumentation from day 1 |

### Security measures
HTTPS-only + HSTS; secrets in env (never client); **PCI handled by Stripe** (no raw card data touches servers); encrypt key/code vault (AES-GCM, KMS-managed); rate-limit auth + checkout (Vercel Firewall / WAF, see your existing project); CSRF on mutations; input validation (Zod) server-side; signed webhooks; RBAC on admin; fraud checks (Stripe Radar) for high-risk digital goods; audit logs; bot protection on flash drops; region-lock enforcement server-side; GDPR/CCPA data flows.

---

# 9. Animation Strategy

**Principle:** motion serves story and feedback, never decoration-for-decoration. Two tiers: *cinematic* (hero, page transitions — sparing, dramatic) and *functional* (hover/feedback — instant, everywhere).

| Tool | Used for | Notes |
|---|---|---|
| **Framer Motion** | Component entrances, modals, page transitions, list staggers, micro-interactions | Default for React UI; `AnimatePresence` for route/modal exits |
| **GSAP + ScrollTrigger** | Scroll-pinned hero reveal, parallax section transitions, number count-ups, timeline sequences | Best for complex scroll choreography |
| **Three.js / React-Three-Fiber** | **Hero only**: volumetric eclipse, particle embers, depth fog, sword | Lazy-loaded, gated, poster-fallback (see §5 perf contract) |

- **Entrance:** sections fade-up + 50ms stagger on scroll-in (IntersectionObserver, once). Hero text reveals after eclipse settles (sequenced, ≤1.2s total).
- **Scroll effects:** subtle parallax (≤6%), pinned hero on desktop only, ember drift speed tied to scroll velocity (capped).
- **Hover:** §4 spec — 150–220ms, compositor-only transforms.
- **Loading sequences:** route skeletons + forge-spark spinner; never spinner-only blank screens.

**Avoid:** auto-playing heavy WebGL on mobile, parallax that fights reading, >500ms blocking entrances, motion without `prefers-reduced-motion` fallback, layout-thrashing animations (animate only `transform`/`opacity`).

---

# 10. Implementation Roadmap

> Assumes a small team (~1 design, 2–3 FE, 1–2 BE, 1 PM). Timelines are calendar weeks; parallelizable tracks noted. Adjust for actual headcount.

### Phase 1 — Foundation (Weeks 1–3)
- **Tasks:** repo + CI/CD on Vercel; Next.js+TS+Tailwind+shadcn scaffold; design tokens (§1.5–1.6) → theme; component library skeleton; Prisma schema on Neon (products, users, orders, carts); Auth.js; base layout + topbar/footer + background system v1 (CSS layers only).
- **Priority:** P0. **Success metrics:** design system in Storybook; Lighthouse ≥95 perf on shell; auth login works; CI green.

### Phase 2 — Core Store (Weeks 3–7) *(overlaps P1)*
- **Tasks:** catalog/Shop + filters; PDP + buy box; cart drawer; Stripe + PayPal checkout (guest-first); digital-key delivery service; order confirmation + emails; search (Typesense) typeahead; category pages + SEO.
- **Priority:** P0. **Success metrics:** end-to-end purchase in staging; checkout completion <90s; PDP→cart works on mobile; first real test order delivered instantly.

### Phase 3 — User Systems (Weeks 7–10)
- **Tasks:** dashboard, order history + key reveal, wishlist + price-drop notifs, subscription management, account settings, support center + FAQ + contact, Codex/blog (CMS).
- **Priority:** P1. **Success metrics:** returning-user flows complete; support deflection content live; wishlist→email pipeline firing.

### Phase 4 — Gamification (Weeks 10–13)
- **Tasks:** XP engine + events, levels/ranks, badges, daily rewards + streaks, Forge Credit/loyalty, referral system, PlayerCard + reward modals.
- **Priority:** P1. **Success metrics:** XP accrues correctly across actions; daily-reward DAU lift measurable; first referrals converting.

### Phase 5 — Optimization (Weeks 13–16)
- **Tasks:** hero WebGL build + perf gating; recommendation engine v1; A/B framework (PostHog) on hero/PDP/checkout; scarcity & social-proof modules; full a11y audit (WCAG 2.2 AA); CWV tuning; SEO/schema.org (Product, Offer, Review); image/CDN optimization; load/security testing.
- **Priority:** P1/P2. **Success metrics:** Lighthouse ≥90 all categories mobile; CWV "good" field-data; measured CR uplift from A/B winners; WAF/rate-limits verified.

### Phase 6 — Launch (Weeks 16–18)
- **Tasks:** content/inventory load; legal (terms, refund, privacy); payment go-live + fraud rules; monitoring/alerting (Sentry + uptime); analytics funnels verified; soft launch (limited traffic) → fix → full launch + marketing; post-launch war-room.
- **Priority:** P0. **Success metrics:** error rate <0.5%; checkout success >98%; CSAT on first orders; conversion-rate baseline established for ongoing optimization.

### Milestone snapshot
```
W1───3   W3──────7   W7────10   W10───13   W13───16   W16─18
Foundation  Core Store  User Sys  Gamify   Optimize   Launch
  P0          P0          P1        P1        P1        P0
```

---

## Appendix A — Open decisions for you (need a call before Phase 1)
1. **Stack pivot:** adopt **Next.js** storefront (recommended) and reuse the existing **Neon DB**, or keep the current **Vite + Django** scaffold as the base? (Big architectural fork.)
2. **Commerce engine:** **Medusa.js** (faster, batteries-included) vs **custom** on Prisma/Postgres (simpler stack, more build).
3. **Scope of MVP:** all 6 product verticals at launch, or start with 2–3 (e.g., Games + Gift Cards + Currency) and expand?
4. **Brand name:** keep **BLACKFORGE** or explore alternatives before logo/domain lock-in.

## Appendix B — What I deliberately did NOT do
No copyrighted Berserk names, characters, marks, panels, or artwork are used or referenced as assets. All glyphs, brand names, ranks, and motifs here are original and safe to commercialize. The aesthetic is *inspired by the genre*, not the property.
