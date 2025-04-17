import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTest } from '@/contexts/TestContext';
import { getTestById } from '@/services/api';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, BookOpen, Code, Clock, HelpCircle, ListChecks } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { connectWebSocket } from '@/util/websocket';

const TestInstructions = () => {
  const { testId, testType, token, userId } = useParams();
  const navigate = useNavigate();
  const { startTest, user, setUser } = useTest();
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [isStartingTest, setIsStartingTest] = React.useState(false);

  // fetch user from backend by userId coming from params and set user 
  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:9001/auth/students/${userId}`);
        connectWebSocket(response.data.data.student.id, response.data.data.student.name, testId!);

        localStorage.setItem('user', JSON.stringify(response.data.data.student));
        setUser(response.data.data.student);
        
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    };
    fetchUser();
  }, [userId]);

  const { data: testData, isLoading, error } = useQuery({
    queryKey: ['test', testId],
    queryFn: () => getTestById(testId!, token!),
    enabled: !!testId && !!token,
    onError: (err: any) => {
      navigate('/error', { 
        state: { 
          message: err.message || "Failed to fetch test details" 
        } 
      });
    }
  });

  const handleStartTest = async () => {
    if (!user || !testId) {
      toast.error("User information or test ID is missing");
      return;
    }

    setIsStartingTest(true);
    try {
      // Call the startTestForStudent API
      const response = await axios.post(`http://localhost:9001/student/tests/${testId}/start`, {
        studentId: user.id
      });
      if(response.status === 409) {

      }

      console.log(response);
      // If successful, continue with starting the test
      const type = testType?.toLowerCase() as 'mcq' | 'coding';
      startTest(type, testId);
      navigate(`/test/${type}/${testId}`);
      
      toast.success("Test started successfully!");
    } catch (error: any) {
      // Handle errors from the API
      const errorMessage = error.response?.data?.message || "Failed to start the test";
      toast.error(errorMessage);
      
      // If there's a conflict (test already started), navigate to the test
      if (error.response?.status === 409) {
        const type = testType?.toLowerCase() as 'mcq' | 'coding';
        navigate(`/test/${type}/${testId}`);
      }
    } finally {
      setIsStartingTest(false);
      setShowConfirmation(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">Loading test details...</div>
      </div>
    );
  }

  if (error || !testData) {
    return null; // Will be handled by onError navigation
  }

  const test = testData.data;
  const isCodingTest = testType?.toUpperCase() === 'CODING';
  const isMcqTest = testType?.toUpperCase() === 'MCQ';

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-test-navy mb-4">
            {test.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isCodingTest 
              ? 'Programming assessment to evaluate your coding skills' 
              : 'Multiple choice assessment to test your knowledge'}
          </p>
        </div>

        <div className="grid gap-6">
          {/* Test Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isCodingTest ? (
                  <Code className="h-5 w-5 text-test-teal" />
                ) : (
                  <BookOpen className="h-5 w-5 text-test-teal" />
                )}
                Test Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <ListChecks className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Questions</p>
                    <p className="font-medium">{test.questions.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{formatDuration(30 * 60)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{isCodingTest ? 'Coding' : 'Multiple Choice'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Warnings</p>
                    <p className="font-medium">3 allowed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Test Instructions</CardTitle>
              <CardDescription>
                Please read these instructions carefully before starting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> The test will automatically submit when time expires.
                </AlertDescription>
              </Alert>

              {isCodingTest ? (
                <>
                  <div>
                    <h3 className="font-semibold mb-2">Coding Test Guidelines</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>You will be presented with {test.questions.length} coding problems of varying difficulty</li>
                      <li>Each problem includes a description, starter code, and test cases</li>
                      <li>Write your solution in the provided editor - don't modify function signatures</li>
                      <li>Test your code against the provided test cases before submitting</li>
                      <li>Problems must be solved in sequence - you can't skip ahead</li>
                      <li>You can't go back to previous questions once submitted</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Evaluation Criteria</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Code correctness (passing all test cases)</li>
                      <li>Code efficiency and readability</li>
                      <li>Proper handling of edge cases</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="font-semibold mb-2">MCQ Test Guidelines</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>You will be presented with {test.questions.length} multiple choice questions</li>
                      <li>Each question has 4 options with exactly one correct answer</li>
                      <li>You can navigate freely between questions</li>
                      <li>Mark questions for review if you want to come back to them later</li>
                      <li>Answer all questions before submitting</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Navigation</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Use the question navigation panel to move between questions</li>
                      <li>Questions will be color-coded based on status (answered, unanswered, reviewed)</li>
                      <li>You can change your answers anytime before submission</li>
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* System Requirements Card */}
          <Card>
            <CardHeader>
              <CardTitle>System Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Stable internet connection</li>
                <li>Modern browser (Chrome, Firefox, Edge, or Safari)</li>
                <li>Fullscreen mode will be enforced</li>
                <li>Disable any pop-up blockers</li>
                {isCodingTest && (
                  <li>For coding tests, ensure your browser supports syntax highlighting</li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Anti-Cheating Card */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Anti-Cheating Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-red-700">
                <li>The test must be taken in fullscreen mode only</li>
                <li>Switching tabs/windows will trigger warnings (3 warnings = test termination)</li>
                <li>Copy/paste functionality is disabled</li>
                <li>Right-click and developer tools are disabled</li>
                <li>Any suspicious activity will be recorded and may invalidate your test</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-center">
          <Button 
            className="w-full max-w-md bg-test-navy hover:bg-test-navy/90 h-12 text-lg"
            onClick={() => setShowConfirmation(true)}
            disabled={!user}
          >
            Start Test Now
          </Button>
        </div>

        <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ready to Begin?</AlertDialogTitle>
              <AlertDialogDescription>
                {isCodingTest ? (
                  <>
                    You're about to start a {formatDuration(30 * 60)} coding assessment with {test.questions.length} problems.
                    <br /><br />
                    <strong>Remember:</strong> You can't pause or restart once begun.
                  </>
                ) : (
                  <>
                    You're about to start a {formatDuration(30 * 60)} MCQ test with {test.questions.length} questions.
                    <br /><br />
                    <strong>Remember:</strong> Answer all questions before submitting.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isStartingTest}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-test-navy hover:bg-test-navy/90"
                onClick={handleStartTest}
                disabled={isStartingTest}
              >
                {isStartingTest ? 'Starting...' : 'I\'m Ready - Start Test'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default TestInstructions;