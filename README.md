# Pramuka SMA Negeri 1 Pasawahan

Website Landing Page and Admin CMS (Content Management System) Dashboard for the Pramuka (Scout) organization of SMA Negeri 1 Pasawahan. This project displays member profiles, activities, galleries, and announcements, while providing a comprehensive and secure admin interface to manage content using MongoDB as the backend.

## Key Features

- **Public Landing Page**: Fast, SEO-optimized, and server-side rendered website for public viewing.
- **Admin CMS Dashboard**: Comprehensive content management system for managing members, gallery, and activities.
- **Secure Authentication**: Built-in authentication powered by custom JWT & Refresh Tokens with protected admin and member routes.
- **Interactive UI**: Fluid user experience with features like image pan-and-zoom, toast notifications, and advanced data tables.
- **Bilingual Support**: Internationalization (i18n) supporting both Indonesian (ID) and English (EN).
- **Modern Styling**: Fully responsive, accessible, and easily customizable design system.

---

## Tech Stack

- **Language**: TypeScript / Vue 3
- **Framework**: Nuxt 4 (Server-Side Rendering / Static Site Generation)
- **Frontend UI**: Tailwind CSS v4
- **UI Components**: Shadcn UI (`shadcn-nuxt`, `reka-ui`), Lucide Vue Next
- **Database**: MongoDB (`mongodb` driver)
- **Authentication**: JWT & Refresh Tokens (Custom Secure Nitro API)
- **Data Table**: TanStack Table (`@tanstack/vue-table`)
- **Internationalization**: Nuxt i18n (`@nuxtjs/i18n`)
- **State & Utilities**: VueUse (`@vueuse/core`)
- **Deployment**: Bun / Docker / Vercel

---

## Prerequisites

Ensure you have the following installed before setting up the project:

- Bun 1.0 or higher
- A MongoDB instance (e.g. MongoDB Atlas or local MongoDB)
- MinIO or S3 compatible Object Storage (for image hosting)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nuxt-app.git
cd nuxt-app
```

### 2. Install Dependencies

Install dependencies using `bun`:

```bash
bun install
```

### 3. Environment Setup

Create a `.env` file in the root directory based on the environment variables needed by Nuxt and MongoDB:

```bash
touch .env
```

Add your specific configuration details (refer to the Environment Variables section below). At a minimum, you must define:

```env
BASE_URL=http://localhost:3000
MONGODB_URI=mongodb://admin:password123@localhost:27017/pramuka_db?authSource=admin
MONGODB_DATABASE=pramuka_db
JWT_SECRET=your-jwt-secret
```

### 4. Start Development Server

Start the Nuxt dev server with hot-module replacement (HMR):

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture

### Directory Structure

```
├── app/
│   ├── assets/        # Global CSS and static resources
│   ├── components/    # Reusable Vue components (UI, Admin, Public)
│   ├── composables/   # Vue 3 composables (state management, logic)
│   ├── layouts/       # Nuxt page layouts (e.g., default, admin)
│   ├── lib/           # Utility functions
│   ├── middleware/    # Nuxt route middleware (e.g., auth guards)
│   ├── pages/         # File-based routing (pages/views)
│   ├── plugins/       # Nuxt plugins
│   └── services/      # External API/Backend integration wrappers
├── server/
│   ├── api/           # Nitro server API routes
│   ├── middleware/    # Server-side middleware
│   └── utils/         # Server utilities
├── i18n/              # Language translation files
├── public/            # Static assets (favicons, robots.txt)
├── nuxt.config.ts     # Nuxt configuration file
└── package.json       # Project dependencies and scripts
```

### Request Lifecycle

1. **Client Request**: A user visits a URL. The Nuxt router resolves the corresponding page component in `app/pages/`.
2. **Server-Side Rendering (SSR)**: For initial page loads or server-rendered pages, Nuxt executes `useAsyncData` or `useFetch` to gather required data before sending the HTML to the browser.
3. **API Processing**: If the frontend requests a `/api/...` endpoint, the Nitro server (`server/api/`) processes the business logic (e.g., validating JWT, querying MongoDB), and returns JSON.
4. **Database Interaction**: The Nitro server interacts with the MongoDB database.
5. **Client Hydration**: Once the browser receives the HTML, Vue takes over and the page becomes interactive (SPA navigation for subsequent clicks).

### Data Flow

```
User Action → Vue Component → Nuxt Server Route → MongoDB Database
     ↓
