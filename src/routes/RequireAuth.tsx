import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const RequireAuth: React.FC = () => {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/" replace state={{ from: loc }} />;
  return <Outlet />;
};

export default RequireAuth;
