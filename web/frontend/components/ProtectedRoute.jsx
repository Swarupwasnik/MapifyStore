import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../text/context/AuthContext";

function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
