---
name: ecommerce-development
description: "Build or improve production-quality e-commerce storefronts and Shopify themes. Use for storefront architecture, homepage, collection, product, search, cart, checkout handoff, account, wishlist, SEO, accessibility, responsive UX, conversion optimization, performance, and merchant-editable commerce workflows."
argument-hint: "Describe the storefront, commerce workflow, or conversion problem to build or improve"
user-invocable: true
disable-model-invocation: false
---

# E-commerce Development

Build commerce experiences that move customers from product discovery to a confident purchase and support retention. Optimize for conversion, usability, performance, mobile behavior, accessibility, SEO, maintainability, merchant editability, brand consistency, and trust. Every section, interaction, and animation needs a customer or business purpose.

## First: Establish Context

1. Inspect the repository, current route, owning components, data model, dependencies, scripts, and nearby tests before editing.
2. Identify the platform and its native commerce boundary. Prefer existing project patterns and platform capabilities over new abstractions.
3. Identify the customer, product, primary action, likely purchase objections, required information, trust signals, and relevant retention or average-order-value opportunity.
4. State a short local hypothesis about the controlling code path and a cheap check that could disconfirm it.
5. Define the smallest user-visible scope and its acceptance criteria. Do not rewrite unrelated files or rebuild native checkout, payments, orders, inventory, or customer systems without a concrete reason.

## Platform Decisions

- For Shopify, use Online Store 2.0 conventions: Liquid, JSON templates, sections, blocks, snippets, theme settings, metafields, metaobjects, and app blocks. Keep products, variants, inventory, orders, customers, discounts, shipping, checkout, and payments in Shopify.
- For an existing React, Next.js, Django, or other application, follow its established routing, state, data-fetching, styling, and API conventions. Do not invent Shopify APIs or assume an app integration exists.
- Reuse existing UI and commerce primitives. Add an abstraction only when it removes meaningful duplication or clarifies ownership.
- Keep merchant-managed content configurable through the platform's editor or the app's established content model. Use metafields or structured content for product-specific information instead of hard-coding it.

## Build Workflow

Work in focused phases and validate after each phase:

1. **Architecture:** map the relevant data, routes, components, API boundaries, and reusable design tokens.
2. **Global layout:** establish navigation, announcement content when useful, footer, responsive container behavior, focus states, metadata, and error/not-found handling.
3. **Discovery:** provide clear categories or collections, search, useful suggestions or recovery states, filters, sorting, pagination or an appropriate loading pattern, and product cards with image, name, price, availability, meaningful badges, and only useful actions.
4. **Homepage or landing surface:** communicate what is sold, who it serves, what makes it different, and the next action. Select only sections that support the business goal.
5. **Collection and search:** preserve product visibility while making filtering, sorting, empty states, and mobile browsing efficient.
6. **Product experience:** show product media, name, price, real rating data when available, variants, quantity, availability, shipping and returns information, trust signals, and an obvious accessible add-to-cart action. Add story, materials, ingredients, care, origin, specifications, size guides, recommendations, or sticky mobile purchase controls only when relevant.
7. **Cart and checkout handoff:** support product summary, quantity changes, removal, subtotal, discounts when supported, shipping information, relevant recommendations, empty state, and a clear checkout action. Keep checkout on the native platform when available.
8. **Retention and support:** implement only justified account, wishlist, referral, newsletter, support, FAQ, policy, or editorial surfaces. Use real reviews and social proof; never fabricate ratings, testimonials, customer counts, guarantees, or performance claims.
9. **Polish:** refine responsive behavior, loading/error states, interaction feedback, visual hierarchy, and brand-specific art direction without adding decorative effects that delay or obscure purchase.

## Design And Content Rules

- Use semantic HTML, a clear heading hierarchy, labels, keyboard navigation, visible focus, accessible dialogs/drawers/forms, sufficient contrast, alt text, and `prefers-reduced-motion`.
- Use a coherent token system for typography, spacing, containers, breakpoints, buttons, fields, cards, badges, borders, colors, and motion. Match type scale to context and keep text inside its controls at every viewport.
- Use purposeful typography, color, imagery, and restrained motion. Avoid generic SaaS layouts, purple-on-white defaults, excessive gradients, glassmorphism, unnecessary shadows, decorative blobs, nested cards, and hero copy that says nothing specific.
- Use icons from the existing library in icon buttons with tooltips or accessible labels. Use familiar controls for modes, color, quantity, and option selection.
- Write specific copy explaining what the product is, who it is for, why it matters, what differs, how to use it, and what the customer receives. Do not use filler marketing language.
- Never use urgency, scarcity, recommendations, or upsells deceptively. Recommendations should be relevant and limited.

## SEO, Performance, And Security

- Implement correct titles, descriptions, canonical URLs, Open Graph metadata, clean crawlable URLs, structured data appropriate to real content, internal links, sitemap compatibility, and accurate image alt text.
- Use responsive modern images with stable dimensions, lazy loading where appropriate, minimal JavaScript and third-party scripts, optimized fonts, and no avoidable layout shift.
- Keep secrets, private keys, access tokens, customer credentials, and sensitive configuration out of client code, theme JavaScript, and committed files. Use environment variables and platform-secure mechanisms.

## Validation Checklist

Run the narrowest relevant executable check after each edit, then complete a final review:

- Build, lint, typecheck, framework check, or focused test passes.
- Desktop, tablet, and mobile layouts work at 320px, 375px, 390px, 430px, 768px, 1024px, and wide desktop where relevant.
- Navigation, search, filters, product variants, add-to-cart, cart updates, checkout handoff, forms, empty states, and error states behave correctly.
- Keyboard and screen-reader paths are usable; focus is visible; reduced motion is honored; contrast and text containment are acceptable.
- Product, collection, and organization metadata is accurate; no fake social proof or unsupported claims were introduced.
- Images render with stable framing, no important content overlaps, and no console errors or avoidable network failures.
- Theme Editor or merchant configuration works for every newly configurable section, block, setting, or metafield.

Report what changed, what was validated, and any remaining environment-dependent gaps. Do not claim an integration, metric, or test passed without verifying it.
