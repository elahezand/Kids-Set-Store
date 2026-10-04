# SET KIDS — Next.js store

Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · MongoDB (mongoose) · TanStack Query

## Getting started

```bash
cp .env.example .env     # fill in the values (see below)
npm install
npm run dev
```

Required env vars: `MONGO_URL`, `ACCESS_TOKEN`, `REFRESH_TOKEN`, `NEXT_PUBLIC_API_URL`
(everything else is listed in `.env.example`).

## Project structure

```
src/
├─ app/                          routes only (no business logic)
│  ├─ (main)/                    storefront pages
│  ├─ dashboard/
│  │  ├─ (p-user)/               user dashboard  → /dashboard/...
│  │  └─ admin/                  admin panel     → /dashboard/admin/...
│  └─ api/
│     ├─ (public)/               no login needed
│     ├─ (user)/user/            logged-in user
│     └─ (admin)/admin/          admin only
├─ components/
│  ├─ modules/                   reusable building blocks
│  │  ├─ main/                   storefront: navbar/, footer/, article/, productCard, breadcrumb, ...
│  │  ├─ panel/                  dashboard shell: sidebar, topbar, pageHeader, statCard, ...
│  │  └─ ui/                     generic UI: modal, confirmDialog, emptyState, stars, pageLoader, ...
│  └─ template/                  page-specific sections, one folder per route
│     ├─ main/                   index (home), products, product, cart, articles, contact-us, ...
│     ├─ p-user/                 user dashboard sections
│     └─ p-admin/                admin panel sections
├─ configs/                      db.js (mongoose connection), redis.js
├─ model/                        mongoose models
├─ services/
│  ├─ client/                    browser: React Query hooks over /api (cart, favorite, auth, panel, admin, ...)
│  └─ server/                    business logic used by api routes and server pages
│     └─ admin/ public/ user/ shared/
├─ types/                        shared TypeScript types (import from "@/types")
├─ validators/                   zod schemas, one file per domain
└─ utils/
   ├─ constants.ts               ROUTES (incl. ROUTES.admin), SITE_URL, DEFAULT_AVATAR, PLACEHOLDER_IMAGE
   ├─ auth/  providers/  hooks/  actions/
   └─ format, productView, articleView, panelView, adminFilters, productForm, share, searchParams, ...
```

Main site and both dashboards (user + admin) are written in TypeScript (`.ts` / `.tsx`); the API, models and
server services are JavaScript.

**Naming rule:** one domain = one name everywhere:
`model/product.js` → `services/{admin,public,user}/product.js` → `validators/product.js`
→ `api/.../products`. Same for `favorite`, `coupon`, `newsletter`, ...

**Component rule:** used by more than one page → `modules/`, otherwise next to its page in `template/`.

## Conventions

- Imports always use the `@/` alias (= `src/`), never relative paths.
- Internal links use `ROUTES` from `@/utils/constants` instead of hard-coded strings.
- File names are camelCase (`productCard.tsx`), components are PascalCase (`ProductCard`).
- Formatting: Prettier (`.prettierrc.json`) — `npx prettier --write "src/**/*.{ts,tsx}"`.
- API route pattern: `connectToDB()` → auth guard → `validate(schema, body)` → service → `NextResponse`.
- Services return `{ success, status?, message?, data? }`; routes turn that into HTTP.
- Every list (storefront, user panel, admin panel) uses the cursor `paginate` + a "Load more" button.
  Panel pages render the first page on the server (service → `toInitialPage`) and the client list
  continues it through the matching `/api` route (`useCursorList`).
- Admin tables: `?status=` (or `?role=`) tabs + `?q=` search, read with `readAdminFilters` and turned into
  API params with `adminListParams.<list>` — the server page and the client list share that object.
- Admin changes go through `services/client/admin.ts` (toast → invalidate `queryKeys.admin.*` → `router.refresh()`).
- Images (product photos, article covers) are uploaded to `POST /api/admin/upload` first; the returned paths
  are then sent as JSON to the product / article API.
- Route guards must reject expired sessions too: `if (!user || user.status === "expired")`.
- Dynamic route folder names must match what the handler reads (`[productId]` ↔ `const { productId } = await params`).

## Styling

- Tailwind utilities in JSX. No `*.module.css` files.
- Brand colors / fonts / shadows are defined once in `@theme` inside `globals.css`
  (`sage` = primary, `coral` = accent, `ink` = dark surfaces).
- Repeated UI patterns are component classes in `globals.css`:

| Class | Use |
| --- | --- |
| `btn` + `btn-primary` / `btn-accent` / `btn-secondary` / `btn-ghost` / `btn-danger` / `btn-soft-primary` / `btn-soft-danger` | buttons (`btn-sm`, `btn-lg`, `btn-icon` for sizes) |
| `label`, `input` (+ `input-error`), `field-error`, `field-hint` | forms |
| `card`, `card-header`, `card-title`, `card-body` | surfaces |
| `table-wrap` + `data-table` | responsive tables |
| `badge` + `badge-success` / `-danger` / `-warning` / `-accent` / `-neutral` | status pills |
| `page-container` | centered storefront container |
| `spinner`, `skeleton`, `checkbox` | feedback & custom checkbox |

Dark mode uses the `dark` class on `<html>` (`dark:` variant).

