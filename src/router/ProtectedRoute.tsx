import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useTokenStore } from "../hooks/auth/useTokenStore";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useTokenStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
