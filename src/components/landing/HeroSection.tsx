
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  // Automatically navigate to login
  React.useEffect(() => {
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-gray-600">Please wait while we redirect you to the login page.</p>
      </div>
    </div>
  );
};

export default HeroSection;
