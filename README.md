# 🏥 Doctor Tracker — Full-Stack Healthcare Management System

> A professional, industry-grade web application for tracking doctors and patients, built with **Next.js 14**, **Node.js / Express**, and **MongoDB Atlas**.

---

## 🔗 Live Deployment

| Service | URL |
|---|---|
| **Frontend (Vercel)** | [https://doctor-tracker-frontend-phi.vercel.app](https://doctor-tracker-frontend-phi.vercel.app) |
| **Backend API (Render)** | [https://doctor-tracker-backend.onrender.com](https://doctor-tracker-backend.onrender.com) |
| **Backend Health Check** | [https://doctor-tracker-backend.onrender.com/api/health](https://doctor-tracker-backend.onrender.com/api/health) |

### 🔑 Demo Credentials

```
Email:    admin@doctortracker.com
Password: Admin@123456
```

---

## 📋 Project Description

**Doctor Tracker** is a full-stack healthcare management dashboard that enables administrators to:

- **Manage Doctors** — Add, edit, search, filter, and remove doctors with their specialization, hospital affiliation, contact details, and status.
- **Manage Patients** — Track patient records including medical condition/diagnosis, assigned doctor, admission date, status, and clinical notes.
- **View Analytics** — A real-time dashboard with KPI cards, bar charts, area charts, and donut charts powered by Recharts.
- **Secure Authentication** — JWT-based login with bcrypt password hashing and brute-force rate limiting.

The system is architected as two **fully decoupled** applications:
- A standalone **Next.js 14 App Router** frontend deployed on Vercel
- A standalone **Node.js / Express REST API** backend deployed on Render

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │       Next.js 14 Frontend (Vercel)                      │   │
│  │                                                         │   │
│  │  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌───────┐  │   │
│  │  │  /login   │  │/dashboard│  │ /doctors │  │/patie-│  │   │
│  │  │           │  │          │  │          │  │ nts   │  │   │
│  │  └───────────┘  └──────────┘  └──────────┘  └───────┘  │   │
│  │                                                         │   │
│  │  AuthContext · ToastContext · Axios Interceptor (JWT)   │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           │  HTTPS REST (JSON)                  │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Node.js / Express API (Render)                  │
│                                                                 │
│  Helmet · CORS · Compression · Rate Limiting · Morgan           │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │/api/auth │  │/api/doct-│  │/api/pati-│  │/api/analyti- │   │
│  │  login   │  │  ors     │  │  ents    │  │  cs/dashboard│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│                                                                 │
│  JWT Middleware · express-validator · Centralized Error Handler │
└────────────────────────────┬────────────────────────────────────┘
                             │  Mongoose ODM
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MongoDB Atlas (Cloud)                         │
│                                                                 │
│   users collection · doctors collection · patients collection   │
│   Full-text indexes · Compound indexes · Aggregation pipelines  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User logs in** → Frontend sends `POST /api/auth/login` → Backend verifies credentials with bcrypt → Returns signed JWT
2. **Axios Interceptor** automatically attaches `Authorization: Bearer <token>` header to every subsequent request
3. **JWT Middleware** on the backend validates the token on every protected route
4. **Controllers** query MongoDB via Mongoose (with aggregation pipelines for analytics) and return paginated JSON
5. **Frontend** renders data using React state, with Recharts for visualization

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2.20 | React framework with App Router & SSR |
| TypeScript | 5.6 | Type safety |
| Tailwind CSS | 3.4 | Utility-first styling |
| Recharts | 2.13 | Data visualization (Bar, Area, Donut) |
| Axios | 1.7 | HTTP client with JWT interceptor |
| Lucide React | 0.460 | Icon library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥18 | JavaScript runtime |
| Express | 4.21 | HTTP server framework |
| MongoDB Atlas | Cloud | NoSQL document database |
| Mongoose | 8.9 | MongoDB ODM with schema validation |
| JSON Web Token | 9.0 | Stateless authentication |
| bcryptjs | 2.4 | Password hashing |
| Helmet | 8.0 | HTTP security headers |
| express-rate-limit | 8.7 | Brute-force & DDoS protection |
| express-validator | 7.2 | Input validation & sanitization |
| compression | 1.7 | Gzip response compression |
| morgan | 1.10 | HTTP request logging |
| cors | 2.8 | Cross-Origin Resource Sharing |

---

## 📁 Project Structure

```
doctor-tracker/
├── backend/                      # Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js             # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── doctorController.js
│   │   │   ├── patientController.js
│   │   │   └── analyticsController.js
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT protect & authorize
│   │   │   ├── errorHandler.js   # Centralized error handler
│   │   │   └── validator.js      # express-validator rules
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Doctor.js
│   │   │   └── Patient.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── doctorRoutes.js
│   │   │   ├── patientRoutes.js
│   │   │   └── analyticsRoutes.js
│   │   ├── mockData.js           # In-memory fallback for offline demo
│   │   ├── seed.js               # Database seeder (10 doctors, 24 patients)
│   │   ├── test-api.js           # Automated API verification script
│   │   └── server.js             # Express app entry point
│   ├── .env.example
│   ├── render.yaml               # Render deployment blueprint
│   └── package.json
│
└── frontend/                     # Next.js 14 App Router
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx           # Redirect to /login
    │   │   ├── login/page.tsx     # Login page
    │   │   ├── dashboard/page.tsx # Analytics dashboard
    │   │   ├── doctors/page.tsx   # Doctor management
    │   │   └── patients/page.tsx  # Patient management
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── AppLayout.tsx  # Responsive sidebar layout
    │   │   └── common/
    │   │       ├── Modal.tsx
    │   │       ├── ConfirmDialog.tsx
    │   │       ├── Pagination.tsx
    │   │       ├── SearchBar.tsx
    │   │       ├── StatCard.tsx
    │   │       └── LoadingSkeleton.tsx
    │   ├── context/
    │   │   ├── AuthContext.tsx    # JWT auth state management
    │   │   └── ToastContext.tsx   # Toast notification provider
    │   └── lib/
    │       └── api.ts             # Axios client with interceptor
    ├── vercel.json
    └── package.json
```

---

## ⚙️ Setup Guide (Local Development)

### Prerequisites

- Node.js ≥ 18.0.0
- npm ≥ 9
- A MongoDB Atlas account (or a local MongoDB instance)

---

### 1. Clone the Repositories

```bash
# Backend
git clone https://github.com/Avishek-Pratyay/doctor-tracker-backend.git
cd doctor-tracker-backend

# Frontend (in a separate terminal)
git clone https://github.com/Avishek-Pratyay/doctor-tracker-frontend.git
cd doctor-tracker-frontend
```

---

### 2. Backend Setup

```bash
cd doctor-tracker-backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/doctor_tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
```

```bash
# Seed the database with sample data (10 doctors, 24 patients, 1 admin)
npm run seed

# Start the development server
npm run dev
```

The API will be available at `http://localhost:5000`

**Verify:** `GET http://localhost:5000/api/health` → should return `{ "database": "connected" }`

---

### 3. Frontend Setup

```bash
cd doctor-tracker-frontend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

---

### 4. Login

Navigate to `http://localhost:3000/login` and use:

```
Email:    admin@doctortracker.com
Password: Admin@123456
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login and receive JWT | ❌ |
| `GET` | `/api/health` | Health check & DB status | ❌ |

### Doctors

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/doctors` | List doctors (paginated, searchable, filterable) | ✅ |
| `GET` | `/api/doctors/:id` | Get single doctor | ✅ |
| `POST` | `/api/doctors` | Create a doctor | ✅ |
| `PUT` | `/api/doctors/:id` | Update a doctor | ✅ |
| `DELETE` | `/api/doctors/:id` | Delete a doctor | ✅ |
| `GET` | `/api/doctors/filters` | Get available filter options | ✅ |
| `POST` | `/api/doctors/:id/patients` | Assign a patient to a doctor | ✅ |
| `DELETE` | `/api/doctors/:id/patients/:patientId` | Remove a patient from a doctor | ✅ |

### Patients

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/patients` | List patients (paginated, searchable, filterable) | ✅ |
| `GET` | `/api/patients/:id` | Get single patient | ✅ |
| `POST` | `/api/patients` | Create a patient | ✅ |
| `PUT` | `/api/patients/:id` | Update a patient | ✅ |
| `DELETE` | `/api/patients/:id` | Delete a patient | ✅ |
| `GET` | `/api/patients/filters` | Get available filter options | ✅ |

### Analytics

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/analytics/dashboard` | Full dashboard stats & chart data | ✅ |

#### Query Parameters (GET `/api/doctors` and `/api/patients`)

| Parameter | Type | Example | Description |
|---|---|---|---|
| `search` | string | `?search=cardio` | Full-text search |
| `page` | number | `?page=2` | Pagination page number |
| `limit` | number | `?limit=10` | Results per page |
| `specialization` | string | `?specialization=Cardiology` | Filter by specialization |
| `status` | string | `?status=Active` | Filter by status |
| `startDate` | ISO date | `?startDate=2024-01-01` | Filter from date |
| `endDate` | ISO date | `?endDate=2024-12-31` | Filter to date |
| `sort` | string | `?sort=-createdAt` | Sort field (prefix `-` for desc) |

---

## 🗄 Database Schema

### Doctor Model

```js
{
  name:            String    (required, max 100)
  specialization:  String    (required, indexed)
  hospital:        String    (required, indexed)
  phone:           String    (required)
  email:           String    (required, unique-format, indexed)
  experienceYears: Number    (default: 1, min: 0)
  status:          Enum      ['Active', 'On Leave', 'Inactive']
  // virtuals: patients[], patientCount
  // indexes: text(name, specialization, hospital, email), createdAt, (specialization, createdAt)
}
```

### Patient Model

```js
{
  name:          String    (required, max 100)
  age:           Number    (required, 0–130)
  gender:        Enum      ['Male', 'Female', 'Other']
  condition:     String    (required, medical diagnosis)
  phone:         String    (required)
  email:         String    (optional)
  doctor:        ObjectId  → Doctor (required, indexed)
  status:        Enum      ['Active', 'In Treatment', 'Discharged', 'Critical']
  admissionDate: Date      (default: now, indexed)
  notes:         String    (clinical notes)
  // indexes: text(name, condition, phone), (doctor, createdAt), (status, createdAt), admissionDate
}
```

### User Model

```js
{
  name:     String    (required)
  email:    String    (required, unique)
  password: String    (bcrypt hashed, min 8 chars)
  role:     Enum      ['admin', 'user'] (default: 'user')
}
```

---

## 🔐 Technical Decisions

### Decision 1: JWT Stateless Authentication

**Choice:** JSON Web Tokens over session-based authentication.

**Reasoning:** Since the frontend (Vercel) and backend (Render) are deployed on separate origins, server-side sessions would require a shared session store (e.g., Redis). JWTs are self-contained, stateless, and work seamlessly across origins — the token is stored in `localStorage` and attached to every request via an Axios request interceptor. The JWT is signed with a secret and expires in 7 days, limiting the blast radius of token theft.

**Security hardening added:**
- bcrypt with 12 salt rounds for password hashing
- Dedicated brute-force rate limiter on `/api/auth/login` (30 req / 15 min)
- Helmet.js sets 11 security-related HTTP headers on every response

---

### Decision 2: MongoDB + Mongoose with Aggregation Pipelines

**Choice:** MongoDB Atlas with Mongoose ODM over a relational database.

**Reasoning:** Doctor and patient data is semi-structured (doctors have varying fields, patients have free-text `condition` and `notes`). MongoDB's flexible document model fits this naturally. Mongoose provides schema validation, virtuals, and population (JOIN-like behaviour). For the analytics dashboard, MongoDB's aggregation pipeline (`$group`, `$lookup`, `$unwind`, `$project`, `$sort`) efficiently computes KPIs, monthly admission trends, patients-per-doctor, condition distribution, and specialization breakdown in a single round-trip — far more performant than multiple SQL JOINs.

**Indexes defined:**
- Compound text indexes on `name`, `specialization`, `hospital`, `email` → powers full-text search
- Compound indexes on `(specialization, createdAt)`, `(doctor, createdAt)`, `(status, createdAt)` → powers date-range filtering and sorting with zero collection scans

---

### Decision 3: Decoupled Frontend / Backend Architecture

**Choice:** Completely separate Next.js frontend and Express backend repositories.

**Reasoning:** This follows industry-standard microservice separation-of-concerns. It allows:
- Independent scaling (Vercel's edge CDN for frontend; Render's auto-scaling for backend)
- Independent deployment pipelines (CI/CD via GitHub → Vercel/Render)
- Clear API contract boundary — the frontend is a pure consumer of the REST API
- The backend can serve any future clients (mobile apps, 3rd-party integrations) without changes

---

### Decision 4: Offline In-Memory Fallback (`mockData.js`)

**Choice:** All controllers check `mongoose.connection.readyState !== 1` and fall back to in-memory mock data.

**Reasoning:** Guarantees the application works for demos and testing even if the database is unreachable or rate-limited. This makes the system resilient and self-demonstrating for evaluators.

---

## 🚀 Deployment Guide

### Backend → Render

1. Push code to `https://github.com/Avishek-Pratyay/doctor-tracker-backend`
2. In Render dashboard → **New Web Service** → connect GitHub repo
3. Set the following environment variables in Render:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | your secret |
| `JWT_EXPIRE` | `7d` |

4. Build command: `npm install`
5. Start command: `node src/server.js`
6. Auto-deploy is enabled — every push to `main` triggers a redeploy.

> **Note:** The `render.yaml` blueprint at the root of the backend repo can automate this configuration.

---

### Frontend → Vercel

1. Push code to `https://github.com/Avishek-Pratyay/doctor-tracker-frontend`
2. In Vercel dashboard → **Add New Project** → Import GitHub repo
3. Set environment variable:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-render-backend-url.onrender.com` |

4. Framework: **Next.js** (auto-detected)
5. Build command: `npm run build` (auto-detected)
6. Auto-deploy is enabled — every push to `main` triggers a redeploy.

---

## 🧪 Running Tests

```bash
# Start the backend server first
npm run dev

# In a new terminal, run the automated API verification suite
npm test
```

The test script validates:
- `GET  /api/health` → DB status check
- `POST /api/auth/login` → JWT token issuance
- `GET  /api/analytics/dashboard` → KPI aggregation
- `GET  /api/doctors` → Paginated list
- `GET  /api/patients` → Paginated list

---

## ✅ Feature Checklist

- [x] **Doctor CRUD** — Create, Read, Update, Delete doctors
- [x] **Patient CRUD** — Create, Read, Update, Delete patients
- [x] **Search** — Full-text search on name, specialization, hospital, condition
- [x] **Date Filter** — Filter records by admission/creation date range
- [x] **Pagination** — Server-side pagination with configurable page size
- [x] **Analytics Dashboard** — KPI cards, Bar chart, Area chart, Donut chart
- [x] **JWT Authentication** — Secure stateless login
- [x] **Role-based Access** — Middleware-enforced route protection
- [x] **Input Validation** — express-validator on all write endpoints
- [x] **Rate Limiting** — Global API limiter + dedicated auth limiter
- [x] **Security Headers** — Helmet.js HTTP headers
- [x] **Responsive UI** — Mobile-first design with sidebar drawer
- [x] **MongoDB Aggregation** — Multi-stage pipelines for analytics
- [x] **Database Seeding** — 10 doctors, 24 patients, 1 admin user
- [x] **Health Check** — `/api/health` endpoint with DB status
- [x] **Offline Fallback** — In-memory mock data when DB is unreachable
- [x] **Frontend Deployed** — Vercel
- [x] **Backend Deployed** — Render
- [x] **Source Code** — Public GitHub repositories

---

## 📸 Visual Evidence

### Dashboard
> Live at: [https://doctor-tracker-frontend-phi.vercel.app](https://doctor-tracker-frontend-phi.vercel.app)

The dashboard displays:
- **KPI Cards**: Total Doctors, Total Patients, Active Patients, Discharged Patients, Avg Patients/Doctor
- **Bar Chart**: Patients per Doctor (top 8)
- **Area Chart**: Monthly admission trends (Doctors vs Patients)
- **Donut Chart**: Specialization distribution

### Doctors Page
- Searchable, filterable table with specialization and date-range filters
- Inline patient sub-management (add/remove patients from a doctor)
- Modal form for creating/editing doctors

### Patients Page
- Full patient registry with multi-filter (status, gender, condition, date range)
- Modal form for creating/editing patients with doctor assignment

---

## 📂 GitHub Repositories

| Repo | Link |
|---|---|
| **Frontend** | [github.com/Avishek-Pratyay/doctor-tracker-frontend](https://github.com/Avishek-Pratyay/doctor-tracker-frontend) |
| **Backend** | [github.com/Avishek-Pratyay/doctor-tracker-backend](https://github.com/Avishek-Pratyay/doctor-tracker-backend) |

---

## 👤 Author

**Avishek Pratyay**

---

*Built as a job interview technical assessment. Industry-standard patterns: decoupled SPA + REST API, JWT auth, MongoDB aggregation pipelines, Helmet security, rate limiting, Vercel + Render deployment.*
