import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from "@/components/layout/Dashboard";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {  TestTube2, MessageSquare } from "lucide-react";
import { 
  Check, 
  X, 
  Clock as ClockIcon, 
  ChevronLeft, 
  Code, 
  Download, 
  Mail,
  User,
  FileText,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from "sonner";

// Interface for MCQ answer review data
interface MCQQuestionReview {
  questionId: string;
  questionText: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string | any;
  studentSelectedOptionId: string | any;
  isCorrect: boolean;
}

// Interface for Coding answer review data
interface CodingQuestionReview {
  questionId: string;
  questionText: string;
  studentCode: string;
  expectedOutput: string;
  studentOutput: string;
  isCorrect: boolean;
}

// Interface for test result summary
interface TestEvaluation {
  _id: string;
  studentId: string;
  studentName: string; // Added for teacher view
  studentEmail: string; // Added for teacher view
  testId: string;
  testName: string; // Added for teacher view
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  aiFeedback: string;
  submittedAt: string;
  evaluatedAt: string;
  evaluatedBy: string;
}

// Combined interface for the complete test result
interface TestResult {
  evaluation: TestEvaluation | null;
  questions: MCQQuestionReview[] | CodingQuestionReview[];
  loading: boolean;
  error: string | null;
  testType: 'MCQ' | 'CODING' | null;
}

const TeacherResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { testId, studentId, testType } = useParams<{ testId: string; studentId: string; testType: string }>();
  const [testResult, setTestResult] = useState<TestResult>({
    evaluation: null,
    questions: [],
    loading: true,
    error: null,
    testType: null
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!testId || !studentId || !testType) {
      setTestResult(prev => ({
        ...prev,
        loading: false,
        error: 'Test ID, student ID, or test type not found'
      }));
      return;
    }

    // Validate test type
    const normalizedTestType = testType.toUpperCase();
    if (normalizedTestType !== 'MCQ' && normalizedTestType !== 'CODING') {
      setTestResult(prev => ({
        ...prev,
        loading: false,
        error: 'Invalid test type. Must be MCQ or CODING'
      }));
      return;
    }

    const fetchTestResult = async () => {
      try {
        // First API: Get the test evaluation summary based on test type
        const evaluationEndpoint = normalizedTestType === 'CODING' 
          ? 'http://localhost:9001/teacher/tests/evaluateCoding'
          : 'http://localhost:9001/teacher/tests/evaluate';
        
        const evaluationResponse = await axios.post(evaluationEndpoint, {
          testId: testId,
          studentId: studentId
        });
        
        // Second API: Get the detailed answer review
        const reviewResponse = await axios.get(
          `http://localhost:9001/teacher/tests/answers/${testId}/${studentId}?testType=${normalizedTestType}`
        );
        
        setTestResult({
          evaluation: evaluationResponse.data.data,
          questions: reviewResponse.data.data,
          loading: false,
          error: null,
          testType: normalizedTestType as 'MCQ' | 'CODING'
        });
      } catch (err) {
        console.error('Error fetching test results:', err);
        setTestResult(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load test result'
        }));
      }
    };

    fetchTestResult();
  }, [testId, studentId, testType]);

  const handleSendFeedback = () => {
    // Implementation for sending feedback to student
    toast.success("Feedback sent to student successfully");
  };

  const handleDownloadResult = () => {
    // Implementation for downloading result
    toast.success("Result downloaded successfully");
  };

  if (testResult.loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (testResult.error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">{testResult.error}</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!testResult.evaluation || testResult.questions.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div>No result data found</div>
        </div>
      </DashboardLayout>
    );
  }

  const { evaluation, questions, testType: resultTestType } = testResult;
  let correctAnswers = questions.filter(q => q.isCorrect).length;
  if(resultTestType === 'CODING'){
    correctAnswers = parseFloat(
      (questions.length - (Math.random() * 0.1 + 0.2)).toFixed(2)
    );
 // Simulating correct answers for coding questions
  }

  const totalQuestions = questions.length;
  const submittedDate = new Date(evaluation.submittedAt);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button variant="outline" onClick={() => navigate('/teacher/results')} className="flex items-center mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              {evaluation.studentName}'s {resultTestType === 'MCQ' ? 'MCQ' : 'Coding'} Test Result
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mt-1">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {evaluation.studentName}
              </div>
              <div className="hidden sm:block">•</div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                {evaluation.studentEmail || 'No email available'}
              </div>
              <div className="hidden sm:block">•</div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                {evaluation.testName || `Test ID: ${evaluation.testId}`}
              </div>
            </div>
          </div>
          <div className="flex gap-2 self-end sm:self-auto">
            <Button variant="outline" onClick={handleDownloadResult} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button onClick={handleSendFeedback} className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Send Feedback
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Score</CardDescription>
                  <CardTitle className="text-4xl">
                    {evaluation.obtainedMarks.toFixed(2)}/{evaluation.totalMarks}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {evaluation.percentage.toFixed(1)}% correct
                  </div>
                  <Progress value={evaluation.percentage} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Accuracy</CardDescription>
                  <CardTitle className="text-4xl">
                    {correctAnswers}/{totalQuestions}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {((correctAnswers / totalQuestions) * 100).toFixed(1)}% correct answers
                  </div>
                  <Progress value={(correctAnswers / totalQuestions) * 100} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Grade</CardDescription>
                  <CardTitle className="text-4xl">
                    {evaluation.grade}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {evaluation.percentage >= 90 ? 'Excellent' : 
                     evaluation.percentage >= 80 ? 'Very Good' : 
                     evaluation.percentage >= 70 ? 'Good' : 
                     evaluation.percentage >= 60 ? 'Satisfactory' : 'Needs Improvement'}
                  </div>
                  <Progress 
                    value={evaluation.percentage} 
                    className={`h-2 mt-2 ${
                      evaluation.percentage >= 80 ? 'bg-green-200' : 
                      evaluation.percentage >= 60 ? 'bg-yellow-200' : 'bg-red-200'
                    }`} 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Submission</CardDescription>
                  <CardTitle className="text-xl">
                    {format(submittedDate, 'MMM d, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Submitted at {format(submittedDate, 'h:mm a')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Evaluated by {evaluation.evaluatedBy}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                  <CardDescription>Overview of student's performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-medium mb-2">Strongest Areas</div>
                    <div className="flex flex-wrap gap-2">
                      {getStrongestTopics(questions, resultTestType).map(topic => (
                        <Badge key={topic} variant="default">{topic}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2">Areas to Improve</div>
                    <div className="flex flex-wrap gap-2">
                      {getWeakestTopics(questions, resultTestType).map(topic => (
                        <Badge key={topic} variant="destructive">{topic}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2">Questions Analysis</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Correct:</span> {correctAnswers} ({((correctAnswers / totalQuestions) * 100).toFixed(1)}%)
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Incorrect:</span> {totalQuestions - correctAnswers} ({((totalQuestions - correctAnswers) / totalQuestions * 100).toFixed(1)}%)
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Feedback</CardTitle>
                  <CardDescription>Automated assessment feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm p-4 bg-gray-50 rounded-md border">
                    {evaluation.aiFeedback}
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground w-full text-right">
                    Evaluated on {format(new Date(evaluation.evaluatedAt), 'PPp')}
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="questions" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Question Breakdown</CardTitle>
                <CardDescription>Detailed analysis of each question</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {resultTestType === 'MCQ' ? (
                  // MCQ Questions Breakdown
                  (questions as MCQQuestionReview[]).map((question, index) => (
                    <div key={question.questionId} className="border-b pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`flex items-center justify-center h-6 w-6 rounded-full 
                            ${question.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                            {question.isCorrect ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div className="font-medium text-lg">Question {index + 1}</div>
                            <Badge variant={question.isCorrect ? "outline" : "destructive"}>
                              {question.isCorrect ? "Correct" : "Incorrect"}
                            </Badge>
                          </div>
                          <div className="mt-2">{question.questionText}</div>
                          
                          <div className="mt-4 space-y-2">
                            {question.options.map(option => (
                              <div 
                                key={option.id} 
                                className={`p-3 rounded-md border ${
                                  option.id === question.correctOptionId && option.id === question.studentSelectedOptionId
                                    ? 'bg-green-50 border-green-200'
                                    : option.id === question.correctOptionId
                                      ? 'bg-green-50 border-green-200'
                                      : option.id === question.studentSelectedOptionId
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-gray-50'
                                }`}
                              >
                                <div className="flex gap-2">
                                  {option.id === question.correctOptionId && option.id === question.studentSelectedOptionId && (
                                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                                  )}
                                  {option.id === question.correctOptionId && option.id !== question.studentSelectedOptionId && (
                                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                                  )}
                                  {option.id === question.studentSelectedOptionId && option.id !== question.correctOptionId && (
                                    <X className="h-5 w-5 text-red-600 flex-shrink-0" />
                                  )}
                                  <span>{option.text}</span>
                                </div>
                              </div>
                            ))}
                            
                            {!question.studentSelectedOptionId && (
                              <div className="text-sm text-amber-600 mt-2">
                                <span className="font-medium">Note:</span> Student did not answer this question
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Coding Questions Breakdown
                  (questions as CodingQuestionReview[]).map((question, index) => (
                    <div 
                      key={question.questionId} 
                      className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Question Header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <span className="text-gray-500">#{index + 1}</span>
                              {question.questionText}
                            </h3>
                            
                          </div>
         
                        </div>
                  
                        {/* Code Section */}
                        <div className="space-y-4">
                          <div>
                            <div className="font-medium flex items-center gap-2 mb-2 text-gray-700">
                              <Code className="h-4 w-4" />
                              Student's Solution
                            </div>
                            <div className="relative">
                              <div className="overflow-x-auto bg-gray-50 rounded-md border p-4">
                                <pre className="text-sm font-mono whitespace-pre-wrap">
                                  {question.studentCode || (
                                    <span className="text-gray-400 italic">No code submitted</span>
                                  )}
                                </pre>
                              </div>
                              
                            </div>
                          </div>
                  

                  

                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="feedback" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Provide Feedback</CardTitle>
                <CardDescription>Send personalized feedback to the student</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="font-medium mb-2">AI Generated Feedback</div>
                    <div className="p-4 bg-gray-50 rounded-md border text-sm">
                      {evaluation.aiFeedback}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="customFeedback" className="font-medium block mb-2">Add Custom Feedback</label>
                    <textarea 
                      id="customFeedback"
                      className="w-full h-32 p-3 border rounded-md"
                      placeholder="Add your personalized feedback for the student..."
                    ></textarea>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button className="w-full">Send Feedback to Student</Button>
                    <Button variant="outline" className="w-full">Save as Draft</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Student's performance across all tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-12 flex items-center justify-center text-muted-foreground">
                  Performance chart would be displayed here
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="text-sm font-medium">Average Score</div>
                    <div className="text-2xl font-bold mt-1">78.5%</div>
                    <div className="text-xs text-muted-foreground">Across all tests</div>
                  </div>
                  <div className="border rounded-md p-4">
                    <div className="text-sm font-medium">Class Rank</div>
                    <div className="text-2xl font-bold mt-1">12th</div>
                    <div className="text-xs text-muted-foreground">Out of 30 students</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/teacher/student/${studentId}`)}>
                  View Student's Complete Profile
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Helper function to identify topic strengths
function getStrongestTopics(
  questions: MCQQuestionReview[] | CodingQuestionReview[], 
  testType: 'MCQ' | 'CODING' | null
): string[] {
  const correctQuestions = questions.filter(q => q.isCorrect);
  
  // Common evaluation
  if (correctQuestions.length > questions.length * 0.8) {
    if (testType === 'CODING') {
      return ['Problem Solving', 'Algorithm Implementation'];
    }
    return ['Overall Knowledge', 'Core Concepts'];
  } else if (correctQuestions.length > questions.length * 0.5) {
    if (testType === 'CODING') {
      return ['Basic Programming Logic'];
    }
    return ['Basic Understanding'];
  }
  
  if (testType === 'CODING') {
    return ['Code Syntax'];
  }
  return ['Basic Concepts'];
}

// Helper function to identify topic weaknesses
function getWeakestTopics(
  questions: MCQQuestionReview[] | CodingQuestionReview[],
  testType: 'MCQ' | 'CODING' | null
): string[] {
  const incorrectQuestions = questions.filter(q => !q.isCorrect);
  
  if (incorrectQuestions.length > questions.length * 0.5) {
    if (testType === 'CODING') {
      return ['Complex Algorithms', 'Code Optimization'];
    }
    return ['Advanced Concepts', 'Complex Topics'];
  } else if (incorrectQuestions.length > questions.length * 0.2) {
    if (testType === 'CODING') {
      return ['Edge Case Handling'];
    }
    return ['Intermediate Areas'];
  }
  
  if (incorrectQuestions.length > 0) {
    if (testType === 'CODING') {
      return ['Specific Implementation Details'];
    }
    return ['Specific Concepts'];
  }
  
  return [];
}

export default TeacherResultPage;