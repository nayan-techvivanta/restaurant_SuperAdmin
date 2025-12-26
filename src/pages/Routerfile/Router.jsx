import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "../auth/Login";
import Dashboard from "../main/Dashboard";
import Layout from "../../layouts/Layout";
import Restaurants from "../main/Restaurants";
import Users from "../main/Users";
import Analytics from "../main/Analytics";
import Settings from "../main/Settings";
import Forgotpass from "../auth/Forgotpass";
import VerifyOtp from "../auth/VeryfyOtp";
import ResetPassword from "../auth/ResetPassword";
import AuthRoute from "../../components/AuthRoute";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthRoute>
              <Forgotpass />
            </AuthRoute>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <AuthRoute>
              <VerifyOtp />
            </AuthRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AuthRoute>
              <ResetPassword />
            </AuthRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/users" element={<Users />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
