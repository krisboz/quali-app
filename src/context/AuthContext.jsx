import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now(); // Convert expiry time to milliseconds
        if (isExpired) {
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
          toast.error("Session expired. Please log in again.");
        } else {
          setUser(decoded); // Store decoded token data (like username, roles, etc.)
          setIsAuthenticated(true);
          toast.success(`Welcome back, ${decoded.username}!`);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        toast.error("Invalid token");
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, setUser, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
