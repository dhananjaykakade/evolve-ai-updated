import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MoreHorizontal,
  Calendar,
  Users,
  FileText,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { FeedbackDialog } from "./feedbackPage"; // Import the FeedbackDialog component

interface Submission {
  _id: string;
  studentId: string;
  studentName: string;
  fileUrl: string;
  content: string;
  submittedAt: string;
  status: string;
  gradeStatus?: string; // Add missing properties
  marks?: number;       // Add missing properties
}

interface AssignmentCardProps {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  course: string;
  submissionsCount: number;
  totalStudents: number;
  status: string;
  materialsUrl?: string;
  feedbackGenerated?: boolean;
  questions?: number;
  submissions?: Submission[]; // Add submissions data
  onDelete?: () => void;
  onEdit?: () => void;
  onPublishToggle?: () => void;
  onFeedbackSubmit?: (submissionId: string, feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    generalComments: string;
    marks: number;
  }) => Promise<void>;
}

export const AssignmentCard = ({
  id,
  title,
  description,
  dueDate,
  course,
  submissionsCount,
  totalStudents,
  status,
  feedbackGenerated = false,
  questions = 0,
  submissions = [],
  onDelete,
  onEdit,
  onPublishToggle,
  onFeedbackSubmit,
}: AssignmentCardProps) => {
  const submissionRate = totalStudents > 0 ? (submissionsCount / totalStudents) * 100 : 0;
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const statusColors = {
    published: "bg-success/15 text-success",
    draft: "bg-info/15 text-info",
    closed: "bg-muted/30 text-muted-foreground",
  };

  const statusLabels = {
    published: "PUBLISHED",
    draft: "DRAFT",
    closed: "CLOSED",
  };

  const handlePublishClick = () => {
    if (onPublishToggle) {
      onPublishToggle();
    }
  };

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-elevation">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium", statusColors[status])}>
                {statusLabels[status]}
              </span>
              <span className="text-xs text-muted-foreground">{course}</span>
            </div>
            <h3 className="mt-1 text-xl font-medium">{title}</h3>
          </div>

          {/* Dropdown Menu for Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Generate Questions</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent>
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{description}</p>

          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {submissionsCount}/{totalStudents} Submissions
                </span>
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span>Submission Rate</span>
                <span>{Math.round(submissionRate)}%</span>
              </div>
              <Progress value={submissionRate} className="h-1.5" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {feedbackGenerated && (
              <div className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs text-success">
                <CheckCircle2 className="h-3 w-3" />
                <span>AI Feedback Ready</span>
              </div>
            )}
            {questions > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-info/10 px-2 py-1 text-xs text-info">
                <MessageCircle className="h-3 w-3" />
                <span>{questions} Student Questions</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t bg-muted/20 px-6 py-3">
          <Button variant="ghost" size="sm" className="h-8">
            <FileText className="mr-1 h-4 w-4" />
            View Details
          </Button>
          {status === "published" && (
            <Button onClick={() => setFeedbackOpen(true)} size="sm" className="h-8">
              Review Submissions
            </Button>
          )}
          {status === "closed" && (
            <Button onClick={() => setFeedbackOpen(true)} size="sm" className="h-8">
              Review Submissions
            </Button>
          )}
          {status === "draft" && (
            <Button onClick={handlePublishClick} size="sm" className="h-8">
              Publish
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Feedback Dialog */}
      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        assignmentId={id}
        assignmentTitle={title}
        submissions={submissions}
        onFeedbackSubmit={async (submissionId, feedback) => {
          if (onFeedbackSubmit) {
            await onFeedbackSubmit(submissionId, feedback);
          }
        }}
      />
    </>
  );
};