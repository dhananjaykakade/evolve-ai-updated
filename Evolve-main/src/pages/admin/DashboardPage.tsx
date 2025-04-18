
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, CalendarDays, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getTeachers, getStudents } from "@/lib/api";
import { Teacher, Student } from "@/lib/types";

const DashboardPage = () => {
  const { state } = useAuth();
  const [teacherCount, setTeacherCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [recentTeachers, setRecentTeachers] = useState<Teacher[]>([]);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!state.user?.id) return;
      
      try {
        const teachersData = await getTeachers(state.user.id);
        const studentsData = await getStudents(state.user.id);
        
        setTeacherCount(teachersData.length);
        setStudentCount(studentsData.length);
        
        // Get 5 most recent teachers and students
        setRecentTeachers(teachersData
          .sort((a: Teacher, b: Teacher) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5));
        
        setRecentStudents(studentsData
          .sort((a: Student, b: Student) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [state.user?.id]);

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <AdminLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Teacher Count */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Teachers
              </CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teacherCount}</div>
              <p className="text-xs text-gray-500 mt-1">
                <Link to="/admin/teachers" className="text-evolve-600 hover:underline">
                  Manage Teachers →
                </Link>
              </p>
            </CardContent>
          </Card>

          {/* Student Count */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Students
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentCount}</div>
              <p className="text-xs text-gray-500 mt-1">
                <Link to="/admin/students" className="text-evolve-600 hover:underline">
                  Manage Students →
                </Link>
              </p>
            </CardContent>
          </Card>

          {/* Institution Name */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Institution
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">
                {state.user?.instituteName || "N/A"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Registered on {state.user?.createdAt ? formatDate(state.user.createdAt) : "N/A"}
              </p>
            </CardContent>
          </Card>

          {/* Admin Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Account Status
              </CardTitle>
              <Activity className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {state.user?.isVerified ? "Verified" : "Pending Verification"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Admin: {state.user?.name || "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Teachers */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-pulse">Loading recent teachers...</div>
                </div>
              ) : recentTeachers.length > 0 ? (
                <div className="space-y-4">
                  {recentTeachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-medium">{teacher.name}</div>
                        <div className="text-sm text-gray-500">{teacher.email}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(teacher.createdAt)}
                      </div>
                    </div>
                  ))}
                  <Link to="/admin/teachers">
                    <Button variant="ghost" className="w-full mt-2">
                      View All Teachers
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No teachers added yet</p>
                  <Link to="/admin/teachers">
                    <Button variant="outline" className="mt-4">
                      Add Teachers
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Students */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-pulse">Loading recent students...</div>
                </div>
              ) : recentStudents.length > 0 ? (
                <div className="space-y-4">
                  {recentStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(student.createdAt)}
                      </div>
                    </div>
                  ))}
                  <Link to="/admin/students">
                    <Button variant="ghost" className="w-full mt-2">
                      View All Students
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No students added yet</p>
                  <Link to="/admin/students">
                    <Button variant="outline" className="mt-4">
                      Add Students
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
