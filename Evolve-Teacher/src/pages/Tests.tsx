import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/Dashboard";
import { CreateTestModal } from "@/components/tests/CreateTestModal";
import { TestCard } from "@/components/tests/TestCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Test {
  _id: string;
  title: string;
  course: string;
  type: string;
  scheduledAt: string;
  expiresAt: string;
  isPublished: boolean;
  totalMarks: number;
  createdBy: string;
}

const Tests = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:9001/teacher/tests`);
      if (response.data.success) {
        const sorted = response.data.data.sort(
          (a: Test, b: Test) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
        );
        setTests(sorted);
      } else {
        toast.error(response.data.message || "Failed to fetch tests");
      }
    } catch (error) {
      toast.error("Error fetching tests");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      const response = await axios.delete(`http://localhost:9001/teacher/tests/${id}`);
      if (response.data.success) {
        toast.success("Test deleted successfully");
        fetchTests();
      }
    } catch (error) {
      toast.error("Failed to delete test");
    }
  };

  const filteredTests = tests.filter((test) => {
    if (filter !== "ALL" && test.type !== filter) return false;
    if (searchTerm &&
      !test.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !test.course.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-semibold">Tests</h1>
            <p className="text-muted-foreground">Manage and schedule your MCQ and Coding tests</p>
          </div>
          <CreateTestModal onSuccess={fetchTests} />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tests..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select onValueChange={setFilter} defaultValue={filter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="MCQ">MCQ</SelectItem>
              <SelectItem value="CODING">Coding</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading tests...</div>
        ) : filteredTests.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTests.map((test) => (
              <TestCard
                key={test._id}
                id={test._id}
                title={test.title}
                course={test.course}
                type={test.type}
                scheduledAt={test.scheduledAt}
                expiresAt={test.expiresAt}
                totalMarks={test.totalMarks}
                onDelete={() => handleDelete(test._id)}
                onView={() => navigate(`/tests/${test._id}`)} 
                // onRefresh={fetchTests}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            No tests found
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Tests;
