
import React from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/card";

const Login: React.FC = () => {
  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Sign In to Store Manager</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter your credentials to access your account
        </p>
      </div>
      <LoginForm />
      
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <div className="p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Admin Access</h3>
          <div className="text-sm space-y-1 text-blue-700">
            <p className="font-medium">Username: <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">admin</span></p>
            <p className="font-medium">Password: <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">password</span></p>
          </div>
        </div>
      </Card>
      
      <div className="mt-4 text-center text-xs text-gray-500">
        <p>Regular users: Register an account or contact your administrator</p>
      </div>
    </AuthLayout>
  );
};

export default Login;
