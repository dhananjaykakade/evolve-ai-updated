import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { DashboardLayout } from "@/components/layout/Dashboard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AddMCQModal } from "@/components/questions/AddMCQModal";
import { AddCodingModal } from "@/components/questions/AddCodingModal";
import { MCQCard } from "@/components/questions/MCQCard";
import { CodingCard } from "@/components/questions/CodingCard";
import { EditMCQModal } from "@/components/questions/EditMCQModal";
import { EditCodingModal } from "@/components/questions/EditCodingModal";
import { Skeleton } from "@/components/ui/skeleton";

interface Test {
  _id: string;
  title: string;
  type: string;
  questions: any[];
}

const TestDetail: React.FC = () => {
  const { testId } = useParams();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingMCQ, setEditingMCQ] = useState<any | null>(null);
  const [editingCoding, setEditingCoding] = useState<any | null>(null);

  const fetchTestDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:9001/teacher/tests/${testId}`);
      const data = res.data.data;
      setTest(data);
    } catch (error) {
      toast.error("Failed to load test details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testId) fetchTestDetails();
  }, [testId]);

  const handleDeleteMCQ = async (questionId: string) => {
    try {
      await axios.delete(`http://localhost:9001/teacher/questions/${questionId}`);
      toast.success("MCQ deleted successfully");
      fetchTestDetails();
    } catch {
      toast.error("Failed to delete MCQ");
    }
  };

  const handleDeleteCoding = async (questionId: string) => {
    try {
      await axios.delete(`http://localhost:9001/teacher/coding/question/${questionId}`);
      toast.success("Coding question deleted successfully");
      fetchTestDetails();
    } catch {
      toast.error("Failed to delete coding question");
    }
  };

  const handleUpdateMCQ = async (updatedQuestion: any) => {
    try {
      await axios.put(`http://localhost:9001/teacher/questions/${updatedQuestion._id}`, updatedQuestion);
      toast.success("MCQ updated successfully");
      fetchTestDetails();
      setEditingMCQ(null);
    } catch {
      toast.error("Failed to update MCQ");
    }
  };

  const handleUpdateCoding = async (updatedQuestion: any) => {
    try {
      await axios.put(`http://localhost:9001/teacher/coding/question/${updatedQuestion._id}`, updatedQuestion);
      toast.success("Coding question updated successfully");
      fetchTestDetails();
      setEditingCoding(null);
    } catch {
      toast.error("Failed to update coding question");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!test) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <p>Test not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{test.title}</h1>
            <p className="text-muted-foreground capitalize">{test.type} Test</p>
          </div>
          <div className="flex gap-2">
            {test.type === "MCQ" && (
              <AddMCQModal 
                testId={testId!} 
                onSuccess={fetchTestDetails} 
                trigger={<Button>Add MCQ</Button>}
              />
            )}
            {test.type === "CODING" && (
              <AddCodingModal 
                testId={testId!} 
                onSuccess={fetchTestDetails} 
                trigger={<Button>Add Coding Question</Button>}
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">
              {test.type === "MCQ" ? "Multiple Choice Questions" : "Coding Questions"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {test.questions?.length || 0} questions
            </p>
          </div>
          
          {test.questions?.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No questions added yet</p>
              <div className="mt-4">
                {test.type === "MCQ" ? (
                  <AddMCQModal 
                    testId={testId!} 
                    onSuccess={fetchTestDetails} 
                    trigger={<Button variant="outline">Add First MCQ Question</Button>}
                  />
                ) : (
                  <AddCodingModal 
                    testId={testId!} 
                    onSuccess={fetchTestDetails} 
                    trigger={<Button variant="outline">Add First Coding Question</Button>}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {test.questions.map((q: any) => (
                test.type === "MCQ" ? (
                  <MCQCard 
                    key={q._id} 
                    question={q} 
                    onDelete={() => handleDeleteMCQ(q._id)}
                    onEdit={() => setEditingMCQ(q)}
                  />
                ) : (
                  <CodingCard 
                    key={q._id} 
                    question={q} 
                    onDelete={() => handleDeleteCoding(q._id)}
                    onEdit={() => setEditingCoding(q)}
                  />
                )
              ))}
            </div>
          )}
        </div>

        {/* Edit Modals */}
        {editingMCQ && (
          <EditMCQModal
            question={editingMCQ}
            onClose={() => setEditingMCQ(null)}
            onSuccess={handleUpdateMCQ}
          />
        )}

        {editingCoding && (
          <EditCodingModal
            question={editingCoding}
            onClose={() => setEditingCoding(null)}
            onSuccess={handleUpdateCoding}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default TestDetail;