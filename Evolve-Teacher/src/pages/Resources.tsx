
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/Dashboard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  FileText,
  FileImage,
  FileCode,
  Film,
  Download,
  Trash2,
  Upload,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

// Resource type
type Resource = {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "doc" | "ppt" | "video" | "image" | "other";
  uploadDate: Date;
  subject: string;
  url: string;
};

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");

  // Mock resources data
  const [resources, setResources] = useState<Resource[]>([
    {
      id: "1",
      title: "Database Normalization Guide",
      description: "A comprehensive guide to database normalization techniques",
      type: "pdf",
      uploadDate: new Date("2023-09-15"),
      subject: "Databases",
      url: "#",
    },
    {
      id: "2",
      title: "Intro to Machine Learning",
      description: "Introduction to machine learning concepts and algorithms",
      type: "ppt",
      uploadDate: new Date("2023-10-02"),
      subject: "AI",
      url: "#",
    },
    {
      id: "3",
      title: "Frontend Development Best Practices",
      description: "Guide to modern frontend development practices",
      type: "doc",
      uploadDate: new Date("2023-08-21"),
      subject: "Web Development",
      url: "#",
    },
    {
      id: "4",
      title: "Data Structures Tutorial",
      description: "Video tutorial explaining common data structures",
      type: "video",
      uploadDate: new Date("2023-09-30"),
      subject: "Data Structures",
      url: "#",
    },
  ]);

  // File type to icon mapping
  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "doc":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "ppt":
        return <FileText className="h-5 w-5 text-orange-500" />;
      case "video":
        return <Film className="h-5 w-5 text-purple-500" />;
      case "image":
        return <FileImage className="h-5 w-5 text-green-500" />;
      default:
        return <FileCode className="h-5 w-5 text-gray-500" />;
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle resource submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !selectedFile) {
      toast.error("Please provide a title and select a file");
      return;
    }

    // Determine file type
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    let fileType: Resource["type"] = "other";
    
    if (['pdf'].includes(fileExtension)) fileType = "pdf";
    else if (['doc', 'docx'].includes(fileExtension)) fileType = "doc";
    else if (['ppt', 'pptx'].includes(fileExtension)) fileType = "ppt";
    else if (['mp4', 'mov', 'avi'].includes(fileExtension)) fileType = "video";
    else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) fileType = "image";

    // Create a new resource
    const newResource: Resource = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      description,
      type: fileType,
      uploadDate: new Date(),
      subject: subject || "General",
      url: URL.createObjectURL(selectedFile), // This is temporary, in real app would be a server URL
    };

    // Add the new resource
    setResources([newResource, ...resources]);
    
    // Reset form
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    setSubject("");
    
    toast.success("Resource uploaded successfully");
  };

  // Handle resource deletion
  const handleDelete = (id: string) => {
    setResources(resources.filter(resource => resource.id !== id));
    toast.success("Resource deleted successfully");
  };

  // Filter resources based on search and filter
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !filter || resource.type === filter || resource.subject === filter;
    
    return matchesSearch && matchesFilter;
  });

  const uniqueSubjects = [...new Set(resources.map(r => r.subject))];
  const fileTypes = [...new Set(resources.map(r => r.type))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground">
            Upload, manage, and share educational resources.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Resource</CardTitle>
              <CardDescription>
                Share educational materials with your students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Resource title"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Mathematics, Computer Science"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the resource"
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="file-upload">File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      className="flex-1"
                      required
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected file: {selectedFile.name}
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                onClick={handleSubmit}
              >
                <Upload className="mr-2 h-4 w-4" /> Upload Resource
              </Button>
            </CardFooter>
          </Card>

          {/* Search & Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Search Resources</CardTitle>
              <CardDescription>
                Find resources by title, description, subject, or file type.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search resources..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filter === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(null)}
                  >
                    All
                  </Button>
                  
                  {/* Subject filters */}
                  {uniqueSubjects.map(subject => (
                    <Button
                      key={subject}
                      variant={filter === subject ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(subject)}
                    >
                      {subject}
                    </Button>
                  ))}
                  
                  {/* File type filters */}
                  {fileTypes.map(type => (
                    <Button
                      key={type}
                      variant={filter === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(type)}
                      className="flex items-center gap-1"
                    >
                      {getFileIcon(type)}
                      {type.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resource Library */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Library</CardTitle>
            <CardDescription>
              Browse and manage your uploaded resources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No resources found. Try a different search or upload a new resource.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>{getFileIcon(resource.type)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{resource.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {resource.description}
                        </div>
                      </TableCell>
                      <TableCell>{resource.subject}</TableCell>
                      <TableCell>{resource.uploadDate.toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <a href={resource.url} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{resource.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(resource.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Resources;
