# 🏛️ Zila Panchayat Almora — Official Design System & Specification
**कार्यालय जिला पंचायत अल्मोड़ा, उत्तराखंड शासन**  
*Comprehensive UI/UX Design System, Color Tokens, Typography, Component Standards & Architectural Guidelines*

---

## 📌 1. Design Philosophy & Brand Identity

The Zila Panchayat Almora digital ecosystem is built upon four foundational pillars:
1. **Administrative Authority & Trust (शासकीय गरिमा):** Deep official navy and government tricolor cues reflect the sovereign authority of the Panchayati Raj institution and Uttarakhand state governance.
2. **Citizen-Centric Accessibility (नागरिक सुलभता):** High-contrast, bilingual (Hindi & English), WCAG 2.1 AA compliant interface crafted for rural, semi-urban, and mobile-first citizens.
3. **Regional Heritage & Pride (कुमाऊंनी संस्कृति व ऐंपण परंपरा):** Subtle saffron, amber highlights, and regional visual motifs inspired by Almora’s traditional Aipan art and Himalayan topography.
4. **State-of-the-Art Modern Utility (आधुनिक डिजिटल तकनीक):** Micro-animations, GPS vehicle tracking animations, glassmorphic floating cards, and responsive, fluid components.

---

## 🎨 2. Master Color Palette & Design Tokens

### 2.1 Primary & Government Navy Palette
The core brand colors representing executive reliability, official transparency, and governance.

| Token | Hex Code | Tailwind Class | Semantic Usage |
| :--- | :--- | :--- | :--- |
| **Navy 950** | `#030712` | `bg-navy-950` / `text-navy-950` | High-contrast banners, deepest modal overlays |
| **Navy 900 (Primary)** | `#0b1b36` | `bg-navy-900` / `text-navy-900` | Official header, primary buttons, major headings |
| **Navy 800** | `#0f2942` | `bg-navy-800` / `text-navy-800` | Card headers, table headers, hover states |
| **Navy 700** | `#1e293b` | `bg-navy-700` / `text-navy-700` | Secondary dark text, slate contrast |
| **Primary Blue 600** | `#1d4ed8` | `bg-primary-600` / `text-primary-600`| Digital hyperlinks, interactive focus rings |
| **Primary Blue 500** | `#3b82f6` | `bg-primary-500` / `text-primary-500`| Active toggle states, info banners |
| **Primary Blue 50** | `#eff6ff` | `bg-primary-50` | Informational callout backgrounds |

---

### 2.2 Uttarakhand Nature & Green Palette
Represents the pristine Himalayan ecology of Uttarakhand, Swachh Bharat initiatives, and positive status states.

| Token | Hex Code | Tailwind Class | Semantic Usage |
| :--- | :--- | :--- | :--- |
| **UK Green 900** | `#14532d` | `bg-ukgreen-900` / `text-ukgreen-900` | Deep environmental accents, footer borders |
| **UK Green 700** | `#15803d` | `bg-ukgreen-700` / `text-ukgreen-700` | Swachhata badges, resolved complaint tags |
| **UK Green 600** | `#16a34a` | `bg-ukgreen-600` / `text-ukgreen-600` | Live GPS status pulse, success alerts |
| **UK Green 100** | `#dcfce7` | `bg-ukgreen-100` / `text-ukgreen-800` | Success badges, verified user pills |
| **UK Green 50** | `#f0fdf4` | `bg-ukgreen-50` | Swachhata pledge card backgrounds |

---

### 2.3 Himalayan Saffron & Amber Accents
Evoking Uttarakhand's cultural heritage, Devbhoomi sanctity, alert states, and energetic user engagement.

