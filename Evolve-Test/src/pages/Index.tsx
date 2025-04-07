
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTest } from '@/contexts/TestContext';
import { FileCode, List } from 'lucide-react';

export default function Index() {
  const { toast } = useToast();
  const { openInNewWindow } = useTest();
  
  const handleStartTest = (testType: 'mcq' | 'coding') => {
    openInNewWindow(testType);
    toast({
      title: "Test Starting",
      description: `Your ${testType === 'mcq' ? 'Multiple Choice' : 'Coding'} test is opening in a new window.`,
    });
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Student Assessment Portal</h1>
        <p className="text-lg text-muted-foreground">Complete your assignments and tests efficiently</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        {/* MCQ Test Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5 text-primary" />
              Multiple Choice Questions
            </CardTitle>
            <CardDescription>
              Test your knowledge with multiple choice questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>60 minutes duration</span>
              </div>
              <p>Answer a series of multiple choice questions covering various topics in computer science and programming.</p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-end">
            <Button onClick={() => handleStartTest('mcq')}>Start Test</Button>
          </CardFooter>
        </Card>

        {/* Coding Test Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-primary" />
              Coding Assessment
            </CardTitle>
            <CardDescription>
              Solve coding problems with a live compiler.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>60 minutes duration</span>
              </div>
              <p>Tackle programming challenges with our built-in code editor and test your solutions against various test cases.</p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-end">
            <Button onClick={() => handleStartTest('coding')}>Start Test</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
