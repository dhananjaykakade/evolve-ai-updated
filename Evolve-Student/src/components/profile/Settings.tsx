
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Bell, Globe, Lock } from 'lucide-react';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-xl font-medium">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Appearance</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              <Label htmlFor="dark-mode">Dark Mode</Label>
            </div>
            <Switch 
              id="dark-mode" 
              checked={theme === 'dark'} 
              onCheckedChange={toggleTheme} 
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notifications</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} />
              <Label htmlFor="email-notifications">Email Notifications</Label>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} />
              <Label htmlFor="app-notifications">In-App Notifications</Label>
            </div>
            <Switch id="app-notifications" defaultChecked />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Privacy</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe size={18} />
              <Label htmlFor="profile-visibility">Public Profile</Label>
            </div>
            <Switch id="profile-visibility" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock size={18} />
              <Label htmlFor="activity-tracking">Activity Tracking</Label>
            </div>
            <Switch id="activity-tracking" defaultChecked />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Settings;
