
import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const SettingsPage = () => {
  const { state } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReports = () => {
    setIsGenerating(true);
    
    // Simulate generating reports
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Reports generated successfully");
    }, 2000);
  };

  return (
    <AdminLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        
        <div className="grid gap-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View and manage your account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Administrator Name</h3>
                  <p className="text-base">{state.user?.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                  <p className="text-base">{state.user?.email}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Institution Name</h3>
                  <p className="text-base">{state.user?.instituteName}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Verification Status</h3>
                  <p className="text-base flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${state.user?.isVerified ? "bg-green-500" : "bg-yellow-500"}`}></span>
                    {state.user?.isVerified ? "Verified" : "Pending Verification"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                Configure your EvolveAI instance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Reporting</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Generate reports for your institution's performance and user activity
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleGenerateReports}
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate Reports"}
                  </Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Data Management</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Manage how your data is stored and processed in the platform
                  </p>
                  <div className="flex space-x-4">
                    <Button variant="outline">Export Data</Button>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      Delete All Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Platform Information */}
          <Card>
            <CardHeader>
              <CardTitle>About Platform</CardTitle>
              <CardDescription>
                Information about EvolveAI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Version</h3>
                  <p className="text-base">1.0.0 (Beta)</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="text-base">May 15, 2023</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Support</h3>
                  <p className="text-base">
                    <a href="mailto:support@evolveai.edu" className="text-evolve-600 hover:underline">
                      support@evolveai.edu
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
