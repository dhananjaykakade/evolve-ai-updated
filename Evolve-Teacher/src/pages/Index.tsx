
import React from "react";
import { DashboardLayout } from "@/components/layout/Dashboard";
import { DashboardStats } from "@/components/dashboard/Stats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PerformanceChart } from "@/components/students/PerformanceChart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrainCircuit, BookOpen, Users, ArrowRight } from "lucide-react";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">
              Welcome Back, Professor
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your courses today
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              Weekly Report
            </Button>
            <Button>
              <BrainCircuit className="mr-2 h-4 w-4" />
              AI Teaching Assistant
            </Button>
          </div>
        </div>

        <DashboardStats />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your upcoming classes and events</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0.5">
                {[
                  {
                    time: "10:00 AM - 11:30 AM",
                    course: "CS 101: Intro to Programming",
                    location: "Room 302",
                  },
                  {
                    time: "01:00 PM - 02:30 PM",
                    course: "CS 401: Database Design",
                    location: "Lab 201",
                  },
                  {
                    time: "03:00 PM - 04:00 PM",
                    course: "Office Hours",
                    location: "Room 410",
                  },
                ].map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 border-b p-4 last:border-0"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {index === 2 ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        <BookOpen className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{event.course}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.time} • {event.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 px-6 py-3">
              <Button variant="ghost" className="w-full">
                View Full Schedule
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <PerformanceChart />
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Due Dates</CardTitle>
              <CardDescription>Assignments due this week</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[300px] space-y-4 overflow-y-auto px-2">
              {[
                {
                  title: "Database Design Project",
                  course: "CS 401",
                  due: "Tomorrow",
                  submissions: "18/24",
                },
                {
                  title: "Programming Quiz 2",
                  course: "CS 101",
                  due: "Sep 15",
                  submissions: "12/32",
                },
                {
                  title: "Algorithm Analysis",
                  course: "CS 301",
                  due: "Sep 16",
                  submissions: "8/28",
                },
                {
                  title: "Web Development Assignment",
                  course: "CS 501",
                  due: "Sep 18",
                  submissions: "5/20",
                },
              ].map((assignment, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{assignment.title}</p>
                    <span className="text-xs font-medium text-warning">
                      Due {assignment.due}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {assignment.course}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {assignment.submissions}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t bg-muted/20 px-6 py-3">
              <Button variant="ghost" className="w-full">
                View All Assignments
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-medium">Active Assignments</h2>
            <Button variant="outline">View All</Button>
          </div>
          <Tabs defaultValue="active">
            <TabsList className="mb-4">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-0">
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
              </div>
            </TabsContent>
            <TabsContent value="draft" className="mt-0">
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
              </div>
            </TabsContent>
            <TabsContent value="past" className="mt-0">
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
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
