import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/Dashboard";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";
import { CreateAssignmentModal } from "@/components/assignments/CreateAssignmentModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext.js";
import axios from "axios";
import { FeedbackDialog } from "@/components/assignments/feedbackPage.js";

interface Submission {
  _id: string;
  studentId: string;
  fileUrl: string;
  status: string;
  gradeStatus: string;
  createdAt: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  teacherId: string;
  course: string;
  materials: string;
  status: string;
  useAI: boolean;
  submissionType: string;
  submissions: Submission[];
  createdAt: string;
}

const Assignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PUBLISHED");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:9001/teacher/assignments/${user.id}/submissions`
      );
      
      if (response.data.success) {
        // Sort by creation date (newest first)
        const sortedAssignments = response.data.data.assignments.sort(
          (a: Assignment, b: Assignment) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAssignments(sortedAssignments);
      } else {
        throw new Error(response.data.message || 'Failed to fetch assignments');
      }
    } catch (error) {
      toast.error("Error fetching assignments");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      const response = await axios.delete(
        `http://localhost:9001/teacher/assignments/${id}`
      );

      if (response.data.success) {
        toast.success("Assignment deleted successfully!");
        fetchAssignments(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to delete assignment');
      }
    } catch (error) {
      toast.error("Error deleting assignment");
      console.error("Delete error:", error);
    }
  };

  const handlePublishToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const response = await axios.patch(
        `http://localhost:9001/teacher/assignments/${id}/status`,
        { status: newStatus }
      );

      if (response.data.success) {
        toast.success(`Assignment ${newStatus.toLowerCase()}`);
        fetchAssignments();
      } else {
        throw new Error(response.data.message || 'Status update failed');
      }
    } catch (error) {
      toast.error("Error updating assignment status");
      console.error("Status update error:", error);
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    // Filter by status
    if (filter !== "ALL" && assignment.status !== filter) return false;
    
    // Filter by search term
    if (searchTerm && 
        !assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !assignment.course.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Assignments</h1>
            <p className="text-muted-foreground">Create, manage, and grade your course assignments</p>
          </div>
          <CreateAssignmentModal onSuccess={fetchAssignments} />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search assignments..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select onValueChange={setFilter} defaultValue={filter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs for Assignment Categories */}
        <Tabs defaultValue={filter}>
          <TabsList>
            <TabsTrigger value="PUBLISHED" onClick={() => setFilter("PUBLISHED")}>
              Published
            </TabsTrigger>
            <TabsTrigger value="DRAFT" onClick={() => setFilter("DRAFT")}>
              Draft
            </TabsTrigger>
            <TabsTrigger value="CLOSED" onClick={() => setFilter("CLOSED")}>
              Closed
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={filter} className="mt-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <p>Loading assignments...</p>
              </div>
            ) : filteredAssignments.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAssignments.map((assignment) => (
                <>
                <AssignmentCard
  id={assignment._id}
  title={assignment.title}
  description={assignment.description}
  dueDate={assignment.dueDate}
  course={assignment.course}
  submissionsCount={assignment.submissions.length}
  totalStudents={30} // Your actual student count
  status={assignment.status.toLowerCase()}
  submissions={assignment.submissions.map(sub => ({
    ...sub,
    studentName: `Student ${sub.studentId.slice(0, 5)}`, // Map to actual student names
    content: sub.fileUrl, // Assuming fileUrl represents the content
    submittedAt: sub.createdAt // Assuming createdAt represents the submission time
  }))}
  onDelete={() => handleDelete(assignment._id)}
  // onEdit={() => handleEdit(assignment._id)}
  // onPublishToggle={() => handlePublishToggle(assignment._id)}
  onFeedbackSubmit={async (submissionId, feedback) => {
    await axios.post(`/assignments/${assignment._id}/feedback`, {
      submissionId,
      feedback
    });
    // Optionally refresh data
  }}
/>

            </>
                ))}
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? "No assignments match your search"
                    : `No ${filter.toLowerCase()} assignments found`}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    
    </DashboardLayout>
  );
};

export default Assignments;