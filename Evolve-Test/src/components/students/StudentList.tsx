
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, UserCheck, Badge, ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  email: string;
  performance: "Excellent" | "Good" | "Average" | "Needs Improvement";
  submissions: number;
  attendance: number;
  lastActive: string;
}

const students: Student[] = [
  {
    id: "STU001",
    name: "Emma Johnson",
    email: "emma.j@university.edu",
    performance: "Excellent",
    submissions: 24,
    attendance: 95,
    lastActive: "Today",
  },
  {
    id: "STU002",
    name: "Michael Chen",
    email: "michael.c@university.edu",
    performance: "Good",
    submissions: 22,
    attendance: 90,
    lastActive: "Today",
  },
  {
    id: "STU003",
    name: "Sophia Williams",
    email: "sophia.w@university.edu",
    performance: "Average",
    submissions: 18,
    attendance: 85,
    lastActive: "Yesterday",
  },
  {
    id: "STU004",
    name: "James Miller",
    email: "james.m@university.edu",
    performance: "Needs Improvement",
    submissions: 14,
    attendance: 70,
    lastActive: "3 days ago",
  },
  {
    id: "STU005",
    name: "Olivia Davis",
    email: "olivia.d@university.edu",
    performance: "Good",
    submissions: 20,
    attendance: 88,
    lastActive: "Today",
  },
  {
    id: "STU006",
    name: "Noah Wilson",
    email: "noah.w@university.edu",
    performance: "Excellent",
    submissions: 23,
    attendance: 92,
    lastActive: "Yesterday",
  },
  {
    id: "STU007",
    name: "Ava Martinez",
    email: "ava.m@university.edu",
    performance: "Average",
    submissions: 19,
    attendance: 83,
    lastActive: "2 days ago",
  },
];

export const StudentList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.id.toLowerCase().includes(term)
    );
    
    setFilteredStudents(filtered);
  };

  const getPerformanceBadgeColor = (performance: Student["performance"]) => {
    switch (performance) {
      case "Excellent":
        return "bg-success/15 text-success hover:bg-success/20";
      case "Good":
        return "bg-info/15 text-info hover:bg-info/20";
      case "Average":
        return "bg-warning/15 text-warning hover:bg-warning/20";
      case "Needs Improvement":
        return "bg-overdue/15 text-overdue hover:bg-overdue/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Badge className="mr-2 h-4 w-4" />
            Group
          </Button>
          <Button size="sm">
            <UserCheck className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <div className="flex items-center gap-1">
                  Name
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/70" />
                </div>
              </TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead className="text-right">Submissions</TableHead>
              <TableHead className="text-right">Attendance</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className="group">
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.id}
                  </TableCell>
                  <TableCell>
                    <BadgeUI
                      variant="outline"
                      className={cn(
                        "font-normal",
                        getPerformanceBadgeColor(student.performance)
                      )}
                    >
                      {student.performance}
                    </BadgeUI>
                  </TableCell>
                  <TableCell className="text-right">
                    {student.submissions}/24
                  </TableCell>
                  <TableCell className="text-right">{student.attendance}%</TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.lastActive}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>View Submissions</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Export Data</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
