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

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:9000/teacher/assignments");
      if (!response.ok) throw new Error("Failed to fetch assignments");

      const data = await response.json();
      setAssignments(data.data || []);
    } catch (error) {
      toast.error("Error fetching assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      const response = await fetch(`http://localhost:9000/teacher/assignments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete assignment");

      toast.success("Assignment deleted successfully!");
      fetchAssignments(); // Refresh the assignment list
    } catch (error) {
      toast.error("Error deleting assignment");
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === "ALL") return true;
    return assignment.status === filter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Assignments</h1>
            <p className="text-muted-foreground">Create, manage, and grade your course assignments</p>
          </div>
          <CreateAssignmentModal/>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search assignments..." className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Select onValueChange={setFilter} defaultValue="ALL">
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
        <Tabs defaultValue="ALL">
          <TabsList>
            <TabsTrigger value="ALL" onClick={() => setFilter("ALL")}>All</TabsTrigger>
            <TabsTrigger value="PUBLISHED" onClick={() => setFilter("PUBLISHED")}>Published</TabsTrigger>
            <TabsTrigger value="DRAFT" onClick={() => setFilter("DRAFT")}>Draft</TabsTrigger>
            <TabsTrigger value="CLOSED" onClick={() => setFilter("CLOSED")}>Closed</TabsTrigger>
          </TabsList>
          <TabsContent value={filter} className="mt-6">
            {loading ? (
              <p>Loading assignments...</p>
            ) : filteredAssignments.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment._id}
                    title={assignment.title}
                    description={assignment.description}
                    dueDate={new Date(assignment.dueDate).toLocaleDateString()}
                    course={assignment.course}
                    submissionsCount={assignment.submissions?.length || 0}
                    totalStudents={30}
                    status={assignment.status.toLowerCase()}
                    onDelete={() => handleDelete(assignment._id)} // ✅ Delete function
                  />
                ))}
              </div>
            ) : (
              <p>No assignments found.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
