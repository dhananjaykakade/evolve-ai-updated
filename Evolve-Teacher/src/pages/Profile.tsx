
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/Dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Mail,
  Pencil,
  Users,
  BookOpen,
  Clock,
  Calendar,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [name, setName] = useState("Prof. Michelle Johnson");
  const [newName, setNewName] = useState(name);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Mock data for assigned courses
  const assignedCourses = [
    { id: "CS101", name: "Introduction to Computer Science", students: 32, start: "2023-09-01", end: "2023-12-15" },
    { id: "CS201", name: "Data Structures and Algorithms", students: 28, start: "2023-09-01", end: "2023-12-15" },
    { id: "CS350", name: "Database Systems", students: 25, start: "2023-09-01", end: "2023-12-15" },
    { id: "CS450", name: "Operating Systems", students: 22, start: "2023-09-01", end: "2023-12-15" },
  ];

  // Calculate total students
  const totalStudents = assignedCourses.reduce((total, course) => total + course.students, 0);

  // Handle profile image change
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewProfileImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleProfileUpdate = () => {
    setName(newName);
    if (newProfileImage && profileImagePreview) {
      setProfileImage(profileImagePreview);
    }
    setEditDialogOpen(false);
    toast.success("Profile updated successfully");
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            View and manage your personal profile settings.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          {/* Profile Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your personal details and profile picture.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={profileImage || ""} alt={name} />
                <AvatarFallback className="text-2xl">{getInitials(name)}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-medium">{name}</h3>
              <p className="text-sm text-muted-foreground">Computer Science Department</p>
              <p className="flex items-center mt-2 text-sm text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                michelle.johnson@university.edu
              </p>

              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-4">
                    <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your profile information and profile picture.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="profile-image">Profile Picture</Label>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage 
                            src={profileImagePreview || profileImage || ""} 
                            alt={newName} 
                          />
                          <AvatarFallback>{getInitials(newName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-muted-foreground">Email (Read-only)</Label>
                      <Input
                        id="email"
                        value="michelle.johnson@university.edu"
                        disabled
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleProfileUpdate}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Teaching Information */}
          <Card>
            <CardHeader>
              <CardTitle>Teaching Information</CardTitle>
              <CardDescription>
                Overview of your courses and teaching statistics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center p-4 rounded-md bg-muted/50">
                  <BookOpen className="h-8 w-8 mr-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Courses</p>
                    <p className="text-2xl font-bold">{assignedCourses.length}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 rounded-md bg-muted/50">
                  <Users className="h-8 w-8 mr-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Students</p>
                    <p className="text-2xl font-bold">{totalStudents}</p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-medium mb-4">Assigned Courses</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course ID</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.id}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.students}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(course.start).toLocaleDateString()} - {new Date(course.end).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Activity Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Statistics</CardTitle>
            <CardDescription>
              Overview of your teaching activities and student interactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col p-4 rounded-md bg-muted/50">
                <div className="flex items-center mb-2">
                  <div className="p-2 rounded-full bg-primary/10 mr-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Assignments</span>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold">24</p>
                  <p className="text-sm text-muted-foreground">Created this semester</p>
                </div>
              </div>
              
              <div className="flex flex-col p-4 rounded-md bg-muted/50">
                <div className="flex items-center mb-2">
                  <div className="p-2 rounded-full bg-primary/10 mr-3">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Hours</span>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold">148</p>
                  <p className="text-sm text-muted-foreground">Teaching hours logged</p>
                </div>
              </div>
              
              <div className="flex flex-col p-4 rounded-md bg-muted/50">
                <div className="flex items-center mb-2">
                  <div className="p-2 rounded-full bg-primary/10 mr-3">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Resources</span>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold">42</p>
                  <p className="text-sm text-muted-foreground">Learning materials shared</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
