
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Edit } from "lucide-react";

interface UserData {
  name: string;
  email: string;
  isAdmin?: boolean;
}

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const { toast } = useToast();
  
  useEffect(() => {
    // Fetch user data from localStorage
    const currentUserStr = localStorage.getItem("currentUser");
    if (currentUserStr) {
      try {
        const parsedUser = JSON.parse(currentUserStr);
        setUserData(parsedUser);
        setName(parsedUser.name);
      } catch (error) {
        console.error("Error parsing user data", error);
      }
    }
  }, []);
  
  const handleUpdateProfile = () => {
    if (!userData) return;
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    // Update user data in localStorage
    const updatedUser = {
      ...userData,
      name: name
    };
    
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setUserData(updatedUser);
    setIsEditing(false);
    
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
  };
  
  if (!userData) {
    return (
      <div className="flex items-center justify-center p-10">
        <p>Loading profile information...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-4xl bg-store-DEFAULT text-white">
                    {userData.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{userData.name}</CardTitle>
              <CardDescription>{userData.email}</CardDescription>
              
              {userData.isAdmin && (
                <span className="inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium bg-store-DEFAULT text-white">
                  Admin
                </span>
              )}
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Manage your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                ) : (
                  <div className="flex items-center p-2 border rounded-md bg-gray-50">
                    <User className="mr-2 h-4 w-4 text-gray-500" />
                    <span>{userData.name}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center p-2 border rounded-md bg-gray-50">
                  <Mail className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{userData.email}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="p-2 border rounded-md bg-gray-50">
                  {userData.isAdmin ? "Administrator" : "Standard User"}
                </div>
              </div>
              
              {isEditing && (
                <div className="pt-4 flex space-x-2">
                  <Button 
                    className="bg-blue-500 hover:bg-store-DEFAULT/90"
                    onClick={handleUpdateProfile}
                  >
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setName(userData.name);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
