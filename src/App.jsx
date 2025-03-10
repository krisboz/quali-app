import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import LoginForm from './components/Login';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/dashboard/Dashboard';
import QualityInput from './components/QualityInput';
import PrivateRoute from './components/PrivateRoute';
import UserProfile from './components/UserProfile';
import Auswertungen from './components/Auswertungen';
import { toast } from 'react-toastify';
import Inspection from './pages/inspection/Inspection';



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.username) {
          setIsAuthenticated(true);
          toast.success("Welcome back!");
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        toast.error("Invalid token")
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/app/dashboard" replace />
            ) : (
              <LoginForm setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        {/* Protected route that wraps the whole app layout */}
        <Route
          path="/app"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AppLayout setIsAuthenticated={setIsAuthenticated} />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="quality-reports" element={<QualityInput />} />
          <Route path="auswertungen" element={<Auswertungen />} />
          <Route path="inspection" element={<Inspection />} />



          <Route path="profile" element={<UserProfile />} /> {/* New profile route */}
          {/* Redirect base /app to dashboard */}
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/app/dashboard" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
