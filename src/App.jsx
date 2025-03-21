import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/Login';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/dashboard/Dashboard';
import QualityInput from './components/QualityInput';
import PrivateRoute from './components/PrivateRoute';
import UserProfile from './components/UserProfile';
import Auswertungen from './components/Auswertungen';
import  AuthContext, {AuthProvider}   from './context/AuthContext'; // Import the context
import Inspection from './pages/inspection/Inspection';
import GoldTestManager from './pages/goldTests/GoldTestManager';

function AppRoutes() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/app/dashboard" replace />
          ) : (
            <LoginForm />
          )
        }
      />
      <Route
        path="/app"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="quality-reports" element={<QualityInput />} />
        <Route path="auswertungen" element={<Auswertungen />} />
        <Route path="inspection" element={<Inspection />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="gold-tests" element={<GoldTestManager />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/app/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
