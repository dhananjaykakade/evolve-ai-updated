
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityStatus = "Completed" | "Pending" | "Overdue" | "In Progress";

interface Activity {
  id: string;
  description: string;
  student: string;
  assignment: string;
  time: string;
  status: ActivityStatus;
}

const activities: Activity[] = [
  {
    id: "act-1",
    description: "Submission received",
    student: "Emma Johnson",
    assignment: "Data Structures Project",
    time: "10 minutes ago",
    status: "Pending",
  },
  {
    id: "act-2",
    description: "AI feedback generated",
    student: "Michael Chen",
    assignment: "Algorithm Analysis Quiz",
    time: "25 minutes ago",
    status: "Completed",
  },
  {
    id: "act-3",
    description: "Revision requested",
    student: "Sophia Williams",
    assignment: "Web Development Assignment",
    time: "1 hour ago",
    status: "In Progress",
  },
  {
    id: "act-4",
    description: "Grading needed",
    student: "James Miller",
    assignment: "Database Design Project",
    time: "2 hours ago",
    status: "Overdue",
  },
  {
    id: "act-5",
    description: "Question asked in chat",
    student: "Anonymous Student",
    assignment: "Cloud Computing Homework",
    time: "3 hours ago",
    status: "Pending",
  },
];

const getStatusIcon = (status: ActivityStatus) => {
  switch (status) {
    case "Completed":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "Pending":
      return <Clock className="h-4 w-4 text-warning" />;
    case "Overdue":
      return <AlertCircle className="h-4 w-4 text-overdue" />;
    case "In Progress":
      return <RefreshCw className="h-4 w-4 text-info" />;
    default:
      return null;
  }
};

export const RecentActivity = () => {
  const [visibleActivities, setVisibleActivities] = useState<Activity[]>(activities.slice(0, 5));

  return (
    <div className="dashboard-card">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium">Recent Activity</h3>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="hidden md:table-cell">Assignment</TableHead>
              <TableHead className="hidden sm:table-cell">Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleActivities.map((activity) => (
              <TableRow key={activity.id} className="group">
                <TableCell className="font-medium">{activity.description}</TableCell>
                <TableCell>{activity.student}</TableCell>
                <TableCell className="hidden md:table-cell">{activity.assignment}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {activity.time}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(activity.status)}
                    <span
                      className={cn(
                        "text-sm",
                        activity.status === "Completed" && "text-success",
                        activity.status === "Pending" && "text-warning",
                        activity.status === "Overdue" && "text-overdue",
                        activity.status === "In Progress" && "text-info"
                      )}
                    >
                      {activity.status}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="invisible group-hover:visible"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
