
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface NavbarProps {
  onMenuClick: () => void;
}

interface UserData {
  name: string;
  email: string;
  isAdmin?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();

  useEffect(() => {
    // Get current user data from localStorage
    const currentUserStr = localStorage.getItem("currentUser");
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        setUserData(currentUser);
      } catch (error) {
        console.error("Error parsing user data", error);
      }
    }
  }, []);
  
  const handleLogout = () => {
    // Use the logout function from auth context
    logout();
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/a0b3eabb-b33c-49be-bf31-98d107198ed8.png" 
              alt="najihkids Logo" 
              className="h-8 mr-2"
            />
            <h1 className="text-xl font-semibold text-gray-800 ml-2">najihkids</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/settings")}>
            <Settings className="h-5 w-5" />
          </Button>
          
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuLabel>My Profile</DropdownMenuLabel>
              {userData && (
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{userData.name}</p>
                  <p className="text-xs text-gray-500">{userData.email}</p>
                  {userData.isAdmin && (
                    <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-store-DEFAULT text-white">
                      Admin
                    </span>
                  )}
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                <User className="mr-2 h-4 w-4" />Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                <Settings className="mr-2 h-4 w-4" />Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
