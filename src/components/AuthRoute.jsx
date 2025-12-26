import React from "react";
import { Navigate } from "react-router-dom";

const AuthRoute = ({ children }) => {
  const isAuthenticated =
    localStorage.getItem("access_token") ||
    localStorage.getItem("isAuthenticated") === "true";

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AuthRoute;
