# Doctor Tracker – Frontend Web Client

Standalone Next.js 14 client application for the Doctor Tracker administrative healthcare management portal.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/Vercel-Live-success.svg)](https://doctor-tracker-frontend-phi.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)

---

## 1. Description & Highlights

The **Doctor Tracker Frontend** is an administrative client featuring:
- **Interactive Visualizations (Recharts)**: Workload allocation of patients per doctor (Bar Chart), monthly admission trends over time (Area Chart), and condition distributions (Donut Chart).
- **Physician & Patient Management**: Multi-field search, multi-criteria category and date filtering, responsive modals, and doctor patient cohort views.
- **Enterprise UX**: Debounced search, skeleton loading states, toast notifications, responsive drawer navigation, and accessible confirm dialogs.
- **Role-Based Auth**: Protected routes via `AuthContext` and Axios JWT interceptor.

---

## 2. Links & Live Deployments

- **Live Frontend Website**: [https://doctor-tracker-frontend-phi.vercel.app](https://doctor-tracker-frontend-phi.vercel.app)
- **Frontend Repository**: [https://github.com/Avishek-Pratyay/doctor-tracker-frontend](https://github.com/Avishek-Pratyay/doctor-tracker-frontend)
- **Backend Repository**: [https://github.com/Avishek-Pratyay/doctor-tracker-backend](https://github.com/Avishek-Pratyay/doctor-tracker-backend)

### Demo Administrator Credentials
- **Email**: `admin@doctortracker.com`
- **Password**: `Admin@123456`
*(Includes a 1-click **"Auto-Fill"** button on the login screen).*

---

## 3. Local Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/Avishek-Pratyay/doctor-tracker-frontend.git
cd doctor-tracker-frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env.local` file from `.env.example`:
```bash
cp .env.example .env.local
```
**`.env.local` Configuration:**
```env
# Point to your local backend (port 5000) or your live Render backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 4. Key Scripts

- `npm run dev`: Starts local development server on `http://localhost:3000`.
- `npm run build`: Compiles optimized production static assets.
- `npm start`: Runs the production build.
- `npm run lint`: Runs ESLint checks.
