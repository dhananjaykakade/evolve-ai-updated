
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Settings from '@/components/profile/Settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <Layout title="Profile">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Your Profile</h2>
          <p className="text-muted-foreground">
            Manage your account details and preferences.
          </p>
        </div>

        <Tabs defaultValue="profile" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            {/* Profile content goes here - basic user profile info */}
            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
              <div className="flex flex-col items-center gap-4">
                <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center text-4xl font-medium">
                  AJ
                </div>
                <h3 className="text-xl font-medium">Alex Johnson</h3>
                <p className="text-sm text-muted-foreground">Student ID: ST12345</p>
              </div>
              
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Email</h4>
                    <p className="text-sm">alex.johnson@example.edu</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Program</h4>
                    <p className="text-sm">Computer Science</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Year</h4>
                    <p className="text-sm">Third Year</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Advisor</h4>
                    <p className="text-sm">Dr. Sarah Martinez</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
