
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { useTest } from '@/contexts/TestContext';

const TestSubmitted = () => {
  const { resetTest } = useTest();
  const navigate = useNavigate();

  useEffect(() => {
    // Reset the test when this page loads
    resetTest();
  }, [resetTest]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-20 w-20 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Test Submitted Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            Thank you for completing your assessment. Your responses have been recorded.
          </p>
          <div className="bg-muted p-4 rounded-md mb-4">
            <p className="font-medium">What happens next?</p>
            <p className="text-sm mt-2">
              Your test has been submitted and will be evaluated. Results will be communicated to you
              according to your institution's policies.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleGoHome} className="w-full">
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestSubmitted;