| Token | Hex Code | Tailwind Class | Semantic Usage |
| :--- | :--- | :--- | :--- |
| **UK Saffron 700** | `#c2410c` | `bg-uksaffron-700` / `text-uksaffron-700` | High-priority grievance badges, urgent alerts |
| **UK Saffron 600** | `#ea580c` | `bg-uksaffron-600` / `text-uksaffron-600` | Notice highlights, call-to-action indicators |
| **Amber 500** | `#d97706` | `bg-amber-500` / `text-amber-500` | Official accent lines, gold stars, warning states |
| **Amber 400** | `#fbbf24` | `bg-amber-400` / `text-amber-400` | 3D Almora text sparkle, decorative accents |
| **Amber 100** | `#fef3c7` | `bg-amber-100` / `text-amber-800` | Pending grievance status, upcoming service tags |
| **Warm Sand** | `#faf8f5` | `bg-[#faf8f5]` | Top notification bar, warm surface tint |

---

### 2.4 Neutral, Surface & Background Palette
Balanced greys engineered to reduce eye strain and provide contrast.

| Token | Hex Code | Tailwind Class | Semantic Usage |
| :--- | :--- | :--- | :--- |
| **Surface White** | `#ffffff` | `bg-white` | Card backgrounds, dialogs, inputs |
| **Page Canvas** | `#eef1f6` | `bg-[#eef1f6]` / `bg-slate-50` | Master page background (home & admin) |
| **Border Neutral** | `#e2e8f0` | `border-slate-200` | Standard card and section dividing lines |
| **Muted Text** | `#64748b` | `text-slate-500` | Subtitles, timestamps, breadcrumbs |
| **Dark Body Text** | `#1e293b` | `text-slate-800` | Default paragraph and table body typography |

---

### 2.5 Official Government Gradients & Line Accents

```css
/* Uttarakhand State Tricolor Accent Ribbon */
.uk-tricolor-line {
  height: 3px;
  background: linear-gradient(90deg, #15803d 0%, #d97706 50%, #1d4ed8 100%);
}

/* Government Tricolor Top Accent Banner */
.uk-gov-tricolor-strip {
  height: 6px;
  background: linear-gradient(90deg, #f97316 0%, #ffffff 50%, #16a34a 100%);
}

/* Official Government Hero Header Gradient */
.gov-hero-gradient {
  background: linear-gradient(135deg, #030712 0%, #0b1b36 50%, #0f2942 100%);
}
```

---

## 🔤 3. Bilingual Typography System

The typography system pairs clean, readable Latin fonts with authentic, high-legibility Devanagari fonts.

### 3.1 Font Families

| Font Family | Primary Script | Fallbacks | Typical Use Cases |
| :--- | :--- | :--- | :--- |
| **Poppins** | Latin / Display | `Hind`, `Noto Sans Devanagari`, `sans-serif` | Hero titles, section H1/H2, statistics numerals |
| **Inter** | Latin / UI Body | `Hind`, `Noto Sans Devanagari`, `sans-serif` | Form inputs, buttons, body copy, tables |
| **Hind** | Devanagari / Hindi | `Noto Sans Devanagari`, `sans-serif` | Official Hindi department titles, gazette text |
| **Noto Sans Devanagari** | Devanagari / Body | `sans-serif` | Long-form Hindi paragraphs, complaints, rules |

### 3.2 Type Hierarchy & Scale

| Style Level | Font Size (Desktop / Mobile) | Weight | Line Height | Tracking | Application |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display 1** | `48px` / `32px` (`text-3xl sm:text-5xl`) | 800 (ExtraBold) | 1.15 | `-0.02em` | Portal Hero Headline |
| **Heading 1** | `36px` / `26px` (`text-2xl sm:text-4xl`) | 700 (Bold) | 1.25 | `-0.01em` | Section Titles (`<h2>`) |
| **Heading 2** | `24px` / `20px` (`text-xl sm:text-2xl`) | 700 (Bold) | 1.30 | `normal` | Sub-sections, Card Titles |
| **Heading 3** | `18px` / `16px` (`text-base sm:text-lg`) | 600 (SemiBold) | 1.40 | `normal` | Modal titles, form group labels |
| **Body Large** | `16px` / `15px` (`text-base`) | 400 / 500 | 1.60 | `normal` | Hero lead paragraphs, intro text |
| **Body Base** | `14px` / `13px` (`text-sm`) | 400 / 500 | 1.50 | `normal` | Default body copy, descriptions |
| **Caption / Meta** | `12px` / `11px` (`text-xs`) | 500 / 600 | 1.40 | `+0.01em` | Badges, timestamps, footer links |
| **Micro / Status** | `10px` (`text-[10px]`) | 700 (Bold) | 1.20 | `+0.05em` | LIVE badges, notification pills |

