# 🏛️ Zila Panchayat Safai Portal
### जिला पंचायत सफाई — स्मार्ट वेस्ट कलेक्शन ट्रैकिंग सिस्टम

> **Official Digital Governance Portal** — District Panchayat Almora, Uttarakhand  
> Government of Uttarakhand · Panchayati Raj Department

---

## 📋 Overview

The **Zila Panchayat Safai Portal** is a full-stack government web application for the **smart management of solid waste collection** across District Panchayat Almora. It enables citizens to register grievances, track garbage collection vehicles in real-time, and allows administrators to manage the entire sanitation fleet through an official admin dashboard.

Built under the **Swachh Bharat Mission Urban 2.0** initiative.

---

## ✨ Features

### 🌐 Public Portal
- 📍 **Live Vehicle Tracking** — Real-time GPS map of sanitation vehicles
- 📝 **Complaint Registration** — Citizens can file waste collection grievances
- 🖼️ **Media Gallery** — Photo gallery of cleanliness drives and initiatives  
- 🇮🇳 **Bilingual Support** — Full Hindi & English language switching (i18n)
- 📱 **Fully Responsive** — Optimized for mobile, tablet, and desktop

### 🔐 Admin Dashboard
- 🗺️ **Live GPS Tracking** — Monitor all vehicles on an interactive map
- 📜 **Route History Replay** — Playback vehicle routes from any date
- 🚛 **Fleet Management** — Add, update, and manage sanitation vehicles
- 📣 **Grievance Management** — View and resolve citizen complaints
- 📸 **Media Upload** — Upload cleanliness drive photos to AWS S3
- 👤 **Role-Based Auth** — Admin and citizen access levels
- 🔔 **Real-Time Updates** — Socket.IO powered live data

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** + **TypeScript** | Core UI framework |
| **Vite** | Build tool & dev server |
| **TailwindCSS** | Styling & design system |
| **React Router v6** | Client-side routing |
| **React Leaflet** | Interactive GPS maps |
| **Socket.IO Client** | Real-time vehicle updates |
| **i18next** | Hindi/English localization |
| **Radix UI** | Accessible UI components |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** + **Express** | REST API server |
| **TypeScript** | Type safety |
| **Prisma ORM** | Database access layer |
| **PostgreSQL** (AWS Aurora) | Primary database |
| **Socket.IO** | Real-time GPS data streaming |
| **AWS S3** | Media file storage |
| **JWT** | Authentication tokens |
| **Nodemailer** | OTP email delivery |
| **Helmet** + **Rate Limiting** | Security hardening |
| **Zod** | Request validation |

---

## 🏗️ Project Structure

```
GOVERNMENT-PROJECT/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── TopBarLogos.tsx  # Government logo strip
│   │   │   ├── TopHeader.tsx    # Admin dashboard header
│   │   │   ├── Footer.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   └── BlogGalleryModal.tsx
│   │   ├── pages/               # Page-level components
│   │   │   ├── SignInPage.tsx
│   │   │   ├── SignUpPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── TrackingPage.tsx
│   │   │   ├── VehicleHistoryPage.tsx
│   │   │   └── ...
│   │   ├── contexts/            # React context (Auth, etc.)
│   │   ├── services/            # API service layer
│   │   └── locales/             # i18n translation files (en, hi)
│   ├── public/assets/           # Static assets & logos
│   └── .env                     # Frontend environment variables
│
├── backend/                     # Express + Node.js backend
│   ├── src/
│   │   ├── controllers/         # Route handler logic
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Business logic layer
│   │   ├── middleware/          # Auth, upload, validation
│   │   └── config/              # Env config, Prisma client
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   └── .env                     # Backend environment variables
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x
- **PostgreSQL** database (or AWS Aurora)
- **AWS S3** bucket for media storage

---

### 1. Clone the Repository

```bash
git clone https://github.com/Manish363-dot/GOVERNMENT-PROJECT.git
cd GOVERNMENT-PROJECT
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```
Run database migrations:

```bash
npx prisma migrate deploy
npx prisma generate
```

Start the backend server:

```bash
npm run dev        # Development (with hot reload)
npm start          # Production
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

```

Start the frontend dev server:

```bash
npm run dev        # Development server (http://localhost:5173)
npm run build      # Production build
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register new admin |
| `POST` | `/api/auth/signin` | Login (email/Google) |
| `POST` | `/api/auth/forgot-password` | Send OTP for reset |
| `GET` | `/api/vehicles` | List all vehicles |
| `GET` | `/api/tracking/live` | Live vehicle locations |
| `GET` | `/api/history/:vehicleId` | Vehicle location history |
| `GET` | `/api/complaints` | List all complaints |
| `POST` | `/api/complaints` | Register new complaint |
| `PATCH` | `/api/complaints/:id` | Update complaint status |
| `GET` | `/api/media/blog` | Fetch gallery media |
| `POST` | `/api/media/upload` | Upload media to S3 |

---

## 🗄️ Database Schema (Key Models)

```
Profile          — Admin user accounts
Vehicle          — Sanitation fleet vehicles
GpsDevice        — GPS trackers assigned to vehicles
VehicleCurrentLocation  — Live GPS position per vehicle
VehicleLocationHistory  — Historical GPS trail
Complaint        — Citizen grievance records
ComplaintUpdate  — Complaint status audit log
BlogMedia        — Gallery photos/videos
DailyWork        — Daily cleanliness work records
```

---

## 🌍 Environment Notes

- **CORS** is configured via `CORS_ORIGIN` — supports comma-separated origins
- **OTP emails** fall back to console logging if SMTP is not configured  
- **GPS Webhooks** from Traccar are authenticated via `WEBHOOK_API_KEY`
- All media assets are served from **AWS S3** (`zila-panchayat-images` bucket)

---

## 📸 Screenshots

> Deploy the project on your server to access the live portal.

| Page | Description |
|------|-------------|
| Public Home | Hero section with live vehicle tracking & complaint form |
| Admin Dashboard | Real-time GPS map, fleet status, grievance panel |
| Gallery Modal | Bilingual photo gallery of cleanliness drives |
| Vehicle History | Route replay with date-range filters |

---

## 🔒 Security Features

- 🛡️ **Helmet.js** — HTTP security headers
- 🔐 **JWT Authentication** — Secure token-based auth
- 📧 **OTP Verification** — Email OTP for registration & password reset
- 🌐 **Google OAuth 2.0** — Social login support
- ⚡ **Rate Limiting** — API abuse protection
- 🔑 **Admin Passkey** — Protected admin registration

---


---

## 🏢 About

This portal is developed for:

**जिला पंचायत अल्मोड़ा**  
District Panchayat Almora  
Uttarakhand Government — Panchayati Raj Department  
Under **Swachh Bharat Mission Urban 2.0**

---

<div align="center">
  <sub>Powered by Digital India Initiative 🇮🇳</sub>
</div>
