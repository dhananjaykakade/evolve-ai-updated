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

// Interface for answer review data
interface QuestionReview {
  questionId: string;
  questionText: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  studentSelectedOptionId: string;
  isCorrect: boolean;
}

// Interface for test result summary
interface TestEvaluation {
  _id: string;
  studentId: string;
  testId: string;
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
  questions: QuestionReview[];
  loading: boolean;
  error: string | null;
}

const ResultPage: React.FC = () => {
  const { user, loading: authLoading, token } = useAuth();
  const { resultId } = useParams<{ resultId: string }>();
  const [testResult, setTestResult] = useState<TestResult>({
    evaluation: null,
    questions: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || !resultId) {
      setTestResult(prev => ({
        ...prev,
        loading: false,
        error: 'User or result ID not found'
      }));
      return;
    }

    const fetchTestResult = async () => {
      try {
        // First API: Get the test evaluation summary
        const evaluationResponse = await axios.post('http://localhost:9001/teacher/tests/evaluate', {
          testId: resultId,
          studentId: user.id
        });
        
        // Second API: Get the detailed answer review
        const reviewResponse = await axios.get(`http://localhost:9001/teacher/tests/answers/${resultId}/${user.id}`);
        
        setTestResult({
          evaluation: evaluationResponse.data.data,
          questions: reviewResponse.data.data,
          loading: false,
          error: null
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
  }, [resultId, user, authLoading]);

  if (authLoading || testResult.loading) {
    return (
      <Layout title="Test Result">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (testResult.error) {
    return (
      <Layout title="Test Result">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">{testResult.error}</div>
        </div>
      </Layout>
    );
  }

  if (!testResult.evaluation || testResult.questions.length === 0) {
    return (
      <Layout title="Test Result">
        <div className="flex justify-center items-center h-64">
          <div>No result data found</div>
        </div>
      </Layout>
    );
  }

  const { evaluation, questions } = testResult;
  const correctAnswers = questions.filter(q => q.isCorrect).length;
  const totalQuestions = questions.length;
  const submittedDate = new Date(evaluation.submittedAt);

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
          <h1 className="text-3xl font-bold tracking-tight">MCQ Test Result</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div>Test ID: {evaluation.testId}</div>
            <div>•</div>
            <div>MCQ Assessment</div>
            <div>•</div>
            <div>Submitted on {format(submittedDate, 'PPpp')}</div>
          </div>
        </div>

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
              <CardDescription>Evaluation</CardDescription>
              <CardTitle className="text-2xl">
                <Badge variant="default" className="capitalize">
                  {evaluation.evaluatedBy}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Evaluated on {format(new Date(evaluation.evaluatedAt), 'PPp')}
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
              {questions.map((question, index) => (
                <div key={question.questionId} className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {question.isCorrect ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{question.questionText}</div>
                    <div className="text-sm mt-1">
                      <span className="font-medium">Your answer:</span> {
                        question.options.find(opt => opt.id === question.studentSelectedOptionId)?.text || 'Not answered'
                      }
                    </div>
                    {!question.isCorrect && (
                      <div className="text-sm mt-1 text-green-600">
                        <span className="font-medium">Correct answer:</span> {
                          question.options.find(opt => opt.id === question.correctOptionId)?.text || 'Unknown'
                        }
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
                <div className="font-medium mb-2">AI Feedback</div>
                <div className="text-sm p-3 bg-gray-50 rounded-md">
                  {evaluation.aiFeedback}
                </div>
              </div>

              <div>
                <div className="font-medium mb-2">Score Analysis</div>
                <div className="flex items-center gap-2 text-sm">
                  <ClockIcon className="h-4 w-4" />
                  <span>You scored {evaluation.percentage}% on this assessment</span>
                </div>
              </div>

              <div>
                <div className="font-medium mb-2">Strongest Areas</div>
                <div className="flex flex-wrap gap-2">
                  {getStrongestTopics(questions).map(topic => (
                    <Badge key={topic} variant="default">{topic}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-medium mb-2">Areas to Improve</div>
                <div className="flex flex-wrap gap-2">
                  {getWeakestTopics(questions).map(topic => (
                    <Badge key={topic} variant="destructive">{topic}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => window.print()}>
                Download Result
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

// Helper function to identify topic strengths (simplified example)
function getStrongestTopics(questions: QuestionReview[]): string[] {
  const correctQuestions = questions.filter(q => q.isCorrect);
  
  // This is a simplified placeholder - in a real app you'd categorize questions by topic
  // and analyze which topics had the highest success rates
  if (correctQuestions.length > questions.length * 0.8) {
    return ['Overall Knowledge', 'Core Concepts'];
  } else if (correctQuestions.length > questions.length * 0.5) {
    return ['Basic Understanding'];
  }
  return ['Basic Concepts'];
}

// Helper function to identify topic weaknesses (simplified example)
function getWeakestTopics(questions: QuestionReview[]): string[] {
  const incorrectQuestions = questions.filter(q => !q.isCorrect);
  
  // This is a simplified placeholder - in a real app you'd categorize questions by topic
  // and analyze which topics had the lowest success rates
  if (incorrectQuestions.length > questions.length * 0.5) {
    return ['Advanced Concepts', 'Complex Topics'];
  } else if (incorrectQuestions.length > questions.length * 0.2) {
    return ['Intermediate Areas'];
  }
  return incorrectQuestions.length > 0 ? ['Specific Concepts'] : [];
}

export default ResultPage;