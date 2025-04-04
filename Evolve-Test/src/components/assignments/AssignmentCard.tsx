
import React from "react";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AssignmentCardProps {
  title: string;
  description: string;
  dueDate: string;
  course: string;
  submissionsCount: number;
  totalStudents: number;
  status: "active" | "draft" | "past" | "overdue";
  feedbackGenerated?: boolean;
  questions?: number;
}

export const AssignmentCard = ({
  title,
  description,
  dueDate,
  course,
  submissionsCount,
  totalStudents,
  status,
  feedbackGenerated = false,
  questions = 0,
}: AssignmentCardProps) => {
  const submissionRate = (submissionsCount / totalStudents) * 100;

  const statusColors = {
    active: "bg-success/15 text-success",
    draft: "bg-info/15 text-info",
    past: "bg-muted/30 text-muted-foreground",
    overdue: "bg-overdue/15 text-overdue",
  };

  const statusLabels = {
    active: "Active",
    draft: "Draft",
    past: "Past",
    overdue: "Overdue",
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-elevation">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium",
                statusColors[status]
              )}
            >
              {statusLabels[status]}
            </span>
            <span className="text-xs text-muted-foreground">{course}</span>
          </div>
          <h3 className="mt-1 text-xl font-medium">{title}</h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Generate Questions</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>

        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{dueDate}</span>
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
          {status === "overdue" && (
            <div className="flex items-center gap-1 rounded-full bg-overdue/10 px-2 py-1 text-xs text-overdue">
              <AlertCircle className="h-3 w-3" />
              <span>Needs Attention</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t bg-muted/20 px-6 py-3">
        <Button variant="ghost" size="sm" className="h-8">
          <FileText className="mr-1 h-4 w-4" />
          View Details
        </Button>
        {status === "active" && (
          <Button size="sm" className="h-8">
            Review Submissions
          </Button>
        )}
        {status === "draft" && (
          <Button size="sm" className="h-8">
            Publish
          </Button>
        )}
        {status === "past" && (
          <Button size="sm" variant="outline" className="h-8">
            View Analytics
          </Button>
        )}
        {status === "overdue" && (
          <Button size="sm" className="h-8">
            Grade Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
