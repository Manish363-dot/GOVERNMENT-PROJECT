import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from 'sonner';

import { GooglePasskeyModal } from '@/components/GooglePasskeyModal';
import { AuthRedirectHandler } from '@/components/AuthRedirectHandler';

// --- Lazy Load Pages ---
// By using lazy loading, the browser only downloads the JavaScript for the page the user is currently on, significantly speeding up the initial load time.
const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const SignUpPage = lazy(() => import('@/pages/SignUpPage').then(m => ({ default: m.SignUpPage })));
const SignInPage = lazy(() => import('@/pages/SignInPage').then(m => ({ default: m.SignInPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const TermsOfUsePage = lazy(() => import('@/pages/TermsOfUsePage').then(m => ({ default: m.TermsOfUsePage })));
const AboutWebsitePage = lazy(() => import('@/pages/AboutWebsitePage').then(m => ({ default: m.AboutWebsitePage })));
const WebsitePolicyPage = lazy(() => import('@/pages/WebsitePolicyPage').then(m => ({ default: m.WebsitePolicyPage })));
const SiteMapPage = lazy(() => import('@/pages/SiteMapPage').then(m => ({ default: m.SiteMapPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const ComplaintPage = lazy(() => import('@/pages/ComplaintPage').then(m => ({ default: m.ComplaintPage })));
const OurInitiativePage = lazy(() => import('@/pages/OurInitiativePage').then(m => ({ default: m.OurInitiativePage })));
const VisionMissionPage = lazy(() => import('@/pages/VisionMissionPage').then(m => ({ default: m.VisionMissionPage })));
const StaffDirectoryPage = lazy(() => import('@/pages/StaffDirectoryPage').then(m => ({ default: m.StaffDirectoryPage })));
const BylawsPage = lazy(() => import('@/pages/BylawsPage').then(m => ({ default: m.BylawsPage })));
const CleanlinessBylawsPage = lazy(() => import('@/pages/CleanlinessBylawsPage').then(m => ({ default: m.CleanlinessBylawsPage })));
const SwmRulesPage = lazy(() => import('@/pages/SwmRulesPage').then(m => ({ default: m.SwmRulesPage })));

// Dashboard Lazy Pages
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const LiveTrackingPage = lazy(() => import('@/pages/dashboard/LiveTrackingPage').then(m => ({ default: m.LiveTrackingPage })));
const VehicleHistoryPage = lazy(() => import('@/pages/dashboard/VehicleHistoryPage').then(m => ({ default: m.VehicleHistoryPage })));
const RouteReplayPage = lazy(() => import('@/pages/dashboard/RouteReplayPage').then(m => ({ default: m.RouteReplayPage })));
const ComplaintsPage = lazy(() => import('@/pages/dashboard/ComplaintsPage').then(m => ({ default: m.ComplaintsPage })));
const VehiclesPage = lazy(() => import('@/pages/dashboard/VehiclesPage').then(m => ({ default: m.VehiclesPage })));
const MediaDailyWorkPage = lazy(() => import('@/pages/dashboard/MediaDailyWorkPage').then(m => ({ default: m.MediaDailyWorkPage })));

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50/50">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthRedirectHandler />
        <GooglePasskeyModal />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/our-initiative" element={<OurInitiativePage />} />
              <Route path="/initiative" element={<OurInitiativePage />} />
              <Route path="/vision-mission" element={<VisionMissionPage />} />
              <Route path="/staff-directory" element={<StaffDirectoryPage />} />
              <Route path="/staff-info" element={<StaffDirectoryPage />} />
              <Route path="/terms-of-use" element={<TermsOfUsePage />} />
              <Route path="/about-website" element={<AboutWebsitePage />} />
              <Route path="/website-policy" element={<WebsitePolicyPage />} />
              <Route path="/sitemap" element={<SiteMapPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/complaint" element={<ComplaintPage />} />
              <Route path="/complaints" element={<ComplaintPage />} />
              <Route path="/bylaws" element={<CleanlinessBylawsPage />} />
              <Route path="/cleanliness-bylaws" element={<CleanlinessBylawsPage />} />
              <Route path="/bylaws/cleanliness" element={<CleanlinessBylawsPage />} />
              <Route path="/rules" element={<SwmRulesPage />} />
              <Route path="/swm-rules-2026" element={<SwmRulesPage />} />
              <Route path="/bylaws/swm-rules-2026" element={<SwmRulesPage />} />
              <Route path="/bylaws/rules-2026" element={<SwmRulesPage />} />
            </Route>

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
