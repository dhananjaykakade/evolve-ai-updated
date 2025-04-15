import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check, X, Clock as ClockIcon, AlertCircle, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface TestResult {
  _id: string;
  testId: string;
  studentId: string;
  answers: {
    questionId: string;
    selectedOption?: string;
    codeAnswer?: string;
    isCorrect: boolean;
    marksObtained: number;
  }[];
  totalMarksObtained: number;
  testDetails: {
    _id: string;
    title: string;
    type: 'MCQ' | 'CODING';
    course: string;
    totalMarks: number;
    duration: number;
    scheduledAt: string;
    expiresAt: string;
  };
  submittedAt: string;
  status: 'completed' | 'in-progress' | 'expired';
}

// Mock data for development
const mockTestResult: TestResult = {
  _id: "mock123",
  testId: "test123",
  studentId: "student123",
  answers: [
    {
      questionId: "q1",
      selectedOption: "A",
      isCorrect: true,
      marksObtained: 5
    },
    {
      questionId: "q2",
      selectedOption: "B",
      isCorrect: false,
      marksObtained: 0
    },
    {
      questionId: "q3",
      codeAnswer: "console.log('Hello World')",
      isCorrect: true,
      marksObtained: 10
    }
  ],
  totalMarksObtained: 15,
  testDetails: {
    _id: "test123",
    title: "JavaScript Fundamentals",
    type: "MCQ",
    course: "Web Development",
    totalMarks: 20,
    duration: 60,
    scheduledAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  submittedAt: new Date().toISOString(),
  status: "completed"
};

const ResultPage: React.FC = () => {
  const { user, loading, token } = useAuth();
  const { resultId } = useParams<{ resultId: string }>();
  const [result, setResult] = useState<TestResult | null>(null);
  const [Loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('User:', user);
    console.log('ResultId:', resultId);

    if (!user || !resultId) {
      setError('User or result ID not found');
      setLoading(false);
      return;
    }

    // Simulate API call with mock data
    const fetchResult = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use mock data
        setResult(mockTestResult);
        setLoading(false);
      } catch (err) {
        setError('Failed to load test result');
        console.error('Error:', err);
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId, user]);

  if (loading) {
    return (
      <Layout title="Test Result">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Test Result">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </Layout>
    );
  }

  if (!result) {
    return (
      <Layout title="Test Result">
        <div className="flex justify-center items-center h-64">
          <div>No result data found</div>
        </div>
      </Layout>
    );
  }

  const percentage = (result.totalMarksObtained / result.testDetails.totalMarks) * 100;
  const correctAnswers = result.answers.filter(a => a.isCorrect).length;
  const totalQuestions = result.answers.length;

  return (
    <Layout title="Test Result">
      <div className="space-y-6">
        <div>
          <Button variant="outline" asChild>
            <Link to="/tests" className="flex items-center">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </Link>
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{result.testDetails.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div>{result.testDetails.course}</div>
            <div>•</div>
            <div>{result.testDetails.type}</div>
            <div>•</div>
            <div>Submitted on {format(new Date(result.submittedAt), 'PPpp')}</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Score</CardDescription>
              <CardTitle className="text-4xl">
                {result.totalMarksObtained}/{result.testDetails.totalMarks}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {percentage.toFixed(1)}% correct
              </div>
              <Progress value={percentage} className="h-2 mt-2" />
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
              <CardDescription>Test Duration</CardDescription>
              <CardTitle className="text-4xl">
                {result.testDetails.duration} mins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Completed in {Math.floor(result.testDetails.duration * 0.8)} mins
              </div>
              <Progress value={80} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Status</CardDescription>
              <CardTitle className="text-2xl">
                <Badge
                  variant={result.status === 'completed' ? 'default' : result.status === 'expired' ? 'destructive' : 'outline'}
                  className="capitalize"
                >
                  {result.status === 'in-progress' ? 'In Progress' : result.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {result.status === 'completed' ? (
                  'Successfully completed'
                ) : result.status === 'expired' ? (
                  'Test expired before completion'
                ) : (
                  'Test still in progress'
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Question Breakdown</CardTitle>
              <CardDescription>Detailed performance by question</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.answers.map((answer, index) => (
                <div key={answer.questionId} className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {answer.isCorrect ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Question {index + 1}</div>
                    <div className="text-sm text-muted-foreground">
                      Marks: {answer.marksObtained}
                    </div>
                    {result.testDetails.type === 'MCQ' && (
                      <div className="text-sm">
                        Your answer: {answer.selectedOption || 'Not answered'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>Areas of strength and improvement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-medium mb-2">Time Management</div>
                <div className="flex items-center gap-2 text-sm">
                  <ClockIcon className="h-4 w-4" />
                  <span>You completed the test with 20% time remaining</span>
                </div>
              </div>

              <div>
                <div className="font-medium mb-2">Strongest Areas</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Variables (100%)</Badge>
                  <Badge variant="default">Functions (90%)</Badge>
                  <Badge variant="default">Loops (85%)</Badge>
                </div>
              </div>

              <div>
                <div className="font-medium mb-2">Areas to Improve</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="destructive">Objects (40%)</Badge>
                  <Badge variant="destructive">Arrays (50%)</Badge>
                </div>
              </div>

              {result.testDetails.type === 'CODING' && (
                <div>
                  <div className="font-medium mb-2">Code Quality</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Good variable naming</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-500" />
                      <span>Missing comments in complex sections</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>Moderate code duplication detected</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Detailed Feedback
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ResultPage;