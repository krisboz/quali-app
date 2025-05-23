import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // NEW

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const isExpired = false; // add your expiry logic later

        if (isExpired) {
          localStorage.removeItem("token");
          setUser(null);
          setIsAuthenticated(false);
          toast.error("Session expired. Please log in again.");
        } else {
          setUser(decoded);
          setIsAuthenticated(true);
          toast.success(`Welcome back, ${decoded.username}!`);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
        toast.error("Invalid token");
      }
    }

    setLoading(false); // ✅ Set loading to false once token check is done
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, setUser, setIsAuthenticated, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
