// components/tests/CreateTestModal.tsx
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export const CreateTestModal: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
    const { user } = useAuth(); // Assuming you have a way to get the current user's ID
    
  const [formData, setFormData] = useState({
    title: "",
    type: "MCQ",
    course: "",
    scheduledAt: "",
    expiresAt: "",
    totalMarks: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateTest = async () => {
    try {
      await axios.post("http://localhost:9001/teacher/tests", {
        ...formData,
        totalMarks: parseInt(formData.totalMarks),
        createdBy: `${user.id}`, // replace with actual ID or get from context
        isPublished: true
      });
      toast.success("Test created successfully!");
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Create test error:", error);
      toast.error("Failed to create test.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Test</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Test</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input name="title" onChange={handleChange} />
          </div>
          <div>
            <Label>Course</Label>
            <Input name="course" onChange={handleChange} />
          </div>
          <div>
            <Label>Type</Label>
            <select name="type" onChange={handleChange} className="w-full p-2 border rounded">
              <option value="MCQ">MCQ</option>
              <option value="CODING">CODING</option>
            </select>
          </div>
          <div>
            <Label>Scheduled At</Label>
            <Input type="datetime-local" name="scheduledAt" onChange={handleChange} />
          </div>
          <div>
            <Label>Expires At</Label>
            <Input type="datetime-local" name="expiresAt" onChange={handleChange} />
          </div>
          <div>
            <Label>Total Marks</Label>
            <Input name="totalMarks" type="number" onChange={handleChange} />
          </div>
          <Button className="w-full mt-4" onClick={handleCreateTest}>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
