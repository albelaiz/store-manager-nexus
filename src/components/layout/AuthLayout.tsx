
import React from "react";
import { Outlet } from "react-router-dom";

interface AuthLayoutProps {
  children?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-store-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/a0b3eabb-b33c-49be-bf31-98d107198ed8.png" 
              alt="najihkids Logo" 
              className="h-16" 
            />
          </div>
          <h1 className="text-2xl font-bold text-store-DEFAULT">najihkids</h1>
          <p className="text-gray-600">Manage your store efficiently</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
