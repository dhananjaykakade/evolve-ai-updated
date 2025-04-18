
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Teacher } from "@/lib/types";
import { getTeachers, addTeacher, updateTeacher, deleteTeacher, sendCredentials } from "@/lib/api";
import TeacherForm from "@/components/forms/TeacherForm";
import { toast } from "sonner";

const TeachersPage = () => {
  const { state } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteTeacherId, setDeleteTeacherId] = useState<string | null>(null);

  const loadTeachers = async () => {
    if (!state.user?.id) return;
    
    try {
      setIsLoading(true);
      const teachersData = await getTeachers(state.user.id);
      setTeachers(teachersData);
      setFilteredTeachers(teachersData);
    } catch (error) {
      console.error("Error loading teachers:", error);
      toast.error("Failed to load teachers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, [state.user?.id]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTeachers(teachers);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = teachers.filter(
        teacher => 
          teacher.name.toLowerCase().includes(lowerCaseQuery) ||
          teacher.email.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredTeachers(filtered);
    }
  }, [searchQuery, teachers]);

  const handleAddTeacher = async (formData: { name: string; email: string; password: string }) => {
    if (!state.user?.id) return;
    
    setIsSubmitting(true);
    try {
      const newTeacher = await addTeacher({
        ...formData,
        adminId: state.user.id,
        isActive: true,
      });
      
      setTeachers(prev => [...prev, newTeacher]);
      setShowAddDialog(false);
      toast.success("Teacher added successfully");
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast.error("Failed to add teacher");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (teacherId: string, isActive: boolean) => {
    try {
      await updateTeacher(teacherId, { isActive });
      setTeachers(prev => 
        prev.map(teacher => 
          teacher.id === teacherId ? { ...teacher, isActive } : teacher
        )
      );
      toast.success(`Teacher ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Error updating teacher status:", error);
      toast.error("Failed to update teacher status");
    }
  };

  const handleDeleteTeacher = async () => {
    if (!deleteTeacherId) return;
    
    try {
      await deleteTeacher(deleteTeacherId);
      setTeachers(prev => prev.filter(teacher => teacher.id !== deleteTeacherId));
      toast.success("Teacher deleted successfully");
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast.error("Failed to delete teacher");
    } finally {
      setDeleteTeacherId(null);
    }
  };

  const handleSendCredentials = async (email: string) => {
    try {
      await sendCredentials(email);
      toast.success(`Credentials sent to ${email}`);
    } catch (error) {
      console.error("Error sending credentials:", error);
      toast.error("Failed to send credentials");
    }
  };

  // Format date for display
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Teachers</h1>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>Add Teacher</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
              </DialogHeader>
              <TeacherForm 
                onSubmit={handleAddTeacher}
                isLoading={isSubmitting}
                submitLabel="Add Teacher"
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Teachers</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search teachers..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse">Loading teachers...</div>
              </div>
            ) : filteredTeachers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{formatDate(teacher.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={teacher.isActive}
                            onCheckedChange={(checked) => 
                              handleToggleActive(teacher.id, checked)
                            }
                          />
                          <span className={teacher.isActive ? "text-green-600" : "text-gray-500"}>
                            {teacher.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleSendCredentials(teacher.email)}
                            >
                              Send Credentials
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteTeacherId(teacher.id)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No teachers found</p>
                {searchQuery && (
                  <p className="text-sm text-gray-400 mt-1">
                    Try adjusting your search query
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTeacherId} onOpenChange={(open) => !open && setDeleteTeacherId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this teacher account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeacher} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default TeachersPage;
