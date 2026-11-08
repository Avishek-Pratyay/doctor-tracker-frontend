# Doctor Tracker — Frontend

> Next.js 14 App Router frontend for the Doctor Tracker healthcare management system.  
> **Next.js 14 · TypeScript · Tailwind CSS · Recharts · Axios**

---

## 🔗 Live

| Resource | URL |
|---|---|
| **Live App** | `https://doctor-tracker-frontend-phi.vercel.app` |
| **Login** | `https://doctor-tracker-frontend-phi.vercel.app/login` |
| **Backend API** | `https://doctor-tracker-backend.onrender.com` |

**Demo credentials:** `admin@doctortracker.com` / `Admin@123456`

---

## ⚡ Quick Start

```bash
git clone https://github.com/Avishek-Pratyay/doctor-tracker-frontend.git
cd doctor-tracker-frontend
npm install
cp .env.example .env.local   # fill in your API URL
npm run dev                  # start on :3000
```

---

## 🌍 Environment Variables

Create `.env.local` in the frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production, set this to your Render backend URL in Vercel project settings.

---

## 📄 Pages

| Route | Page | Description |
|---|---|---|
| `/login` | Login | Email/password form with JWT auth |
| `/dashboard` | Dashboard | KPI cards + Recharts visualizations |
| `/doctors` | Doctors | Doctor CRUD with patient sub-management |
| `/patients` | Patients | Full patient registry with filters |
| `/` | Root | Redirects to `/login` or `/dashboard` |

---

## 🧩 Components

### Layout
- **`AppLayout`** — Responsive sidebar with mobile drawer, navigation links, logout

### Common Components
- **`Modal`** — Accessible modal dialog for create/edit forms
- **`ConfirmDialog`** — Confirmation dialog for destructive actions
- **`Pagination`** — Server-side pagination controls
- **`SearchBar`** — Debounced search input
- **`StatCard`** — KPI metric card with icon and trend
- **`LoadingSkeleton`** — Shimmer loading placeholders

### Context Providers
- **`AuthContext`** — JWT token management, login/logout, auth state
- **`ToastContext`** — Global toast notification system

---

## 📊 Dashboard Charts (Recharts)

| Chart | Type | Data |
|---|---|---|
| Patients per Doctor | `BarChart` | Top 8 doctors by patient count |
| Monthly Trends | `AreaChart` | Doctors vs Patients admissions over time |
| Specialization Split | `PieChart` (Donut) | Distribution of doctor specializations |

---

## 🏗 Architecture Notes

- **Next.js App Router** — All pages use the `app/` directory (no `pages/` router)
- **TypeScript** — Full type coverage across components, contexts, and API types
- **Axios Interceptor** (`src/lib/api.ts`) — Automatically attaches `Authorization: Bearer <token>` header to every request; redirects to `/login` on 401 responses
- **Server-side pagination** — All list endpoints use `page` + `limit` query params; no client-side data loading
- **Tailwind CSS** — Utility-first, responsive, mobile-first design
- **Lucide React** — Consistent icon system throughout

---

## 🔧 Available Scripts

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Hot-reload dev server on :3000 |
| Production build | `npm run build` | Compile and optimize for production |
| Production serve | `npm start` | Serve production build |
| Lint | `npm run lint` | ESLint checks |

---

## 📁 Source Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Root redirect
│   ├── globals.css          # Global Tailwind styles
│   ├── login/page.tsx       # Login page
│   ├── dashboard/page.tsx   # Analytics dashboard
│   ├── doctors/page.tsx     # Doctor management
│   └── patients/page.tsx    # Patient management
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx    # Sidebar layout
│   └── common/
│       ├── Modal.tsx
│       ├── ConfirmDialog.tsx
│       ├── Pagination.tsx
│       ├── SearchBar.tsx
│       ├── StatCard.tsx
│       └── LoadingSkeleton.tsx
├── context/
│   ├── AuthContext.tsx      # Auth state & JWT management
│   └── ToastContext.tsx     # Toast notifications
└── lib/
    └── api.ts               # Axios client with JWT interceptor
```
