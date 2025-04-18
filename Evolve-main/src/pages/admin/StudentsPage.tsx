
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
import { Student } from "@/lib/types";
import { getStudents, addStudent, updateStudent, deleteStudent, sendCredentials } from "@/lib/api";
import StudentForm from "@/components/forms/StudentForm";
import { toast } from "sonner";

const StudentsPage = () => {
  const { state } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null);

  const loadStudents = async () => {
    if (!state.user?.id) return;
    
    try {
      setIsLoading(true);
      const studentsData = await getStudents(state.user.id);
      setStudents(studentsData);
      setFilteredStudents(studentsData);
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [state.user?.id]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = students.filter(
        student => 
          student.name.toLowerCase().includes(lowerCaseQuery) ||
          student.email.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const handleAddStudent = async (formData: { name: string; email: string; password: string }) => {
    if (!state.user?.id) return;
    
    setIsSubmitting(true);
    try {
      const newStudent = await addStudent({
        ...formData,
        adminId: state.user.id,
        isActive: true,
      });
      
      setStudents(prev => [...prev, newStudent]);
      setShowAddDialog(false);
      toast.success("Student added successfully");
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (studentId: string, isActive: boolean) => {
    try {
      await updateStudent(studentId, { isActive });
      setStudents(prev => 
        prev.map(student => 
          student.id === studentId ? { ...student, isActive } : student
        )
      );
      toast.success(`Student ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Error updating student status:", error);
      toast.error("Failed to update student status");
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteStudentId) return;
    
    try {
      await deleteStudent(deleteStudentId);
      setStudents(prev => prev.filter(student => student.id !== deleteStudentId));
      toast.success("Student deleted successfully");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    } finally {
      setDeleteStudentId(null);
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>Add Student</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <StudentForm 
                onSubmit={handleAddStudent}
                isLoading={isSubmitting}
                submitLabel="Add Student"
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Students</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search students..."
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
                <div className="animate-pulse">Loading students...</div>
              </div>
            ) : filteredStudents.length > 0 ? (
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
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{formatDate(student.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={student.isActive}
                            onCheckedChange={(checked) => 
                              handleToggleActive(student.id, checked)
                            }
                          />
                          <span className={student.isActive ? "text-green-600" : "text-gray-500"}>
                            {student.isActive ? "Active" : "Inactive"}
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
                              onClick={() => handleSendCredentials(student.email)}
                            >
                              Send Credentials
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteStudentId(student.id)}
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
                <p className="text-gray-500">No students found</p>
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
      <AlertDialog open={!!deleteStudentId} onOpenChange={(open) => !open && setDeleteStudentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this student account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStudent} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default StudentsPage;
