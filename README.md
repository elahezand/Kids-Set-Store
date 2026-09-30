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
├─ app/                        routes only (no business logic)
│  ├─ (main)/                  storefront pages
│  ├─ (p-admin)/p-admin/       admin panel pages
│  ├─ (p-user)/p-user/         user panel pages
│  └─ api/
│     ├─ (public)/             no login needed
│     ├─ (user)/user/          logged-in user
│     └─ (admin)/admin/        admin only
├─ components/
│  ├─ modules/                 reusable building blocks (ui/, panel/, main/)
│  └─ template/                page-specific sections, one folder per route
├─ configs/                    db.js (mongoose connection), redis.js (key/value store)
├─ model/                      mongoose models (CommonJS)
├─ services/                   business logic, called by api routes
│  ├─ admin/  public/  user/   one file per domain, same name as the model
│  └─ shared/                  used by several scopes (order, cart, wallet, session, ...)
├─ validators/                 zod schemas, one file per domain
├─ utils/
│  ├─ auth/                    index (tokens), authGuard, cookies
│  ├─ hooks/  context/  providers/  actions/   client hooks, server actions
│  └─ apiResponse, helper, paginate, pricing, notify, logger, AppError, ...
└─ data/                       static json
```

**Naming rule:** one domain = one name everywhere:
`model/product.js` → `services/{admin,public,user}/product.js` → `validators/product.js`
→ `api/.../products`. Same for `favorite`, `coupon`, `newsletter`, ...

**Component rule:** used by more than one page → `modules/`, otherwise next to its page in `template/`.

## Conventions

- Imports always use the `@/` alias (= `src/`), never `../../..`.
- API route pattern: `connectToDB()` → auth guard → `validate(schema, body)` → service → `NextResponse`.
- Services return `{ success, status?, message?, data? }`; routes turn that into HTTP.
- Dashboard tables use `paginatePage` (`?page=`), lists with "load more" use cursor `paginate`.
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

See `MIGRATION_NOTES.md` for what changed in the restructure and what is still open.
