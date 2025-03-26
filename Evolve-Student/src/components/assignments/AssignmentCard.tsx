
import React, { useState, useRef } from 'react';
import { 
  Calendar, 
  Download, 
  Upload, 
  Eye, 
  FileText 
} from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export interface Assignment {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  marks?: {
    obtained: number;
    total: number;
  };
  fileUrl?: string;
  submissionUrl?: string;
  feedback?: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    generalComments: string;
  };
}

interface AssignmentCardProps {
  assignment: Assignment;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  const { title, subject, dueDate, status, marks, fileUrl, submissionUrl, feedback } = assignment;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500 hover:bg-red-600">Overdue</Badge>;
      default:
        return null;
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    // File size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // File type validation (PDF, DOCX, etc)
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF or Word documents only",
        variant: "destructive"
      });
      return;
    }
    
    // Submit file
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Assignment submitted",
        description: "Your assignment has been successfully submitted",
      });
      
      // In a real app, you would update the assignment status through an API call
      // and then update the UI based on the response
    }, 1500);
  };

  return (
    <Card className="glass-card transition-all duration-200 hover:shadow-md overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{title}</h3>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-muted-foreground">{subject}</p>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar size={14} className="mr-1" />
              {dueDate}
            </div>
          </div>

          {marks && (
            <div className="text-sm">
              <span className="text-muted-foreground">Marks: </span>
              <span className={marks.obtained / marks.total >= 0.7 ? "text-green-500" : "text-amber-500"}>
                {marks.obtained} / {marks.total}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-4 pt-0 pb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={fileUrl} download>
              <Download size={14} className="mr-1" />
              Assignment
            </a>
          </Button>
          
          {status === 'completed' && feedback && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye size={14} className="mr-1" />
                  Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Assignment Feedback</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  {feedback.strengths.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Strengths</h4>
                      <ul className="pl-5 space-y-1">
                        {feedback.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm list-disc">
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {feedback.weaknesses.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Areas for Improvement</h4>
                      <ul className="pl-5 space-y-1">
                        {feedback.weaknesses.map((weakness, idx) => (
                          <li key={idx} className="text-sm list-disc">
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {feedback.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Suggestions</h4>
                      <ul className="pl-5 space-y-1">
                        {feedback.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-sm list-disc">
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {feedback.generalComments && (
                    <div>
                      <h4 className="font-medium mb-2">General Comments</h4>
                      <p className="text-sm text-muted-foreground">
                        {feedback.generalComments}
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {status !== 'completed' ? (
          <>
            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
            />
            <Button size="sm" onClick={handleFileUpload} disabled={isSubmitting}>
              <Upload size={14} className="mr-1" />
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <a href={submissionUrl} download>
              <FileText size={14} className="mr-1" />
              Your submission
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AssignmentCard;
