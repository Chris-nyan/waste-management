import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useAuth from './hooks/use-auth';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

// A component to protect routes that require authentication
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // While we are checking for a user, show a loading message
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If there is a user, render the child routes (e.g., the dashboard)
  // Otherwise, redirect them to the sign-in page
  return user ? <Outlet /> : <Navigate to="/signin" replace />;
};

// A placeholder for our main dashboard
const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="flex flex-col justify-center items-center h-screen font-poppins">
      <h1 className="text-3xl font-bold">Welcome to the Dashboard!</h1>
      <p className="mt-2">Your role is: <span className="font-bold text-primary">{user?.role}</span></p>
      <button 
        onClick={logout} 
        className="mt-6 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90"
      >
        Logout
      </button>
    </div>
  );
}

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/signin" />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add other protected routes here in the future */}
        </Route>
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;

