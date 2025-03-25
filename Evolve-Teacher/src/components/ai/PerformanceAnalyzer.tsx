
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart,
  Line
} from "recharts";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const PerformanceAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [student, setStudent] = useState("");
  const [course, setCourse] = useState("");
  const [analysisData, setAnalysisData] = useState<any>(null);

  const handleAnalyze = () => {
    if (!student || !course) {
      toast.error("Please select both student and course");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analyzing performance
    setTimeout(() => {
      const progressData = [
        { name: 'Assignment 1', student: 78, classAvg: 75 },
        { name: 'Assignment 2', student: 65, classAvg: 72 },
        { name: 'Quiz 1', student: 82, classAvg: 76 },
        { name: 'Midterm', student: 76, classAvg: 70 },
        { name: 'Assignment 3', student: 88, classAvg: 79 },
        { name: 'Quiz 2', student: 79, classAvg: 74 },
        { name: 'Final Project', student: 91, classAvg: 83 },
      ];
      
      const skillsData = [
        { name: 'Problem Solving', student: 82, classAvg: 75, gap: 7 },
        { name: 'Critical Thinking', student: 75, classAvg: 72, gap: 3 },
        { name: 'Communication', student: 68, classAvg: 77, gap: -9 },
        { name: 'Technical Skills', student: 90, classAvg: 80, gap: 10 },
        { name: 'Time Management', student: 65, classAvg: 70, gap: -5 },
      ];
      
      const actionPlan = [
        {
          area: "Communication Skills",
          observation: "Student scores below class average in written explanations and documentation.",
          recommendation: "Assign additional tasks focused on technical writing and documentation. Consider pair programming to practice verbal communication of technical concepts."
        },
        {
          area: "Time Management",
          observation: "Student tends to submit assignments close to deadlines with evidence of rushing.",
          recommendation: "Suggest breaking down projects into smaller milestones. Provide project management tools and techniques for better time allocation."
        },
        {
          area: "Technical Excellence",
          observation: "Student shows exceptional ability in coding and algorithm design.",
          recommendation: "Provide more challenging advanced problems. Consider recommending student as a peer mentor for struggling classmates."
        }
      ];
      
      setAnalysisData({
        student: "Jane Smith",
        studentId: "JS2023",
        course: "CS101: Programming Fundamentals",
        overallGrade: "B+",
        progressData,
        skillsData,
        actionPlan
      });
      
      setIsAnalyzing(false);
      toast.success("Performance analysis completed");
    }, 2500);
  };

  const handleExport = () => {
    toast.success("Analysis exported as PDF");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="student">Select Student</Label>
          <Select value={student} onValueChange={setStudent}>
            <SelectTrigger id="student">
              <SelectValue placeholder="Choose student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="john">John Doe</SelectItem>
              <SelectItem value="jane">Jane Smith</SelectItem>
              <SelectItem value="alex">Alex Johnson</SelectItem>
              <SelectItem value="maya">Maya Williams</SelectItem>
              <SelectItem value="tyler">Tyler Brown</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="course">Select Course</Label>
          <Select value={course} onValueChange={setCourse}>
            <SelectTrigger id="course">
              <SelectValue placeholder="Choose course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cs101">CS101: Programming Fundamentals</SelectItem>
              <SelectItem value="cs201">CS201: Data Structures</SelectItem>
              <SelectItem value="cs301">CS301: Algorithms</SelectItem>
              <SelectItem value="cs401">CS401: Database Systems</SelectItem>
              <SelectItem value="cs501">CS501: Web Development</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || !student || !course}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Analyze Performance
              </>
            )}
          </Button>
        </div>
      </div>
      
      {!analysisData ? (
        <div className="text-center p-12 border rounded-md border-dashed">
          <p className="text-muted-foreground">
            Select a student and course to view performance analysis
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">{analysisData.student} (ID: {analysisData.studentId})</h3>
              <p className="text-muted-foreground">{analysisData.course} - Overall Grade: {analysisData.overallGrade}</p>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Analysis
            </Button>
          </div>
          
          <Tabs defaultValue="progress">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="progress">Progress Over Time</TabsTrigger>
              <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
              <TabsTrigger value="action">AI Action Plan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="progress" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment & Test Scores</CardTitle>
                  <CardDescription>
                    Student performance compared to class average
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analysisData.progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="student"
                          stroke="#8884d8"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                          name="Student Score"
                        />
                        <Line
                          type="monotone"
                          dataKey="classAvg"
                          stroke="#82ca9d"
                          strokeWidth={2}
                          name="Class Average"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold text-blue-600">82%</CardTitle>
                    <CardDescription>Average Score</CardDescription>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold text-green-600">+5%</CardTitle>
                    <CardDescription>Above Class Average</CardDescription>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold text-amber-600">+13%</CardTitle>
                    <CardDescription>Growth Since Start</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="skills" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Skills Gap Analysis</CardTitle>
                  <CardDescription>
                    Comparison of student skills vs. class average
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysisData.skillsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="student" fill="#8884d8" name="Student" />
                        <Bar dataKey="classAvg" fill="#82ca9d" name="Class Average" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Strengths & Areas for Improvement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <span className="font-medium mr-2">Technical Skills:</span>
                            <span>+10% above average</span>
                          </li>
                          <li className="flex items-center">
                            <span className="font-medium mr-2">Problem Solving:</span>
                            <span>+7% above average</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Areas for Improvement</h4>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <span className="font-medium mr-2">Communication:</span>
                            <span>-9% below average</span>
                          </li>
                          <li className="flex items-center">
                            <span className="font-medium mr-2">Time Management:</span>
                            <span>-5% below average</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="action" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Suggested Action Plan</CardTitle>
                  <CardDescription>
                    Personalized recommendations based on performance analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData.actionPlan.map((action: any, index: number) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium">{action.area}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                          <div>
                            <p className="text-sm font-medium">Observation:</p>
                            <p className="text-sm text-muted-foreground">{action.observation}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Recommendation:</p>
                            <p className="text-sm text-muted-foreground">{action.recommendation}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};
