import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useAuth from './hooks/use-auth';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import FindVendorPage from './pages/user/FindVendorPage';
// Corrected the import path to include the '/user' sub-directory
import BookingsPage from './pages/user/BookingsPage'; 
import DashboardPage from './pages/user/DashboardPage';
// --- Placeholder Dashboards ---
const VendorDashboard = () => (
  <div className="flex justify-center items-center h-screen">
    <h1 className="text-3xl font-bold">Vendor Dashboard (Coming Soon)</h1>
  </div>
);
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
            return <Navigate to="/vendor/dashboard" replace />;
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
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/user/dashboard" element={<DashboardPage />} />
          <Route path="/user/find-vendors" element={<FindVendorPage />} />
          <Route path="/user/mybookings" element={<BookingsPage />} /> 
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default App;

