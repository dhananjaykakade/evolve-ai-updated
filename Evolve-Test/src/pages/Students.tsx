
import React from "react";
import { DashboardLayout } from "@/components/layout/Dashboard";
import { StudentList } from "@/components/students/StudentList";
import { PerformanceChart } from "@/components/students/PerformanceChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

const Students = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">
              Students
            </h1>
            <p className="text-muted-foreground">
              Manage students and track their performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              Export Data
            </Button>
            <Button>
              View Insights
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>
                View and manage all students across your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4 w-full justify-start">
                  <TabsTrigger value="all">All Students</TabsTrigger>
                  <TabsTrigger value="cs101">CS 101</TabsTrigger>
                  <TabsTrigger value="cs201">CS 201</TabsTrigger>
                  <TabsTrigger value="cs301">CS 301</TabsTrigger>
                  <TabsTrigger value="cs401">CS 401</TabsTrigger>
                  <TabsTrigger value="cs501">CS 501</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <StudentList />
                </TabsContent>
                <TabsContent value="cs101">
                  <StudentList />
                </TabsContent>
                <TabsContent value="cs201">
                  <StudentList />
                </TabsContent>
                <TabsContent value="cs301">
                  <StudentList />
                </TabsContent>
                <TabsContent value="cs401">
                  <StudentList />
                </TabsContent>
                <TabsContent value="cs501">
                  <StudentList />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <PerformanceChart />

          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>
                Students with highest overall scores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Emma Johnson", score: 96, course: "CS 301" },
                { name: "Noah Wilson", score: 94, course: "CS 101" },
                { name: "Michael Chen", score: 92, course: "CS 201" },
                { name: "Olivia Davis", score: 90, course: "CS 401" },
                { name: "Ava Martinez", score: 89, course: "CS 501" },
              ].map((student, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.course}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-full bg-success/15 px-2.5 py-0.5 text-sm font-medium text-success">
                    {student.score}%
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>Student participation and activity</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 divide-y">
                {[
                  {
                    title: "Assignment Completion",
                    value: "86%",
                    trend: "+4.2%",
                    description: "Average across all courses",
                  },
                  {
                    title: "Discussion Participation",
                    value: "72%",
                    trend: "+2.8%",
                    description: "Students engaging in forums",
                  },
                  {
                    title: "Office Hours Attendance",
                    value: "43%",
                    trend: "-1.5%",
                    description: "Students attending sessions",
                  },
                  {
                    title: "Resource Access",
                    value: "94%",
                    trend: "+7.3%",
                    description: "Students accessing materials",
                  },
                ].map((metric, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{metric.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{metric.value}</span>
                        <span
                          className={`flex items-center text-xs font-medium ${
                            metric.trend.startsWith("+")
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {metric.trend}
                          <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {metric.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Needs Improvement</CardTitle>
              <CardDescription>
                Students who may need additional support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: "James Miller",
                  issue: "Low Assignment Completion",
                  course: "CS 401",
                  score: "70%",
                },
                {
                  name: "Sophia Williams",
                  issue: "Missing Recent Quizzes",
                  course: "CS 101",
                  score: "75%",
                },
                {
                  name: "Ethan Brown",
                  issue: "Poor Test Performance",
                  course: "CS 301",
                  score: "68%",
                },
                {
                  name: "Isabella Garcia",
                  issue: "Low Participation",
                  course: "CS 201",
                  score: "72%",
                },
              ].map((student, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-destructive">{student.issue}</p>
                    <p className="text-xs text-muted-foreground">
                      {student.course}
                    </p>
                  </div>
                  <div className="rounded-full bg-overdue/15 px-2.5 py-0.5 text-sm font-medium text-overdue">
                    {student.score}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>
                Notable student accomplishments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: "Emma Johnson",
                  achievement: "Perfect Score on Algorithm Analysis",
                  date: "Sep 10, 2023",
                },
                {
                  name: "Noah Wilson",
                  achievement: "Completed Extra Credit Assignment",
                  date: "Sep 9, 2023",
                },
                {
                  name: "Ava Martinez",
                  achievement: "Most Improved Student This Week",
                  date: "Sep 8, 2023",
                },
                {
                  name: "Michael Chen",
                  achievement: "100% Attendance Record",
                  date: "Sep 7, 2023",
                },
              ].map((achievement, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <p className="font-medium">{achievement.name}</p>
                  <p className="text-sm text-primary">
                    {achievement.achievement}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {achievement.date}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Students;
