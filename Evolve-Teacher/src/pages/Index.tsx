
import React, { useEffect, useState } from "react";
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
import { useAuth} from "../context/AuthContext.js";
import { toast } from "sonner";
const Index = () => {
  const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
      const [filter, setFilter] = useState("PUBLISHED");

    const {user } =useAuth()

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:9001/teacher/assignments/${user?.id}/submissions`);
      if (!response.ok) throw new Error("Failed to fetch assignments");

      const data = await response.json();
      setAssignments(data.data.assignments || []);
      console.log(data.data.assignments)
    } catch (error) {
      toast.error("Error fetching assignments");
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === "PUBLISHED") return true;
    return assignment.status === filter;
  });
  console.log(assignments)

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
           <Tabs defaultValue="PUBLISHED">
                    <TabsList>
                     
                      <TabsTrigger value="PUBLISHED" onClick={() => setFilter("PUBLISHED")}>Published</TabsTrigger>
                      <TabsTrigger value="DRAFT" onClick={() => setFilter("DRAFT")}>Draft</TabsTrigger>
                      <TabsTrigger value="CLOSED" onClick={() => setFilter("CLOSED")}>Closed</TabsTrigger>
                    </TabsList>
                    <TabsContent value={filter} className="mt-6">
                      {loading ? (
                        <p>Loading assignments...</p>
                      ) : filteredAssignments.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {filteredAssignments.map((assignment) => (
                            <AssignmentCard
                            id={assignment.id}
                              key={assignment._id}
                              title={assignment.title}
                              description={assignment.description}
                              dueDate={new Date(assignment.dueDate).toLocaleDateString()}
                              course={assignment.course}
                              submissionsCount={assignment.submissions?.length || 0}
                              totalStudents={30}
                              status={assignment.status.toLowerCase()}

                            />
                          ))}
                        </div>
                      ) : (
                        <p>No assignments found.</p>
                      )}
                    </TabsContent>
                  </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
