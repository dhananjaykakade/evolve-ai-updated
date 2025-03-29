import React, { useEffect, useState } from "react";
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

import { toast } from "sonner";

const Students = () => {
  const [students, setStudents] = useState([
    // Sample data
    { id: 1, name: "Alice", age: 18, enrolledCourses: ["Math", "Science"] },
    { id: 2, name: "Bob", age: 19, enrolledCourses: ["Math", "English"] },
    { id: 3, name: "Charlie", age: 20, enrolledCourses: ["Science", "English"] },
    // Add more students here
  ]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("http://localhost:9001/auth/students/get"); // API corrected
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        const data = await response.json();
        
        console.log("Fetched Students:", data.data.students);
        const temp = data.data.students
        setStudents(temp);
        console.log("Set Students:", temp)
      } catch (error) {
        console.error(error);
        toast.error("Error fetching students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);



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
            <Button variant="outline">Export Data</Button>
            <Button>View Insights</Button>
          </div>
        </div>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Student Management</CardTitle>
            <CardDescription>View and manage all students</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ALL" className="w-full">
              <TabsList className="mb-4 w-full justify-start">
                <TabsTrigger value="ALL" onClick={() => setFilter("ALL")}>
                  All Students
                </TabsTrigger>
                <TabsTrigger value="cs101" onClick={() => setFilter("cs101")}>
                  CS 101
                </TabsTrigger>
                <TabsTrigger value="cs201" onClick={() => setFilter("cs201")}>
                  CS 201
                </TabsTrigger>
                <TabsTrigger value="cs301" onClick={() => setFilter("cs301")}>
                  CS 301
                </TabsTrigger>
                <TabsTrigger value="cs401" onClick={() => setFilter("cs401")}>
                  CS 401
                </TabsTrigger>
                <TabsTrigger value="cs501" onClick={() => setFilter("cs501")}>
                  CS 501
                </TabsTrigger>
              </TabsList>
              <TabsContent value={filter}>
                {loading ? (
                  <p>Loading students...</p>
                ) : (
                  <StudentList students={students} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <PerformanceChart />
      </div>
    </DashboardLayout>
  );
};

export default Students;
