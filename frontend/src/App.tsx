import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from 'sonner';

import { GooglePasskeyModal } from '@/components/GooglePasskeyModal';
import { AuthRedirectHandler } from '@/components/AuthRedirectHandler';
import { RouteSEO } from '@/components/RouteSEO';

// --- Lazy Load Pages ---
// By using lazy loading, the browser only downloads the JavaScript for the page the user is currently on, significantly speeding up the initial load time.
// 🏛️ 1. Landing Page Lazy Pages
const HomePage = lazy(() => import('@/landing-page/MainLandingPage').then(m => ({ default: m.MainLandingPage })));
const TermsOfUsePage = lazy(() => import('@/landing-page/TermsOfUsePage').then(m => ({ default: m.TermsOfUsePage })));
const AboutWebsitePage = lazy(() => import('@/landing-page/AboutWebsitePage').then(m => ({ default: m.AboutWebsitePage })));
const WebsitePolicyPage = lazy(() => import('@/landing-page/WebsitePolicyPage').then(m => ({ default: m.WebsitePolicyPage })));
const SiteMapPage = lazy(() => import('@/landing-page/SiteMapPage').then(m => ({ default: m.SiteMapPage })));
const ContactPage = lazy(() => import('@/landing-page/ContactPage').then(m => ({ default: m.ContactPage })));
const OurInitiativePage = lazy(() => import('@/landing-page/OurInitiativePage').then(m => ({ default: m.OurInitiativePage })));
const VisionMissionPage = lazy(() => import('@/landing-page/VisionMissionPage').then(m => ({ default: m.VisionMissionPage })));
const StaffDirectoryPage = lazy(() => import('@/landing-page/StaffDirectoryPage').then(m => ({ default: m.StaffDirectoryPage })));
const MediaGalleryPage = lazy(() => import('@/landing-page/MediaGalleryPage').then(m => ({ default: m.MediaGalleryPage })));
const NotFoundPage = lazy(() => import('@/landing-page/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const ServerErrorPage = lazy(() => import('@/landing-page/ServerErrorPage').then(m => ({ default: m.ServerErrorPage })));
const MaintenancePage = lazy(() => import('@/landing-page/MaintenancePage').then(m => ({ default: m.MaintenancePage })));

// 🟢 2. SWM (Solid Waste Management & Safai Portal) Lazy Pages
const SafaiPortalPage = lazy(() => import('@/swm/pages/SafaiPortalPage').then(m => ({ default: m.SafaiPortalPage })));
const SignUpPage = lazy(() => import('@/swm/pages/SignUpPage').then(m => ({ default: m.SignUpPage })));
const SignInPage = lazy(() => import('@/swm/pages/SignInPage').then(m => ({ default: m.SignInPage })));
const ForgotPasswordPage = lazy(() => import('@/swm/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ComplaintPage = lazy(() => import('@/swm/pages/ComplaintPage').then(m => ({ default: m.ComplaintPage })));
const BylawsPage = lazy(() => import('@/swm/pages/BylawsPage').then(m => ({ default: m.BylawsPage })));
const CleanlinessBylawsPage = lazy(() => import('@/swm/pages/CleanlinessBylawsPage').then(m => ({ default: m.CleanlinessBylawsPage })));
const SwmRulesPage = lazy(() => import('@/swm/pages/SwmRulesPage').then(m => ({ default: m.SwmRulesPage })));

// 🟢 2b. SWM Admin Fleet Dashboard Lazy Pages
const DashboardPage = lazy(() => import('@/swm/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const LiveTrackingPage = lazy(() => import('@/swm/dashboard/LiveTrackingPage').then(m => ({ default: m.LiveTrackingPage })));
const VehicleHistoryPage = lazy(() => import('@/swm/dashboard/VehicleHistoryPage').then(m => ({ default: m.VehicleHistoryPage })));
const RouteReplayPage = lazy(() => import('@/swm/dashboard/RouteReplayPage').then(m => ({ default: m.RouteReplayPage })));
const ComplaintsPage = lazy(() => import('@/swm/dashboard/ComplaintsPage').then(m => ({ default: m.ComplaintsPage })));
const VehiclesPage = lazy(() => import('@/swm/dashboard/VehiclesPage').then(m => ({ default: m.VehiclesPage })));
const MediaDailyWorkPage = lazy(() => import('@/swm/dashboard/MediaDailyWorkPage').then(m => ({ default: m.MediaDailyWorkPage })));

// 🔵 3. Rental & Commercial Asset Platform Lazy Pages
const RentalPortalPage = lazy(() => import('@/rental/RentalPortalPage').then(m => ({ default: m.RentalPortalPage })));
const RentalAdminSignInPage = lazy(() => import('@/rental/RentalAdminSignInPage').then(m => ({ default: m.RentalAdminSignInPage })));

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50/50">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
  </div>
);

const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

function App() {
  if (isMaintenanceMode) {
    return (
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <MaintenancePage />
        </Suspense>
      </BrowserRouter>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthRedirectHandler />
        <GooglePasskeyModal />
        <RouteSEO />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              {/* Official Zila Panchayat Almora Main Portal */}
              <Route path="/" element={<HomePage />} />

              {/* Dedicated Safai & Solid Waste Management Portal */}
              <Route path="/safai-portal" element={<SafaiPortalPage />} />
              <Route path="/swm" element={<SafaiPortalPage />} />
              <Route path="/pledge" element={<SafaiPortalPage />} />
              <Route path="/swachhata-pledge" element={<SafaiPortalPage />} />
              <Route path="/daily-work" element={<SafaiPortalPage />} />
              <Route path="/dailywork" element={<SafaiPortalPage />} />
              <Route path="/waste-protocol" element={<SafaiPortalPage />} />
              <Route path="/waste-segregation" element={<SafaiPortalPage />} />

              {/* Official Portal Sub-Pages */}
              <Route path="/our-initiative" element={<OurInitiativePage />} />
              <Route path="/initiative" element={<OurInitiativePage />} />
              <Route path="/vision-mission" element={<VisionMissionPage />} />
              <Route path="/staff-directory" element={<StaffDirectoryPage />} />
              <Route path="/staff-info" element={<StaffDirectoryPage />} />
              <Route path="/gallery" element={<MediaGalleryPage />} />
              <Route path="/media" element={<MediaGalleryPage />} />
              <Route path="/media-gallery" element={<MediaGalleryPage />} />
              <Route path="/blogs" element={<MediaGalleryPage />} />
              <Route path="/terms-of-use" element={<TermsOfUsePage />} />
              <Route path="/about-website" element={<AboutWebsitePage />} />
              <Route path="/website-policy" element={<WebsitePolicyPage />} />
              <Route path="/sitemap" element={<SiteMapPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/notices" element={<HomePage />} />
              <Route path="/notices-and-updates" element={<HomePage />} />
              <Route path="/complaint" element={<ComplaintPage />} />
              <Route path="/complaints" element={<ComplaintPage />} />
              <Route path="/complaint/register" element={<ComplaintPage />} />
              <Route path="/complaints/register" element={<ComplaintPage />} />
              <Route path="/complaint/track" element={<ComplaintPage />} />
              <Route path="/complaints/track" element={<ComplaintPage />} />
              <Route path="/bylaws" element={<CleanlinessBylawsPage />} />
              <Route path="/cleanliness-bylaws" element={<CleanlinessBylawsPage />} />
              <Route path="/bylaws/cleanliness" element={<CleanlinessBylawsPage />} />
              <Route path="/rules" element={<SwmRulesPage />} />
              <Route path="/swm-rules-2026" element={<SwmRulesPage />} />
              <Route path="/bylaws/swm-rules-2026" element={<SwmRulesPage />} />
              <Route path="/bylaws/rules-2026" element={<SwmRulesPage />} />

            </Route>

            {/* Standalone Error & Status Pages (No Header/Footer for clean focus) */}
            <Route path="/500" element={<ServerErrorPage />} />
            <Route path="/error" element={<ServerErrorPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/under-maintenance" element={<MaintenancePage />} />

            {/* Commercial Asset & Rental Management Platform */}
            <Route path="/rental" element={<RentalPortalPage />} />
            <Route path="/rental-system" element={<RentalPortalPage />} />
            <Route path="/rental/signin" element={<RentalAdminSignInPage initialRole="user" />} />
            <Route path="/rental/login" element={<RentalAdminSignInPage initialRole="user" />} />
            <Route path="/rental/admin/login" element={<RentalAdminSignInPage initialRole="admin" />} />
            <Route path="/rental/admin/signin" element={<RentalAdminSignInPage initialRole="admin" />} />

            {/* 404 Not Found Catch-All Route */}
            <Route path="*" element={<NotFoundPage />} />

            {/* Auth routes (no layout) */}
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="tracking" element={<LiveTrackingPage />} />
              <Route path="history" element={<VehicleHistoryPage />} />
              <Route path="route-replay" element={<RouteReplayPage />} />
              <Route path="complaints" element={<ComplaintsPage />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="media" element={<MediaDailyWorkPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
