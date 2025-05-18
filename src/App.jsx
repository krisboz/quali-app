import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/Login";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import QualityInput from "./components/QualityInput";
import PrivateRoute from "./components/PrivateRoute";
import UserProfile from "./components/UserProfile";
import Auswertungen from "./components/Auswertungen";
import AuthContext, { AuthProvider } from "./context/AuthContext"; // Import the context
import Inspection from "./pages/inspection/Inspection";
import GoldTestManager from "./pages/goldTests/GoldTestManager";
import DiamondScreening from "./pages/diamondScreening/DiamondScreening";
import Items from "./pages/items/Items";
import Stichproben from "./pages/stichprobe/Stichproben";
import "./App.scss";

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
        <Route path="diamond-screening" element={<DiamondScreening />} />
        <Route path="items" element={<Items />} />
        <Route path="stichproben" element={<Stichproben />} />

        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Route>
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? "/app/dashboard" : "/login"}
            replace
          />
        }
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
