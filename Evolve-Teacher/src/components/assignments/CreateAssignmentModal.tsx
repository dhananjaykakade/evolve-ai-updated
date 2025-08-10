import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// get the details via env file
const CLOUDINARY_UPLOAD_PRESET =  "tbyp3bnh"; // your preset name
const CLOUDINARY_CLOUD_NAME =  "delnxjp38"; // your cloud name

interface CreateAssignmentModalProps {
  onSuccess?: () => void;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    dueDate: "",
    materials: "",
    useAI: true,
    maxMarks: 100,
    submissionType: "FILE"
  });
  const [file, setFile] = useState<File | null>(null);
  const { user } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Validate file type and size
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Please upload a PDF or Word document");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size should be less than 5MB");
        return;
      }
          setIsFileUploading(true);
    toast.info("Uploading file...");
try {
      const cloudData = new FormData();
      cloudData.append("file", selectedFile);
      cloudData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
        { method: "POST", body: cloudData }
      );

      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadResult.error?.message || "Upload failed");

      setFileUrl(uploadResult.secure_url);
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "File upload failed");
    } finally {
      setIsFileUploading(false);
    }
  }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.course || !formData.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const data = {
      title: formData.title,
      description: formData.description,
      dueDate: new Date(formData.dueDate).toISOString(),
      course: formData.course,
      useAI: formData.useAI,
      submissionType: formData.submissionType,
      maxMarks: formData.maxMarks,
      status: "DRAFT",
      teacherId: user?.id || "",
      materialsUrl: fileUrl // ✅ cloudinary URL
    };

    setIsLoading(true);
    try {
      console.log("Creating assignment...");
      console.log("Form Data:", data);
      // make this link production ready from env dynamically in vitejs
      const response = await fetch(`${import.meta.env.VITE_API_URL}/teacher/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),

      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to create assignment");
      }

      toast.success("Assignment created successfully!");
      setOpen(false);
      onSuccess?.(); // Refresh the assignments list
      resetForm();
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error(error instanceof Error ? error.message : "Error creating assignment");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      course: "",
      dueDate: "",
      materials: "",
      useAI: true,
      maxMarks: 100,
      submissionType: "FILE"
    });
    setFile(null);
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
            <Label htmlFor="title">Assignment Title *</Label>
            <Input 
              id="title" 
              name="title"
              placeholder="Enter title" 
              value={formData.title} 
              onChange={handleInputChange} 
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea 
              id="description" 
              name="description"
              placeholder="Describe the assignment" 
              value={formData.description} 
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Select 
                value={formData.course} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, course: value }))}
                required
              >
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
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input 
                id="dueDate" 
                type="datetime-local" 
                name="dueDate"
                value={formData.dueDate} 
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxMarks">Max Marks</Label>
              <Input 
                id="maxMarks" 
                type="number" 
                name="maxMarks"
                min="1"
                value={formData.maxMarks} 
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionType">Submission Type</Label>
              <Select 
                value={formData.submissionType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, submissionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FILE">File Upload</SelectItem>
                  <SelectItem value="TEXT">Text Submission</SelectItem>
                  <SelectItem value="CODE">Code Submission</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

<div className="space-y-2">
  <Label htmlFor="materials">Materials (Optional)</Label>

  {/* If fileUrl exists, show uploaded message */}
  {fileUrl && <p className="text-sm text-green-600">Uploaded successfully </p>}

  <div className="flex items-center gap-2">
    <input
      type="file"
      id="materials"
      className="hidden"
      onChange={handleFileChange}
      accept=".pdf,.doc,.docx"
    />

    <Button
      type="button"
      variant="outline"
      className={`w-full ${
        fileUrl
          ? "border-green-500 text-green-600 hover:bg-green-50"
          : "border-gray-300"
      }`}
      onClick={() => document.getElementById("materials")?.click()}
      disabled={isFileUploading}
    >
      {isFileUploading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Uploading...
        </>
      ) : (
        <>
          <Upload className="mr-2 h-4 w-4" />
          {fileUrl ? "File Uploaded" : "Upload Materials"}
        </>
      )}
    </Button>
  </div>
</div>



          <div className="rounded-lg bg-accent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="useAI" className="font-medium">Use AI for Grading & Feedback</Label>
              </div>
              <Switch 
                id="useAI" 
                checked={formData.useAI} 
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useAI: checked }))} 
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => {
              setOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : "Create Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};