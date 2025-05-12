
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";

const RegisterForm: React.FC = () => {
  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (!name || !username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Registering user:", { name, username });
      
      // Get existing users or initialize an empty array
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Check if user already exists
      const userExists = existingUsers.some((user: any) => user.username === username);
      if (userExists) {
        toast({
          title: "Error",
          description: "An account with this username already exists.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Create unique user ID
      const userId = `user_${Date.now()}`;
      
      // Save user data to localStorage (simulating a database)
      const userData = {
        id: userId,
        name,
        username, // Store username instead of email
        password, // In a real app, this should be hashed
        role: 'user', // Default role for new registrations
        createdAt: new Date().toISOString()
      };
      
      // Add the new user to the array and save back to localStorage
      existingUsers.push(userData);
      localStorage.setItem("users", JSON.stringify(existingUsers));
      
      toast({
        title: "Account created",
        description: "You have successfully registered an account. Please sign in.",
      });
      
      // Added slight delay before navigation
      setTimeout(() => {
        navigate("/login");
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="johndoe"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-store-DEFAULT hover:bg-store-DEFAULT/90"
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
      <div className="text-center text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <Link
          to="/login"
          className="text-store-DEFAULT hover:text-store-DEFAULT/80"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
