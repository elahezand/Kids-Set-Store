# SET KIDS

Online store for kids' clothing.

Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, MongoDB (Mongoose), Redis, TanStack Query, Zod, ZarinPal.

## Features

- Product catalog with variants, categories, filters and search
- Cart, coupons, wallet and checkout (online payment or cash on delivery)
- Login with password or SMS code, refresh-token sessions
- User dashboard: orders, tickets, comments, favorites, profile
- Admin panel: products, orders, users, coupons, articles, tickets, comments, site settings
- Automatic order checks (unpaid, stuck and delivered orders)

## Getting started

```bash
cp .env.example .env
npm install
npm run seed:admin -- 09xxxxxxxxx YourPassword123!
npm run dev
```

MongoDB and Redis must be running. With Docker everything starts together:

```bash
docker compose up -d --build
```

## Scripts

| Command              | Description                     |
| -------------------- | ------------------------------- |
| `npm run dev`        | Development server              |
| `npm run build`      | Production build                |
| `npm start`          | Run the production build        |
| `npm run lint`       | ESLint                          |
| `npm run typecheck`  | TypeScript check                |
| `npm run format`     | Prettier                        |
| `npm run seed:admin` | Create or promote an admin user |

## Project structure

- `src/app` - pages and API routes (`api/(public)`, `api/(user)`, `api/(admin)`)
- `src/components/modules` - shared components
- `src/components/template` - page sections
- `src/configs` - MongoDB and Redis connections
- `src/model` - Mongoose models
- `src/services/client` - React Query hooks
- `src/services/server` - business logic (admin, public, user, shared)
- `src/types` - TypeScript types
- `src/validators` - Zod schemas
- `src/utils` - helpers

## Order automation

Order checks run every `ORDER_SWEEP_MINUTES` (default 10) inside the server process. On serverless hosting, set `DISABLE_ORDER_SWEEPER=true` and call the cron endpoint instead:

```
*/10 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://your-site/api/cron/orders
```

## Security

- Rate limiting on login, signup, SMS codes, password reset and public forms (Redis)
- Banned users are blocked on every request
- Changing the phone number requires an SMS code
- Changing or resetting the password signs out other devices
- Uploaded images are checked by file content
