
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Upload, BrainCircuit, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const CreateAssignmentModal = () => {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [useAI, setUseAI] = useState(true);
  const [fileUploaded, setFileUploaded] = useState(false);

  const handleGenerateQuestions = () => {
    if (!description) {
      toast.error("Please enter a description first");
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generating questions
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("AI has generated 5 questions based on your description");
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !course || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Process form submission
    toast.success("Assignment created successfully");
    setOpen(false);
    
    // Reset form
    setTitle("");
    setDescription("");
    setCourse("");
    setDueDate("");
    setUseAI(true);
    setFileUploaded(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileUploaded(true);
      toast.success("File uploaded successfully");
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
          <DialogDescription>
            Create a new assignment for your students. Use AI to generate questions and grade submissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title</Label>
            <Input
              id="title"
              placeholder="Enter assignment title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the assignment and its objectives"
              className="min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Select value={course} onValueChange={setCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs101">CS 101: Intro to Programming</SelectItem>
                  <SelectItem value="cs201">CS 201: Data Structures</SelectItem>
                  <SelectItem value="cs301">CS 301: Algorithms</SelectItem>
                  <SelectItem value="cs401">CS 401: Database Design</SelectItem>
                  <SelectItem value="cs501">CS 501: Web Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="materials">Materials (Optional)</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  id="materials"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("materials")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {fileUploaded ? "File Uploaded" : "Upload Materials"}
                </Button>
              </div>
              {fileUploaded && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setFileUploaded(false)}
                >
                  <Plus className="h-4 w-4 rotate-45" />
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-accent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <Label htmlFor="useAI" className="font-medium">
                  Use AI for Grading & Feedback
                </Label>
              </div>
              <Switch
                id="useAI"
                checked={useAI}
                onCheckedChange={setUseAI}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              AI will automatically grade submissions and provide personalized feedback to students.
            </p>

            <Button
              type="button"
              size="sm"
              className="mt-2"
              variant="outline"
              onClick={handleGenerateQuestions}
              disabled={isGenerating || !description}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Assignment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
