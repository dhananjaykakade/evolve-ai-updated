
import React, { useState } from 'react';
import { CalendarClock, ChevronRight, Paperclip, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface DeadlineItemProps {
  title: string;
  dueDate: string;
  subject: string;
  daysLeft: number;
  id: number;
}

const DeadlineItem: React.FC<DeadlineItemProps> = ({ title, dueDate, subject, daysLeft, id }) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getUrgencyColor = () => {
    if (daysLeft < 0) return "bg-status-overdue/10 text-status-overdue";
    if (daysLeft <= 1) return "bg-status-overdue/10 text-status-overdue";
    if (daysLeft <= 3) return "bg-status-pending/10 text-status-pending";
    return "bg-muted text-muted-foreground";
  };

  const getDaysLeftText = () => {
    if (daysLeft < 0) return "Overdue";
    if (daysLeft === 0) return "Due today";
    if (daysLeft === 1) return "Due tomorrow";
    return `${daysLeft} days left`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      toast({
        title: "File Required",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate file upload
    setTimeout(() => {
      setIsSubmitting(false);
      setSelectedFile(null);
      
      toast({
        title: "Assignment Submitted",
        description: `Successfully submitted "${title}"`,
      });
    }, 1500);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-4 py-3 group transition-all cursor-pointer">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{title}</h3>
              <span className={`px-2 py-0.5 rounded text-xs ${getUrgencyColor()}`}>
                {getDaysLeftText()}
              </span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span>{subject}</span>
              <span className="inline-block mx-2">•</span>
              <span>{dueDate}</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="px-2 py-0.5">{subject}</Badge>
            <span className={`px-2 py-0.5 rounded text-xs ${getUrgencyColor()}`}>
              {getDaysLeftText()}
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Due Date:</p>
            <p className="text-sm text-muted-foreground">{dueDate}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Description:</p>
            <p className="text-sm text-muted-foreground">
              Complete the {title} according to the requirements provided in the attached documents.
              Make sure to follow all formatting guidelines and citation styles as specified.
            </p>
          </div>
          
          {daysLeft >= 0 && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload Assignment</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input 
                      id="file-upload" 
                      type="file" 
                      className="opacity-0 absolute inset-0 w-full cursor-pointer"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.zip"
                    />
                    <div className="border rounded-md px-3 py-2 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip size={16} className="text-muted-foreground" />
                        <span className="truncate">
                          {selectedFile ? selectedFile.name : 'Choose file...'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Max 10MB'}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Accepted formats: PDF, Word, ZIP (max 10MB)
                </p>
              </div>
              
              <div className="flex justify-between pt-2">
                <Button variant="outline">
                  Download Instructions
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      Submit Assignment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const UpcomingDeadlines: React.FC = () => {
  const navigate = useNavigate();
  
  // Sample data - would come from API in real application
  const deadlines = [
    { id: 1, title: "Research Paper on Quantum Computing", dueDate: "Oct 15, 2023", subject: "Computer Science", daysLeft: 1 },
    { id: 2, title: "Mathematics Problem Set 3", dueDate: "Oct 18, 2023", subject: "Mathematics", daysLeft: 4 },
    { id: 3, title: "Literature Review Essay", dueDate: "Oct 20, 2023", subject: "English Literature", daysLeft: 6 },
    { id: 4, title: "Physics Lab Report", dueDate: "Oct 12, 2023", subject: "Physics", daysLeft: -2 },
    { id: 5, title: "Data Structures Assignment", dueDate: "Oct 14, 2023", subject: "Computer Science", daysLeft: 0 },
  ];

  const handleViewAll = () => {
    navigate('/deadlines');
  };

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <CalendarClock size={18} className="text-primary" />
          Upcoming Deadlines
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-xs" onClick={handleViewAll}>
          View all
        </Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {deadlines.map((deadline) => (
            <DeadlineItem
              key={deadline.id}
              id={deadline.id}
              title={deadline.title}
              dueDate={deadline.dueDate}
              subject={deadline.subject}
              daysLeft={deadline.daysLeft}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingDeadlines;