---

## 📐 4. Spacing, Layout & Responsive Grid

### 4.1 Layout Containers
All content is bound within standardized responsive max-width containers with horizontal padding:
- **Max-Width:** `max-w-7xl` (`1280px`) — Default content width
- **Extended Width:** `max-w-[1440px]` — Complex dashboards & Live GIS mapping
- **Reading Width:** `max-w-3xl` (`768px`) — Public Grievance forms, Policy pages
- **Padding:** `px-4 sm:px-6 lg:px-8`

### 4.2 Breakpoint Matrix

| Token | Breakpoint | Target Devices | Key Adaptations |
| :--- | :--- | :--- | :--- |
| **xs** | `< 360px` | Small budget phones | Fluid typography (`html: 14px`), stack flex items |
| **sm** | `640px` | Large smartphones | 2-column card layouts, drawer navigation |
| **md** | `768px` | Tablets / iPad | Horizontal action bars, 2-to-3 column grids |
| **lg** | `1024px` | Small laptops | Full desktop navbar menu displays |
| **xl** | `1280px` | Standard desktops | Complete multi-column dashboards, expanded map UI |
| **2xl** | `1536px` | Large monitors | Max-width constraints centered with auto margins |

---

## 🧱 5. Elevation, Radii & Component Styling

### 5.1 Border Radii
- **Input Fields & Small Buttons:** `rounded-lg` (`8px`)
- **Action Buttons & Badges:** `rounded-xl` (`12px`) or `rounded-full` (Pills)
- **Standard Content Cards:** `rounded-2xl` (`16px`)
- **Large Modals & Feature Blocks:** `rounded-3xl` (`24px`)

### 5.2 Elevation & Depth (Shadows)
- **Card Rest:** `shadow-xs border border-slate-200/90 bg-white`
- **Card Hover:** `hover:shadow-xl hover:-translate-y-1 transition-all duration-300`
- **Dropdown & Flyout:** `shadow-xl border border-slate-200/90 rounded-xl`
- **Floating Modals:** `shadow-2xl backdrop-blur-md bg-black/60`

### 5.3 Glassmorphism Standard
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(226, 232, 240, 0.8);
}
```

---

## 🧭 6. Modular Dual-Portal Navigation Architecture

To keep the official governance site clean while providing specialized tools for solid waste management, the navigation is decoupled into two independent navbar systems:

```
                  ┌────────────────────────────────────────┐
                  │       Navbar Smart Delegator           │
                  │       (src/components/Navbar.tsx)      │
                  └──────────────────┬─────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌───────────────────────────────┐           ┌────────────────────────────────────┐
