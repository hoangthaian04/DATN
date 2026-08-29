# Frontend — EasyTech HRM

React + Vite + TypeScript + TailwindCSS v4

## Tech Stack

| Package | Version |
|---------|---------|
| React | 19 |
| Vite | 8 |
| TypeScript | 6 |
| TailwindCSS | v4 |
| React Router | v7 |
| TanStack Query | v5 |
| Axios | latest |
| React Hook Form + Zod | latest |
| Lucide React | latest |

## Cấu trúc `src/`

```
src/
├── router/          # Routing config + tất cả routes
├── layouts/         # DashboardLayout, AdminLayout, CareerLayout
├── pages/           # Pages theo role (auth/, hr/, admin/, career/)
├── components/      # Reusable components (ui/, layout/, jobs/, ...)
├── hooks/           # Custom hooks (useAuth, useJobs, ...)
├── services/        # API call layer (api.ts, auth.service.ts, ...)
├── contexts/        # React Context (AuthContext)
├── types/           # TypeScript interfaces & types
└── utils/           # Utility functions (format, slug, file)
```

## Chạy local

```bash
npm install
npm run dev      # http://localhost:3000
```

## Biến môi trường

```env
# .env — Vite proxy tự forward /api → localhost:8080 (không cần set khi dev)
VITE_API_URL=
```

## Scripts

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy dev server (port 3000, hot reload) |
| `npm run build` | Build production vào `dist/` |
| `npm run lint` | Chạy oxlint |
| `npm run preview` | Preview bản build |
