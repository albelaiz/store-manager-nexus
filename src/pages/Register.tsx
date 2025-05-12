
import React from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";

const Register: React.FC = () => {
  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Create Your Account</h2>
        <p className="text-sm text-gray-600 mt-1">
          Sign up with a username and password to access the store
        </p>
      </div>
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
