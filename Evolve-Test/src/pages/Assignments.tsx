
import React from "react";
import { DashboardLayout } from "@/components/layout/Dashboard";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";
import { CreateAssignmentModal } from "@/components/assignments/CreateAssignmentModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";

const Assignments = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">
              Assignments
            </h1>
            <p className="text-muted-foreground">
              Create, manage, and grade your course assignments
            </p>
          </div>
          <CreateAssignmentModal />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search assignments..." className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="cs101">CS 101: Intro to Programming</SelectItem>
                <SelectItem value="cs201">CS 201: Data Structures</SelectItem>
                <SelectItem value="cs301">CS 301: Algorithms</SelectItem>
                <SelectItem value="cs401">CS 401: Database Design</SelectItem>
                <SelectItem value="cs501">CS 501: Web Development</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Sort
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Due Date (Newest)</DropdownMenuItem>
                <DropdownMenuItem>Due Date (Oldest)</DropdownMenuItem>
                <DropdownMenuItem>Title (A-Z)</DropdownMenuItem>
                <DropdownMenuItem>Submission Rate (High-Low)</DropdownMenuItem>
                <DropdownMenuItem>Submission Rate (Low-High)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active (4)</TabsTrigger>
            <TabsTrigger value="draft">Draft (2)</TabsTrigger>
            <TabsTrigger value="past">Past (10)</TabsTrigger>
            <TabsTrigger value="overdue">Needs Attention (1)</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AssignmentCard
                title="Database Design Project"
                description="Design a normalized database schema for an e-commerce platform and implement it using MySQL."
                dueDate="Sep 14, 2023"
                course="CS 401"
                submissionsCount={18}
                totalStudents={24}
                status="active"
                feedbackGenerated={true}
                questions={3}
              />
              <AssignmentCard
                title="Programming Quiz 2"
                description="Multiple choice quiz covering loops, functions, and object-oriented programming concepts."
                dueDate="Sep 15, 2023"
                course="CS 101"
                submissionsCount={12}
                totalStudents={32}
                status="active"
              />
              <AssignmentCard
                title="Algorithm Analysis"
                description="Analyze the time and space complexity of different sorting algorithms and provide implementation examples."
                dueDate="Sep 16, 2023"
                course="CS 301"
                submissionsCount={8}
                totalStudents={28}
                status="active"
                questions={2}
              />
              <AssignmentCard
                title="Web Development Assignment"
                description="Create a responsive website using HTML, CSS, and JavaScript that implements a shopping cart feature."
                dueDate="Sep 18, 2023"
                course="CS 501"
                submissionsCount={5}
                totalStudents={20}
                status="active"
              />
            </div>
          </TabsContent>
          <TabsContent value="draft" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AssignmentCard
                title="Cloud Computing Project"
                description="Deploy a multi-tier application on AWS using EC2, S3, and RDS. Document the architecture and implementation details."
                dueDate="Not set"
                course="CS 601"
                submissionsCount={0}
                totalStudents={18}
                status="draft"
              />
              <AssignmentCard
                title="Mobile App Development"
                description="Create a simple mobile application using React Native that implements at least three screens and navigation."
                dueDate="Not set"
                course="CS 501"
                submissionsCount={0}
                totalStudents={20}
                status="draft"
              />
            </div>
          </TabsContent>
          <TabsContent value="past" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AssignmentCard
                title="Intro to Programming Assignment"
                description="Create simple programs using variables, conditionals, and loops to solve basic problems."
                dueDate="Sep 5, 2023"
                course="CS 101"
                submissionsCount={30}
                totalStudents={32}
                status="past"
                feedbackGenerated={true}
              />
              <AssignmentCard
                title="Data Structures Quiz"
                description="Quiz covering arrays, linked lists, stacks, queues, and binary trees."
                dueDate="Sep 8, 2023"
                course="CS 201"
                submissionsCount={22}
                totalStudents={28}
                status="past"
                feedbackGenerated={true}
              />
              {/* Additional past assignments would be listed here */}
            </div>
          </TabsContent>
          <TabsContent value="overdue" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AssignmentCard
                title="Operating Systems Lab"
                description="Implement process scheduling algorithms and analyze their performance under different workloads."
                dueDate="Sep 10, 2023 (Overdue)"
                course="CS 302"
                submissionsCount={18}
                totalStudents={22}
                status="overdue"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