│      NavbarLandingPage        │           │        NavbarSafaiPortal           │
│ (src/landing-page/Navbar...)  │           │  (src/safai-portal/Navbar...)      │
├───────────────────────────────┤           ├────────────────────────────────────┤
│ • Home                        │           │ • Back to Main Portal (← मुख्य...)  │
│ • About Almora (Dropdown)     │           │ • About Portal (ठोस अपशिष्ट परिचय) │
│ • Services Hub (Dropdown:     │           │ • Bylaws & SWM Rules 2026          │
│     - Safai Portal [Live]     │           │ • Complaints (Submit & Track)      │
│     - Rental System [Soon])   │           │ • Daily Work & Vehicle Logs        │
│ • 11 Development Blocks       │           │ • Swachhata Pledge Certificate     │
│ • Notices & Gazette Tenders   │           │ • 🔑 Admin Login & Sign-Up Buttons │
│ • Contact Us                  │           └────────────────────────────────────┘
│ • Quick 'सफाई पोर्टल' Pill    │
│ ❌ NO Admin / Sign-In Buttons │
└───────────────────────────────┘
```

---

## ✨ 7. Motion, Micro-Interactions & Special Animations

### 7.1 Interactive 3D "Almora" Text Roll
- **Trigger:** On-click user interaction on the portal title badge.
- **Visuals:** 3D perspective rotation with luminous gold highlight.
- **Classes:** `.almora-roll-box`, `.almora-roll-word`, `.is-rolling`

```css
@keyframes almoraTextRoll {
  0%   { transform: perspective(600px) translateY(0) rotateX(0deg); }
  30%  { transform: perspective(600px) translateY(-3px) rotateX(120deg); color: #fef08a; }
  70%  { transform: perspective(600px) translateY(2px) rotateX(260deg); color: #fde047; }
  100% { transform: perspective(600px) translateY(0) rotateX(360deg); color: #ffffff; }
}
```

### 7.2 GPS Live Radar Pulse (GIS Mapping)
- **Application:** Displays on active waste-collection vehicles and real-time GPS indicators.
- **Class:** `.live-radar-ping`

```css
@keyframes livePulseRadar {
  0%   { transform: scale(0.85); opacity: 0.9; }
  70%  { transform: scale(1.6); opacity: 0; }
  100% { transform: scale(1.6); opacity: 0; }
}
```

### 7.3 Infinite Marquee Scrolling (Services Carousel)
- **Application:** Infinite moving cards showing development schemes and sanitation work.
- **Class:** `.animate-infinite-moving-carousel` (Pauses on hover for readability).

---

## 🖨️ 8. High-Fidelity Printing Guidelines (Grievance Receipts)

When citizens file or track a grievance, clicking **"Print Receipt"** generates an official government acknowledgment:
- All non-receipt layout elements (navbars, headers, footers, buttons) are hidden via `body * { visibility: hidden !important; }`.
- `.printable-receipt` expands to `100%` width with high-contrast borders and sharp typography.
- Standard A4 margins: `@page { margin: 1cm; size: auto; }`.

---

## 🏛️ 9. Official Logos & Seal Specifications

| Symbol | Asset Path / URL | Placement | Dimensions |
| :--- | :--- | :--- | :--- |
| **Uttarakhand State Emblem** | `/assets/logos/logo1.png` | Top header left, Favicon, Certificate | `48px` to `96px` |
| **Zila Panchayat Almora Crest**| `/logo2.png` | Top header, Navbar branding | `48px` to `64px` |
| **Swachh Bharat Mission (Grameen)** | `/assets/logos/logo3.png` | Top header center, Safai Banner | `44px` to `80px` |
| **Ministry of Panchayati Raj (MoPR)** | `https://zila-panchayat-images.s3.ap-south-1.amazonaws.com/portal-logos/MoPR.png` | Top header right | `48px` to `96px` |

---

## 🛡️ 10. Security & Compliance Design Standards

- **Strict Role-Based Layouts:** Admin navigation and controls are isolated to protected routes (`/dashboard/*`).
- **CSRF & Rate Limiting Indicators:** Public forms display clear countdown timers and friendly retry messaging during high load.
- **Mobile Touch Safeguards:** Minimum touch targets of `44px × 44px` across all interactive elements (`.touch-target`).
- **Screen Reader (ARIA):** Proper semantic markup (`role="region"`, `aria-expanded`, `aria-label`) on all dynamic accordions, dropdowns, and dialogs.

---
*Created for: Zila Panchayat Almora, Department of Panchayati Raj, Government of Uttarakhand.*  
*Maintained in: `design.md`*
