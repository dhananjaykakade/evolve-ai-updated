import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext"; // ✅ Import Auth Context

export const CreateAssignmentModal = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [useAI, setUseAI] = useState(true);
  const [maxMarks, setMaxMarks] = useState(100);
  const [file, setFile] = useState<File | null>(null);

  const { user } = useAuth(); // ✅ Get logged-in teacher details

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      toast.success("File selected successfully");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !course || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("dueDate", dueDate);
    formData.append("course", course);
    formData.append("useAI", String(useAI));
    formData.append("submissionType", "FILE");
    formData.append("maxMarks", String(maxMarks));

    if (user?.id) {
      formData.append("teacherId", user.id); // ✅ Attach Teacher ID
    } else {
      toast.error("Error: Teacher ID is missing!");
      return;
    }

    if (file) formData.append("file", file);

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8005/assignments", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to create assignment");

      toast.success("Assignment created successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Error creating assignment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title</Label>
            <Input id="title" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe the assignment" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Select value={course} onValueChange={setCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs101">CS 101</SelectItem>
                  <SelectItem value="cs201">CS 201</SelectItem>
                  <SelectItem value="cs301">CS 301</SelectItem>
                  <SelectItem value="cs401">CS 401</SelectItem>
                  <SelectItem value="cs501">CS 501</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxMarks">Max Marks</Label>
            <Input id="maxMarks" type="number" value={maxMarks} onChange={(e) => setMaxMarks(Number(e.target.value))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="materials">Materials (Optional)</Label>
            <div className="flex items-center gap-2">
              <input type="file" id="materials" className="hidden" onChange={handleFileChange} />
              <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById("materials")?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                {file ? file.name : "Upload Materials"}
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-accent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="useAI" className="font-medium">Use AI for Grading & Feedback</Label>
              </div>
              <Switch id="useAI" checked={useAI} onCheckedChange={setUseAI} />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
