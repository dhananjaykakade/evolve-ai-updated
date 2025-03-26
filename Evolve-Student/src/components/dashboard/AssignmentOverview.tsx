
import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  trend?: { value: number; label: string };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend, 
  className = "" 
}) => {
  return (
    <Card className={`glass-card overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className="mt-2 flex items-center text-xs text-muted-foreground">
            <span className={trend.value > 0 ? "text-green-500" : "text-red-500"}>
              {trend.value > 0 ? "+" : ""}{trend.value}%
            </span>
            <span className="ml-1">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AssignmentOverview: React.FC = () => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Pending Assignments"
        value={5}
        icon={<Clock size={15} />}
        description="Assignments waiting for submission"
        trend={{ value: -10, label: "from last week" }}
      />
      <StatCard
        title="Completed Assignments"
        value={12}
        icon={<CheckCircle2 size={15} />}
        description="Successfully submitted assignments"
        trend={{ value: 15, label: "from last week" }}
      />
      <StatCard
        title="Overdue Assignments"
        value={2}
        icon={<AlertCircle size={15} />}
        description="Past due date, requires attention"
        trend={{ value: -5, label: "from last week" }}
      />
      <StatCard
        title="Total Assignments"
        value={19}
        icon={<BookOpen size={15} />}
        description="All assigned tasks this semester"
      />
    </div>
  );
};

export default AssignmentOverview;
