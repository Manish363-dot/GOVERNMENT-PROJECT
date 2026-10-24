# 🏛️ Zila Panchayat Online Rental Platform (जिला पंचायत ऑनलाइन रेंटल प्लेटफॉर्म)
### कार्यालय जिला पंचायत अल्मोड़ा, उत्तराखंड शासन (Panchayati Raj Department)

> **Dedicated Service Platform** — Complete independent frontend and backend for Zila Panchayat property, shop, and community hall rental & allotment management.

---

## 🔒 Isolation & Safety
This directory is **100% isolated** from the Safai (waste management) portal:
- **No Shared Files**: Has its own independent `frontend` and `backend` directories.
- **No Port Conflicts**:
  - Safai Backend runs on **`3001`** · Rental Backend runs on **`5001`**
  - Safai Frontend runs on **`5173`** · Rental Frontend runs on **`5174`**
- **Theme & Brand Consistency**:
  - Exact same Uttarakhand Government colors (`#0b1b36` navy, `#1d4ed8` primary, `#14532d` UK green, `#c2410c` saffron).
  - Exact same typography (`Hind`, `Noto Sans Devanagari`, `Inter`, `Poppins`).
  - Exact official government logos (`logo1.png` to `logo5.png`).

---

## 📁 Directory Structure
```
rental-platform/
├── frontend/             # Independent React 18 + Vite + TailwindCSS app
│   ├── public/assets/    # Government emblems, Almora logos
│   ├── src/
│   │   ├── components/   # RentalNavbar, Government UI components
│   │   ├── App.tsx       # Rental portal layout & preview
│   │   ├── index.css     # Matching Tailwind tokens
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts    # Configured for Port 5174
│   └── tailwind.config.js
└── backend/              # Independent Node.js + Express + TypeScript API
    ├── src/
    │   └── server.ts     # Rental platform REST API
    ├── package.json
    ├── tsconfig.json
    └── .env              # Configured for Port 5001
```

---

## 🚀 Running the Rental Platform

### 1. Frontend
```bash
cd rental-platform/frontend
npm install
npm run dev
# Starts on http://localhost:5174
```

### 2. Backend
```bash
cd rental-platform/backend
npm install
npm run dev
# Starts on http://localhost:5001
```
