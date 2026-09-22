import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from 'sonner';

// Public pages
import { HomePage } from '@/pages/HomePage';
import { SignUpPage } from '@/pages/SignUpPage';
import { SignInPage } from '@/pages/SignInPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';

// Dashboard pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { LiveTrackingPage } from '@/pages/dashboard/LiveTrackingPage';
import { VehicleHistoryPage } from '@/pages/dashboard/VehicleHistoryPage';
import { RouteReplayPage } from '@/pages/dashboard/RouteReplayPage';
import { ComplaintsPage } from '@/pages/dashboard/ComplaintsPage';
import { VehiclesPage } from '@/pages/dashboard/VehiclesPage';

import { GooglePasskeyModal } from '@/components/GooglePasskeyModal';
import { AuthRedirectHandler } from '@/components/AuthRedirectHandler';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthRedirectHandler />
        <GooglePasskeyModal />
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
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
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
