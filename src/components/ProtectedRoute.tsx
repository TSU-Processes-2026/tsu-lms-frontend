import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Компонент ProtectedRoute ограничивает доступ к маршрутам для неавторизованных пользователей.
// Если пользователь авторизован (accessToken есть в localStorage), отображает дочерние маршруты.
// Если пользователь не авторизован, перенаправляет на страницу входа.
const ProtectedRoute: React.FC = () => {
  const isAuthenticated = Boolean(localStorage.getItem("accessToken"));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
