import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/axios';

// 1. Create the context with a default value
const AuthContext = createContext({
  user: null,
  setUser: () => {},
  loading: true,
  login: () => {},
  logout: () => {},
});

// 2. Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true

  useEffect(() => {
    // This effect runs once when the app loads to check for an existing token
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decodedUser = jwtDecode(token);
          // Check if the token is expired
          if (decodedUser.exp * 1000 > Date.now()) {
            setUser(decodedUser);
          } else {
            // Token is expired, remove it
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false); // Finished checking, set loading to false
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    // The actual API call is made in the SignInPage component.
    // This function is primarily for updating the context state.
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    // We can also redirect the user here if needed, e.g., window.location.href = '/signin';
  };

  // The value that will be available to all consuming components
  const contextValue = {
    user,
    setUser,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Export the context so we can use it in other components
export default AuthContext;

