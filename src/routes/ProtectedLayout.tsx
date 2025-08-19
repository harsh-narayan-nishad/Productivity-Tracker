import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Outlet } from "react-router-dom";

const ProtectedLayout: React.FC = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

export default ProtectedLayout;
