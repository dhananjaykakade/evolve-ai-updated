
import React from "react";
import { DashboardLayout } from "@/components/layout/Dashboard";
import { AIFeedbackGenerator } from "@/components/ai/AIFeedbackGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Sparkles, BookOpen, FileText, RocketIcon, MessageSquareText, Zap, Settings } from "lucide-react";

const AITools = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">
              AI Teaching Assistant
            </h1>
            <p className="text-muted-foreground">
              Leverage AI to enhance your teaching and reduce workload
            </p>
          </div>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Configure AI Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              title: "Feedback Generator",
              description: "Generate personalized feedback for students",
              icon: MessageSquareText,
              color: "bg-blue-50 text-blue-500",
              active: true,
            },
            {
              title: "Assignment Creator",
              description: "Create assignments with AI-generated questions",
              icon: FileText,
              color: "bg-purple-50 text-purple-500",
            },
            {
              title: "Content Generator",
              description: "Generate learning materials and examples",
              icon: BookOpen,
              color: "bg-green-50 text-green-500",
            },
            {
              title: "Quiz Generator",
              description: "Create quizzes with varying difficulty levels",
              icon: Sparkles,
              color: "bg-amber-50 text-amber-500",
            },
            {
              title: "Performance Analyzer",
              description: "Get insights on student performance",
              icon: RocketIcon,
              color: "bg-red-50 text-red-500",
            },
            {
              title: "Plagiarism Checker",
              description: "Detect similarities between submissions",
              icon: Zap,
              color: "bg-indigo-50 text-indigo-500",
            },
          ].map((tool, index) => (
            <Card
              key={index}
              className={`hover:border-primary/50 transition-colors ${
                tool.active ? "border-primary/50 bg-accent/30" : ""
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {tool.title}
                </CardTitle>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${tool.color}`}
                >
                  <tool.icon className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {tool.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant={tool.active ? "default" : "outline"} className="w-full">
                  {tool.active ? "Active Tool" : "Select Tool"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card className="border-primary/50 bg-accent/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <CardTitle>AI Feedback Generator</CardTitle>
            </div>
            <CardDescription>
              Generate personalized feedback for student submissions with AI assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="feedback">
              <TabsList>
                <TabsTrigger value="feedback">Generate Feedback</TabsTrigger>
                <TabsTrigger value="history">Feedback History</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>
              <TabsContent value="feedback" className="mt-4">
                <AIFeedbackGenerator />
              </TabsContent>
              <TabsContent value="history" className="mt-4">
                <div className="rounded-lg border p-8 text-center">
                  <p className="text-muted-foreground">
                    Your generated feedback history will appear here
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="templates" className="mt-4">
                <div className="rounded-lg border p-8 text-center">
                  <p className="text-muted-foreground">
                    Your feedback templates will appear here
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AITools;
