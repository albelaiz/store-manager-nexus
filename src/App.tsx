import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import PopularItems from "./pages/PopularItems";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import QuickScan from "./pages/QuickScan";
import UserManagement from "./pages/UserManagement";
import { checkAndMigrate } from "./utils/fileStorage";
import { toast } from "sonner";
import { AuthProvider, useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

// Protected route component with permission check
const ProtectedRoute = ({ 
  children, 
  requiredPermission 
}: { 
  children: React.ReactNode;
  requiredPermission?: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn, hasPermission, isAdmin } = useAuth();
  
  useEffect(() => {
    // Short delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    // Still checking login status
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // If permission is required, check if user has it or is admin
  if (requiredPermission && !hasPermission(requiredPermission) && !isAdmin) {
    toast.error("Access denied", {
      description: "You don't have permission to view this page"
    });
    return <Navigate to="/dashboard/orders" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  // Initialize the database and migrate data from localStorage if needed
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize users array in localStorage if it doesn't exist
        if (!localStorage.getItem("users")) {
          // Create admin user directly here to ensure it exists
          const adminUser = {
            id: "admin-id",
            name: "Admin User",
            username: "admin",
            password: "password",
            role: "admin"
          };
          localStorage.setItem("users", JSON.stringify([adminUser]));
          console.log("Admin user initialized in App component");
        } else {
          // Check if admin user exists in the users array
          const users = JSON.parse(localStorage.getItem("users") || '[]');
          const adminExists = users.some((user: any) => user.username === 'admin');
          
          if (!adminExists) {
            const adminUser = {
              id: "admin-id",
              name: "Admin User",
              username: "admin",
              password: "password",
              role: "admin"
            };
            users.push(adminUser);
            localStorage.setItem("users", JSON.stringify(users));
            console.log("Admin user added to existing users array");
          }
        }
        
        // Initialize products array if it doesn't exist
        if (!localStorage.getItem("products")) {
          localStorage.setItem("products", JSON.stringify([]));
        }
        
        // Initialize orders array if it doesn't exist
        if (!localStorage.getItem("orders")) {
          localStorage.setItem("orders", JSON.stringify([]));
        }
        
        // Initialize user-specific storage if it doesn't exist
        if (!localStorage.getItem("userOrders")) {
          localStorage.setItem("userOrders", JSON.stringify([]));
        }
        
        if (!localStorage.getItem("userProducts")) {
          localStorage.setItem("userProducts", JSON.stringify([]));
        }
        
        // Initialize notifications if they don't exist
        if (!localStorage.getItem("notifications")) {
          const defaultNotifications = [
            {
              id: 1,
              title: "New Order",
              message: "You received a new order from John Doe",
              time: "5 minutes ago",
              read: false
            },
            {
              id: 2,
              title: "Low Stock Alert",
              message: "Product 'Wireless Earbuds' is running low on stock",
              time: "3 hours ago",
              read: false
            },
            {
              id: 3,
              title: "Payment Received",
              message: "Payment of $120.50 has been processed",
              time: "Yesterday",
              read: true
            }
          ];
          localStorage.setItem("notifications", JSON.stringify(defaultNotifications));
        }

        // Check if we need to migrate data from localStorage to IndexedDB
        await checkAndMigrate();
      } catch (error) {
        console.error("Error initializing app:", error);
        toast.error("Failed to initialize app", {
          description: "Please refresh the page and try again"
        });
      }
    };

    initializeApp();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes - Login is now the default route */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Dashboard Routes - Protected */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                {/* Admin-only routes */}
                <Route index element={
                  <ProtectedRoute requiredPermission="access_admin_dashboard">
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="popular" element={
                  <ProtectedRoute requiredPermission="access_admin_dashboard">
                    <PopularItems />
                  </ProtectedRoute>
                } />
                <Route path="users" element={
                  <ProtectedRoute requiredPermission="access_admin_dashboard">
                    <UserManagement />
                  </ProtectedRoute>
                } />
                
                {/* User-accessible routes */}
                <Route path="orders" element={
                  <ProtectedRoute requiredPermission="view_own_orders">
                    <Orders />
                  </ProtectedRoute>
                } />
                <Route path="products" element={
                  <ProtectedRoute requiredPermission="view_products">
                    <Products />
                  </ProtectedRoute>
                } />
                <Route path="profile" element={
                  <ProtectedRoute requiredPermission="view_profile">
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="settings" element={
                  <ProtectedRoute requiredPermission="view_settings">
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="quick-scan" element={
                  <ProtectedRoute requiredPermission="view_products">
                    <QuickScan />
                  </ProtectedRoute>
                } />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
