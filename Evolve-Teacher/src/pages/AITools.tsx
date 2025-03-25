
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/Dashboard";
import { AIFeedbackGenerator } from "@/components/ai/AIFeedbackGenerator";
import { AssignmentCreator } from "@/components/ai/AssignmentCreator";
import { ContentGenerator } from "@/components/ai/ContentGenerator";
import { QuizGenerator } from "@/components/ai/QuizGenerator";
import { PerformanceAnalyzer } from "@/components/ai/PerformanceAnalyzer";
import { PlagiarismChecker } from "@/components/ai/PlagiarismChecker";
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
import { 
  BrainCircuit, 
  Sparkles, 
  BookOpen, 
  FileText, 
  RocketIcon, 
  MessageSquareText, 
  Zap, 
  Settings 
} from "lucide-react";

const AITools = () => {
  const [activeTool, setActiveTool] = useState("feedback");

  const tools = [
    {
      id: "feedback",
      title: "Feedback Generator",
      description: "Generate personalized feedback for students",
      icon: MessageSquareText,
      color: "bg-blue-50 text-blue-500",
    },
    {
      id: "assignment",
      title: "Assignment Creator",
      description: "Create assignments with AI-generated questions",
      icon: FileText,
      color: "bg-purple-50 text-purple-500",
    },
    {
      id: "content",
      title: "Content Generator",
      description: "Generate learning materials and examples",
      icon: BookOpen,
      color: "bg-green-50 text-green-500",
    },
    {
      id: "quiz",
      title: "Quiz Generator",
      description: "Create quizzes with varying difficulty levels",
      icon: Sparkles,
      color: "bg-amber-50 text-amber-500",
    },
    {
      id: "performance",
      title: "Performance Analyzer",
      description: "Get insights on student performance",
      icon: RocketIcon,
      color: "bg-red-50 text-red-500",
    },
    {
      id: "plagiarism",
      title: "Plagiarism Checker",
      description: "Detect similarities between submissions",
      icon: Zap,
      color: "bg-indigo-50 text-indigo-500",
    },
  ];

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
          {tools.map((tool) => (
            <Card
              key={tool.id}
              className={`hover:border-primary/50 transition-colors cursor-pointer ${
                activeTool === tool.id ? "border-primary/50 bg-accent/30" : ""
              }`}
              onClick={() => setActiveTool(tool.id)}
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
                <Button variant={activeTool === tool.id ? "default" : "outline"} className="w-full">
                  {activeTool === tool.id ? "Active Tool" : "Select Tool"}
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
              <CardTitle>
                {tools.find(t => t.id === activeTool)?.title}
              </CardTitle>
            </div>
            <CardDescription>
              {activeTool === "feedback" && "Generate personalized feedback for student submissions with AI assistance"}
              {activeTool === "assignment" && "Create customized assignments with AI-generated questions based on subject and difficulty"}
              {activeTool === "content" && "Generate learning materials and educational content with AI assistance"}
              {activeTool === "quiz" && "Create interactive quizzes with AI-generated questions based on topics"}
              {activeTool === "performance" && "Analyze student performance with AI-driven insights and action plans"}
              {activeTool === "plagiarism" && "Check student submissions for plagiarism and receive suggestions for improvement"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeTool === "feedback" && <AIFeedbackGenerator />}
            {activeTool === "assignment" && <AssignmentCreator />}
            {activeTool === "content" && <ContentGenerator />}
            {activeTool === "quiz" && <QuizGenerator />}
            {activeTool === "performance" && <PerformanceAnalyzer />}
            {activeTool === "plagiarism" && <PlagiarismChecker />}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AITools;