Vue Reactive State ← API Response ←
```

### Key Components

**Authentication**
- Custom JWT & Refresh Tokens manage user sessions and authentication.
- Nuxt route middleware (`app/middleware/`) checks session validity before allowing access to `/admin` routes.

**Database & Backend**
- MongoDB provides NoSQL document database storage.
- Nitro server API routes handle sensitive operations like email sending (via Nodemailer) or secure profile updates, hiding credentials from the frontend.

**UI System**
- **Shadcn Vue** provides accessible, easily customizable components found in `app/components/ui/`.
- **Tailwind CSS v4** handles all utility classes and responsive design.
- **TanStack Table** handles complex data grid rendering, pagination, and sorting in the Admin CMS.

---

## Environment Variables

### Required

| Variable | Description | How to Get |
| --- | --- | --- |
| `BASE_URL` | Application base URL | Set to `http://localhost:3000` for dev |
| `MONGODB_URI` | MongoDB connection URI | Example: `mongodb://admin:pass@localhost:27017/pramuka_db?authSource=admin` |
| `MONGODB_DATABASE` | MongoDB database name | Default: `pramuka_db` |
| `JWT_SECRET` | Secret used to sign JWTs | Random secure string (min 32 chars) |

### Optional / SMTP Configuration

| Variable | Description | Example |
| --- | --- | --- |
| `EMAIL_SMTP_HOST` | Mail server hostname | `smtp.gmail.com` |
| `EMAIL_SMTP_PORT` | Mail server port | `465` or `587` |
| `EMAIL_SMTP_USER` | SMTP username / email address | `admin@example.com` |
| `EMAIL_SMTP_PASS` | SMTP password / App password | `your-password` |
| `EMAIL_SMTP_SECURE`| Use secure connection (SSL/TLS) | `true` |

---

## Available Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start development server with HMR |
| `bun run build` | Build application for production |
| `bun run preview` | Locally preview the production build |
| `bun run generate` | Pre-render every route as a static site (SSG) |
| `bun run postinstall` | Run Nuxt prepare (auto-generates types) |

---

## Testing

Currently, no formal testing suite (like Vitest or Jest) is configured for this project.

To add tests in the future, you can configure Vitest and the Nuxt test utilities:

```bash
bun add -d vitest @nuxt/test-utils
```

### Example Test (Once Configured)

```typescript
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('My App', async () => {
  await setup({
    server: true
  })

  it('renders the index page', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Pramuka SMA Negeri 1 Pasawahan')
  })
})
```

---

## Deployment

This Nuxt 4 project can be deployed easily to modern edge providers or traditional Node.js servers.

### Vercel (Recommended)

Vercel provides native, zero-configuration support for Nuxt.

1. Push your code to a GitHub/GitLab repository.
2. Import the project in the Vercel dashboard.
3. Vercel will automatically detect Nuxt and set the correct build commands (`nuxt build`).
4. Add your Environment Variables in the Vercel dashboard.
5. Click **Deploy**.

### Bun Server / Docker

To deploy on a standard VPS or using Docker:

1. Build the application:
```bash
bun run build
```

2. The output will be in `.output/`. You can run the server via Bun:
```bash
bun .output/server/index.mjs
```

**Docker Example (`Dockerfile`):**
```dockerfile
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .
ENV NODE_ENV=production
RUN bun run build

FROM oven/bun:1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
COPY --from=builder --chown=bun:bun /app/.output ./.output
USER bun
EXPOSE 3000
CMD ["bun", ".output/server/index.mjs"]
```

---

## Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoServerSelectionError` or `MongoParseError`
**Solution:**
1. Verify `MONGODB_URI` in `.env` is accurate.
2. If username or password contains special characters (e.g. `@`, `#`, `:`, `/`), ensure they are URL-encoded (`#` -> `%23`, `@` -> `%40`).
3. Ensure MongoDB daemon is running and reachable.

### Blank Page or Internal Server Error on Dev Server

**Solution:**
Sometimes the Nuxt cache gets corrupted.
```bash
# Clear Nuxt build cache and lockfiles
rm -rf .nuxt .output
bun run dev
```

### Missing Shadcn UI Component Styles

**Error:** Component renders but has no styling or looks broken.
**Solution:**
Verify that your `tailwind.css` includes the correct Tailwind v4 directives and the Shadcn component directory is correctly specified in `nuxt.config.ts`. Run `bun run dev` again to let Tailwind/Vite re-scan the files.
