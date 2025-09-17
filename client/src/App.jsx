import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useAuth from './hooks/use-auth';

// --- Core Pages ---
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
// Corrected the filename in the import path below
import VendorRegistrationPage from './pages/vendor/VendorRegisterationPage';

// --- User Pages ---
import DashboardPage from './pages/user/DashboardPage';
import FindVendorPage from './pages/user/FindVendorPage';
import BookingsPage from './pages/user/BookingsPage';

// --- Secure Destruction Pages ---
import SecureDestructionPage from './pages/user/SecureDestructionPage';
import PaperShreddingPage from './pages/user/PaperShreddingPage';
import EWasteDestructionPage from './pages/user/EWasteDestructionPage';
import ReportingPage from './pages/user/Reporting&CertificationPage';

// --- Vendor Pages ---
import VendorDashboardPage from './pages/vendor/VendorPickupPage';
import VendorCalendarPage from './pages/vendor/VendorCalendarPage';
import VendorStatsPage from './pages/vendor/VendorStatsPage'; 

// --- Placeholder Admin Dashboard ---
const AdminDashboard = () => (
  <div className="flex justify-center items-center h-screen">
    <h1 className="text-3xl font-bold">Admin Dashboard (Coming Soon)</h1>
  </div>
);

// --- Protected Route Wrapper ---
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading Session...</div>;
  }
  return user ? <Outlet /> : <Navigate to="/signin" state={{ from: location }} replace />;
};

// --- Role-Based Redirector ---
const DashboardRedirect = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case 'USER':
      return <Navigate to="/user/dashboard" replace />;
    case 'VENDOR':
      return <Navigate to="/vendor/impact" replace />;
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/signin" replace />;
  }
};

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/vendor-register" element={<VendorRegistrationPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          
          {/* User Routes */}
          <Route path="/user/dashboard" element={<DashboardPage />} />
          <Route path="/user/find-vendor" element={<FindVendorPage />} />
          <Route path="/user/bookings" element={<BookingsPage />} />
          <Route path="/user/secure-destruction" element={<SecureDestructionPage />} />
          <Route path="/user/secure-destruction/paper-shredding" element={<PaperShreddingPage />} />
          <Route path="/user/secure-destruction/e-waste" element={<EWasteDestructionPage />} />
          <Route path="/user/secure-destruction/reporting" element={<ReportingPage />} />

          {/* Vendor Routes */}
          <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
          <Route path="/vendor/calendar" element={<VendorCalendarPage />} />
          <Route path="/vendor/impact" element={<VendorStatsPage />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default App;

