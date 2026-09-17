# SET KIDS — Next.js store

Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · MongoDB (mongoose) · TanStack Query

## Getting started

```bash
npm install   # package.json changed — regenerate the lock file
npm run dev
```

## Project structure

```
src/
├─ app/
│  ├─ globals.css            ← the ONLY stylesheet (tokens + component classes)
│  ├─ (main)/                ← storefront routes
│  ├─ (p-admin)/p-admin/     ← admin panel routes
│  ├─ (p-user)/p-user/       ← user panel routes
│  └─ api/                   ← route handlers
├─ components/
│  ├─ modules/               ← reusable building blocks
│  │  ├─ ui/                 ← generic: modal, pagination, emptyState, pageLoader,
│  │  │                         errorFallback, scrollToTop, stars, themeToggle, …
│  │  ├─ panel/              ← shared by both panels: panelShell, sidebar, topbar,
│  │  │                         navLinks, pageHeader, statCard, profileForm,
│  │  │                         ticketThread, ticketReplyForm
│  │  └─ main/               ← storefront pieces: navbar, footer, product card, …
│  └─ template/              ← page-specific sections (one folder per route)
│     ├─ main/…
│     ├─ p-admin/{index,products,users,comments,articles,tickets,discounts}
│     └─ p-user/{index,orders,tickets,comments,favorites}
└─ utils/                    ← hooks, server helpers, api clients, providers
model/  validators/  configs/  ← mongoose models, zod schemas, db connection
```

**Rule:** if a component is used by more than one page it belongs in `modules/`,
otherwise it lives next to its page in `template/`.

## Styling

- Tailwind utilities in JSX. No `*.module.css` files.
- Brand colors / fonts / shadows are defined once in `@theme` inside `globals.css`
  (`sage` = primary, `coral` = accent, `ink` = dark surfaces).
- Repeated UI patterns are component classes in `globals.css`:

| Class | Use |
| --- | --- |
| `btn` + `btn-primary` / `btn-accent` / `btn-secondary` / `btn-ghost` / `btn-danger` / `btn-soft-primary` / `btn-soft-danger` | buttons (`btn-sm`, `btn-lg`, `btn-icon` for sizes) |
| `label`, `input` (+ `input-error`), `field-error`, `field-hint` | forms (`input` works on input / select / textarea / file) |
| `card`, `card-header`, `card-title`, `card-body` | surfaces |
| `table-wrap` + `data-table` | responsive tables |
| `badge` + `badge-success` / `-danger` / `-warning` / `-accent` / `-neutral` | status pills |
| `page-container` | centered storefront container |
| `spinner`, `skeleton`, `checkbox` | feedback & custom checkbox |

Dark mode uses the `dark` class on `<html>` (`dark:` variant).
