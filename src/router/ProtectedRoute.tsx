import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { ACCESS_TOKEN } from "../constants/auth/auth";

const ProtectedRoute: React.FC = () => {
  const isAuthenticated = localStorage.getItem(ACCESS_TOKEN);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
