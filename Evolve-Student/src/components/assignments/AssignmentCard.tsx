import React, { useState, useRef } from 'react';
import { 
  Calendar, 
  Download, 
  Upload, 
  Eye, 
  FileText,
  Clock,
  Star, Check, X, AlertCircle 
} from 'lucide-react';
import axios from 'axios';
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
import { useAuth } from '@/contexts/AuthContext';

interface Feedback {
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  generalComments?: string;
}

interface Marks {
  obtained?: number;
  total?: number;
}

interface StudentSubmission {
  _id: string;
  assignmentId: string;
  studentId: string;
  submissionType: string;
  content: string;
  fileUrl: string;
  status: string;
  isEdited: boolean;
  gradeStatus: string;
  feedback: Feedback;
  marks: Marks;
  createdAt: string;
  updatedAt: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  teacherId: string;
  course: string;
  materials: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  studentSubmission?: StudentSubmission | null;
}

interface AssignmentCardProps {
  assignment: Assignment;
  onSubmissionSuccess?: () => void;
}


const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onSubmissionSuccess  }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {user } = useAuth()
  // Extract relevant data
  const { 
    title,
    description,
    course,
    dueDate,
    status,
    materials,
    studentSubmission,
    createdAt
  } = assignment;

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = () => {
    if (studentSubmission) {
      return <Badge variant="default">Submitted</Badge>;
    }
    
    const now = new Date();
    const due = new Date(dueDate);
    
    if (now > due) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    
    return <Badge variant="secondary">Pending</Badge>;
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files || files.length === 0) {
      return;
    }
  
    const file = files[0];
    
    // File validation
    const validTypes = ['application/pdf', 
                       'application/msword',
                       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF or Word documents only",
        variant: "destructive"
      });
      return;
    }
  
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive"
      });
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assignmentId', assignment._id);
      formData.append('studentId', user.id);
  
      const response = await axios.post(
        'http://localhost:9001/student/submissions/submit',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      if (response.data.success) {
        toast({
          title: "Submission successful",
          description: "Your assignment has been submitted",
        });
        onSubmissionSuccess?.();
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6 pb-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{title}</h3>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-muted-foreground">{course}</p>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              Due: {formatDate(dueDate)}
            </div>
          </div>

          <p className="text-sm">{description}</p>

          {studentSubmission?.marks && (
            <div className="text-sm">
              <span className="text-muted-foreground">Grade: </span>
              <span className="font-medium">
                {studentSubmission.marks.obtained} / {studentSubmission.marks.total}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-0 pb-4">
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" asChild>
            <a href={materials} download className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Materials
            </a>
          </Button>

          {studentSubmission?.feedback && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Feedback
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assignment Feedback</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2">
  {!studentSubmission?.gradeStatus ? (
    <span className="text-muted-foreground">No feedback available</span>
  ) : (
    <>
      {studentSubmission.gradeStatus === "EXCELLENT" && (
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      )}
      {studentSubmission.gradeStatus === "PASS" && (
        <Check className="h-4 w-4 text-green-500" />
      )}
      {studentSubmission.gradeStatus === "NEEDS_IMPROVEMENT" && (
        <AlertCircle className="h-4 w-4 text-orange-500" />
      )}
      {studentSubmission.gradeStatus === "FAIL" && (
        <X className="h-4 w-4 text-red-500" />
      )}
      <span className="font-medium">
        {studentSubmission.gradeStatus.replace("_", " ")}
      </span>
    </>
  )}
</div>
                  {studentSubmission.feedback.strengths?.length > 0 && (
                    <div>
                      <h4 className="font-medium">Strengths</h4>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {studentSubmission.feedback.strengths.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {studentSubmission.feedback.weaknesses?.length > 0 && (
                    <div>
                      <h4 className="font-medium">Areas for Improvement</h4>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {studentSubmission.feedback.weaknesses.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {studentSubmission.feedback.generalComments && (
                    <div>
                      <h4 className="font-medium">Comments</h4>
                      <p>{studentSubmission.feedback.generalComments}</p>
                    </div>
                  )}

                  {studentSubmission.marks.obtained && (
                    <div className="flex items-center gap-2 mt-4">
                      <h4 className="font-medium">Final Grade</h4>
                      <span className="font-medium">
                        {studentSubmission.marks.obtained} / {studentSubmission.marks.total}
                      </span>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="w-full border-t pt-3">
          {studentSubmission ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                Submitted: {formatDate(studentSubmission.createdAt)}
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={studentSubmission.fileUrl} download className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Submission
                </a>
              </Button>
            </div>
          ) : (
            <>
                 {new Date(dueDate) >= new Date() ? ( // Only show if due date hasn't passed
        <>
          <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
          />
          <Button 
            onClick={handleFileUpload}
            disabled={isSubmitting}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isSubmitting ? "Uploading..." : "Submit Assignment"}
          </Button>
        </>
      ) : (
        <div className="text-sm text-muted-foreground">
          Submission period has ended
        </div>
      )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AssignmentCard;