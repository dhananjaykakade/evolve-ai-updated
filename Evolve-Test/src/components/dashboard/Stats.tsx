
import React from "react";
import { Users, BookOpen, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  color: "default" | "blue" | "green" | "amber" | "purple";
}

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "default",
}: StatCardProps) => {
  const colorStyles = {
    default: "bg-white text-primary",
    blue: "bg-blue-50 text-blue-500",
    green: "bg-green-50 text-green-500",
    amber: "bg-amber-50 text-amber-500",
    purple: "bg-purple-50 text-purple-500",
  };

  return (
    <div className="dashboard-card overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">{value}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          
          {trend && (
            <div className="mt-2 flex items-center">
              <div
                className={cn(
                  "mr-1 flex items-center text-xs font-medium",
                  trend.value >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {trend.value >= 0 ? "+" : ""}
                {trend.value}%
              </div>
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            colorStyles[color]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export const DashboardStats = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Students"
        value={128}
        description="Across all courses"
        icon={Users}
        trend={{ value: 12, label: "vs last semester" }}
        color="blue"
      />
      <StatCard
        title="Active Assignments"
        value={24}
        description="Due this week: 8"
        icon={BookOpen}
        color="purple"
      />
      <StatCard
        title="Graded Submissions"
        value="86%"
        description="14 pending review"
        icon={CheckCircle}
        trend={{ value: 4, label: "vs last week" }}
        color="green"
      />
      <StatCard
        title="Average Time to Grade"
        value="1.2d"
        description="With AI assistance"
        icon={Clock}
        trend={{ value: -32, label: "vs manual grading" }}
        color="amber"
      />
    </div>
  );
};
