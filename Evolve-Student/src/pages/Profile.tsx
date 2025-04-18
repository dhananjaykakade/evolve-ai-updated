import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import Settings from '@/components/profile/Settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStudentWithAdmin } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
interface Student {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  adminId: string;
}

interface Admin {
  id: string;
  name: string;
  instituteName: string;
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [student, setStudent] = useState<Student | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const { user } = useAuth(); // Assuming you have a user object in your auth context

  useEffect(() => {
    // Replace with dynamic ID based on auth/session
    const studentId = user?.id 

    const fetchData = async () => {
      try {
        const { student, admin } = await getStudentWithAdmin(studentId);
        setStudent(student);
        setAdmin(admin);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchData();
  }, [user.id]);

  if (!student || !admin) {
    return (
      <Layout title="Profile">
        <div className="text-center py-10">Loading profile...</div>
      </Layout>
    );
  }

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
            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
              <div className="flex flex-col items-center gap-4">
                <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center text-4xl font-medium">
                  {student.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <h3 className="text-xl font-medium">{student.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Student ID: {student.id}
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Email</h4>
                    <p className="text-sm">{student.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Institute</h4>
                    <p className="text-sm">{admin.instituteName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Status</h4>
                    <p className="text-sm">
                      {student.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Advisor</h4>
                    <p className="text-sm">{admin.name}</p>
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
