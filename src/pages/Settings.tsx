
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

interface UserSettings {
  darkMode: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  storeTimeZone: string;
  currency: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: true,
    storeTimeZone: "Africa/Casablanca",
    currency: "MAD"
  });
  
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from localStorage if available
    const storedSettings = localStorage.getItem("userSettings");
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (error) {
        console.error("Error parsing settings", error);
      }
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem("userSettings", JSON.stringify(settings));
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <Switch
                    id="darkMode"
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, darkMode: checked })
                    }
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Enable dark mode for a different visual experience.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Change Password</Label>
                <Input id="password" type="password" placeholder="Enter new password" />
              </div>
              
              <div className="pt-4">
                <Button 
                  className="bg-store-DEFAULT hover:bg-store-DEFAULT/90"
                  onClick={saveSettings}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, emailNotifications: checked })
                    }
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Receive notifications about orders and products via email.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <Switch
                    id="pushNotifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, pushNotifications: checked })
                    }
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Receive push notifications for important updates.
                </p>
              </div>
              
              <div className="pt-4">
                <Button 
                  className="bg-store-DEFAULT hover:bg-store-DEFAULT/90"
                  onClick={saveSettings}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>
                Manage your store preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timeZone">Store Time Zone</Label>
                <select
                  id="timeZone"
                  className="w-full p-2 border rounded-md"
                  value={settings.storeTimeZone}
                  onChange={(e) => 
                    setSettings({ ...settings, storeTimeZone: e.target.value })
                  }
                >
                  <option value="UTC">UTC</option>
                  <option value="Africa/Casablanca">Casablanca (GMT+1)</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  className="w-full p-2 border rounded-md"
                  value={settings.currency}
                  onChange={(e) => 
                    setSettings({ ...settings, currency: e.target.value })
                  }
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="MAD">MAD - Moroccan Dirham (DH)</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
              
              <div className="pt-4">
                <Button 
                  className="bg-store-DEFAULT hover:bg-store-DEFAULT/90"
                  onClick={saveSettings}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
