import React from 'react';
import { useTest } from '@/contexts/TestContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Code, AlertTriangle, Clock } from 'lucide-react';

const Index = () => {
  const { startTest } = useTest();
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-test-navy mb-4">
            Student Test Evaluation Portal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to your examination platform. Please review the test instructions before starting.
          </p>
        </div>
        
        <Tabs defaultValue="instructions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="mcq">MCQ Test</TabsTrigger>
            <TabsTrigger value="coding">Coding Test</TabsTrigger>
          </TabsList>
          
          <TabsContent value="instructions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-test-orange" />
                  Important Test Rules
                </CardTitle>
                <CardDescription>
                  Please read all instructions carefully before starting the test
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-2">Anti-Cheating Measures</h3>
                  <ul className="list-disc pl-5 text-amber-700 space-y-1">
                    <li>The test will run in fullscreen mode only</li>
                    <li>Switching tabs or windows will trigger a warning</li>
                    <li>Copy/paste and right-clicking are disabled during the test</li>
                    <li>Opening developer tools is not allowed</li>
                    <li>After 3 warnings, your test will be automatically terminated</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-test-navy" />
                    Time Limit
                  </h3>
                  <p>You will have 30 minutes to complete the test once started.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">General Instructions</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Ensure you have a stable internet connection</li>
                    <li>Close all unnecessary applications before starting</li>
                    <li>You cannot pause the test once started</li>
                    <li>Submit your test before the time expires</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="mcq" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-test-teal" />
                  MCQ Test Information
                </CardTitle>
                <CardDescription>
                  Multiple choice questions to test your knowledge
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Test Format</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>5 multiple choice questions</li>
                    <li>Each question has 4 options with a single correct answer</li>
                    <li>You can navigate between questions freely</li>
                    <li>You can mark questions for review</li>
                    <li>You can skip questions and return to them later</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Scoring</h3>
                  <p>Each correct answer is worth 1 point. There is no negative marking for incorrect answers.</p>
                </div>
                
                <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
                  <p className="text-blue-800">
                    This test evaluates your understanding of web development concepts including React, TypeScript, and modern JavaScript.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-test-navy hover:bg-test-navy/90"
                  onClick={() => startTest('mcq')}
                >
                  Start MCQ Test
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="coding" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-test-teal" />
                  Coding Test Information
                </CardTitle>
                <CardDescription>
                  Solve programming challenges to demonstrate your skills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Challenge Format</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You will face 3 coding problems of increasing difficulty</li>
                    <li>You'll write code in TypeScript</li>
                    <li>You can test your solution against provided test cases</li>
                    <li>Your solution will be evaluated for correctness and efficiency</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Tools Available</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Code editor with syntax highlighting</li>
                    <li>Test case runner</li>
                    <li>Console output for debugging</li>
                  </ul>
                </div>
                
                <div className="rounded-md bg-green-50 p-4 border border-green-200 mb-4">
                  <p className="text-green-800">
                    This test evaluates your problem-solving skills and ability to implement algorithms in TypeScript.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-test-navy hover:bg-test-navy/90"
                  onClick={() => startTest('coding')}
                >
                  Start Coding Test
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
