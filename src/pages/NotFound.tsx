
import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-6">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          Oops! The page you're looking for isn't here.
        </p>
        <p className="text-gray-500 mb-8">
          The URL <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code> might be incorrect or the
          page may have been moved or deleted.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-store-DEFAULT text-store-DEFAULT hover:bg-store-secondary"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="bg-store-DEFAULT hover:bg-store-DEFAULT/90"
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
