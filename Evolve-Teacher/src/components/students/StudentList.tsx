import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, UserCheck, MoreHorizontal } from "lucide-react";
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

interface Student {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  adminId: string;
  createdAt: string;
}

export const StudentList = ({ students }: { students: Student[] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);

  // Search Handler
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
          <Button size="sm">
            <UserCheck className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Student Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admin ID</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className="group">
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-muted-foreground">{student.email}</TableCell>
                  <TableCell>
                    <BadgeUI
                      variant="outline"
                      className={`${
                        student.isActive ? "bg-success/15 text-success" : "bg-overdue/15 text-overdue"
                      }`}
                    >
                      {student.isActive ? "Active" : "Inactive"}
                    </BadgeUI>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{student.adminId}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(student.createdAt).toLocaleDateString()}
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
                <TableCell colSpan={6} className="h-24 text-center">
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
