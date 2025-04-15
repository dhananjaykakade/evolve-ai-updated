// components/tests/TestCard.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, FileText } from "lucide-react";

export const TestCard: React.FC<{
  id: string;
  title: string;
  course: string;
  type: string;
  scheduledAt: string;
  expiresAt: string;
  totalMarks: number;
  onView: () => void;
  onDelete: () => void;
}> = ({
  id,
  title,
  course,
  type,
  scheduledAt,
  expiresAt,
  totalMarks,
  onView,
  onDelete
}) => {
  return (
    <div className="p-4 border shadow-sm rounded-md space-y-2 bg-white">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground flex items-center gap-2"><BookOpen size={14} /> {course}</p>
      <p className="text-sm text-muted-foreground flex items-center gap-2"><FileText size={14} /> {type}</p>
      <p className="text-sm text-muted-foreground flex items-center gap-2"><Calendar size={14} /> {new Date(scheduledAt).toLocaleString()} - {new Date(expiresAt).toLocaleString()}</p>
      <p className="text-sm text-muted-foreground">Total Marks: {totalMarks}</p>

      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={onView}>View</Button>
        <Button variant="destructive" onClick={onDelete}>Delete</Button>
      </div>
    </div>
  );
};
