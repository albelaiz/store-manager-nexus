
import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "@/hooks/useAuth";

const DashboardLayout: React.FC = () => {
  const { isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      navigate("/login");
    }
    
    // Redirect to appropriate dashboard based on user role and current location
    if (location.pathname === "/dashboard" && !isAdmin) {
      navigate("/dashboard/orders");
    }
  }, [isLoggedIn, navigate, isAdmin, location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar onMenuClick={() => {}} />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
