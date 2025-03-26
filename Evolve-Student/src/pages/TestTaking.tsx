
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Clock, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

// Mock data for test details
const getMockTestData = (testId: string) => {
  // MCQ test data
  if (testId === 'mcq-1') {
    return {
      id: 'mcq-1',
      title: 'Midterm Mathematics Quiz',
      subject: 'Mathematics',
      duration: 45,
      type: 'mcq',
      questions: [
        {
          id: 1,
          question: 'What is the value of π (pi) to two decimal places?',
          options: ['3.14', '3.16', '3.12', '3.18'],
          correctAnswer: '3.14'
        },
        {
          id: 2,
          question: 'What is the formula for the area of a circle?',
          options: ['πr²', '2πr', 'πr', '2πr²'],
          correctAnswer: 'πr²'
        },
        {
          id: 3,
          question: 'If a triangle has angles of 60°, 60°, and 60°, what type of triangle is it?',
          options: ['Scalene', 'Isosceles', 'Equilateral', 'Right-angled'],
          correctAnswer: 'Equilateral'
        },
        {
          id: 4,
          question: 'What is the square root of 144?',
          options: ['12', '14', '10', '16'],
          correctAnswer: '12'
        },
        {
          id: 5,
          question: 'What is the value of x in the equation 2x + 5 = 15?',
          options: ['5', '10', '7.5', '5.5'],
          correctAnswer: '5'
        }
      ]
    };
  }
  
  // Programming test data
  if (testId === 'prog-1') {
    return {
      id: 'prog-1',
      title: 'Data Structures Implementation',
      subject: 'Computer Science',
      duration: 60,
      type: 'programming',
      languages: ['JavaScript', 'Python', 'Java'],
      questions: [
        {
          id: 1,
          title: 'Stack Implementation',
          description: 'Implement a stack data structure with push, pop, and peek operations.',
          constraints: 'The stack should handle empty stack exceptions appropriately.',
          examples: [
            {
              input: 'push(5), push(10), pop(), peek()',
              output: '10, 5'
            }
          ],
          starterCode: {
            JavaScript: '// Implement your Stack class here\nclass Stack {\n  constructor() {\n    // Initialize your stack\n  }\n\n  push(item) {\n    // Add item to stack\n  }\n\n  pop() {\n    // Remove and return top item\n  }\n\n  peek() {\n    // Return top item without removing\n  }\n\n  isEmpty() {\n    // Return true if stack is empty\n  }\n}',
            Python: '# Implement your Stack class here\nclass Stack:\n    def __init__(self):\n        # Initialize your stack\n        pass\n        \n    def push(self, item):\n        # Add item to stack\n        pass\n        \n    def pop(self):\n        # Remove and return top item\n        pass\n        \n    def peek(self):\n        # Return top item without removing\n        pass\n        \n    def is_empty(self):\n        # Return true if stack is empty\n        pass',
            Java: 'public class Stack {\n    // Implement your Stack class here\n    \n    public Stack() {\n        // Initialize your stack\n    }\n    \n    public void push(int item) {\n        // Add item to stack\n    }\n    \n    public int pop() {\n        // Remove and return top item\n        return 0;\n    }\n    \n    public int peek() {\n        // Return top item without removing\n        return 0;\n    }\n    \n    public boolean isEmpty() {\n        // Return true if stack is empty\n        return true;\n    }\n}'
          }
        },
        {
          id: 2,
          title: 'Queue Implementation',
          description: 'Implement a queue data structure with enqueue, dequeue, and peek operations.',
          constraints: 'The queue should follow First-In-First-Out (FIFO) principle.',
          examples: [
            {
              input: 'enqueue(5), enqueue(10), dequeue(), peek()',
              output: '5, 10'
            }
          ],
          starterCode: {
            JavaScript: '// Implement your Queue class here\nclass Queue {\n  constructor() {\n    // Initialize your queue\n  }\n\n  enqueue(item) {\n    // Add item to queue\n  }\n\n  dequeue() {\n    // Remove and return front item\n  }\n\n  peek() {\n    // Return front item without removing\n  }\n\n  isEmpty() {\n    // Return true if queue is empty\n  }\n}',
            Python: '# Implement your Queue class here\nclass Queue:\n    def __init__(self):\n        # Initialize your queue\n        pass\n        \n    def enqueue(self, item):\n        # Add item to queue\n        pass\n        \n    def dequeue(self):\n        # Remove and return front item\n        pass\n        \n    def peek(self):\n        # Return front item without removing\n        pass\n        \n    def is_empty(self):\n        # Return true if queue is empty\n        pass',
            Java: 'public class Queue {\n    // Implement your Queue class here\n    \n    public Queue() {\n        // Initialize your queue\n    }\n    \n    public void enqueue(int item) {\n        // Add item to queue\n    }\n    \n    public int dequeue() {\n        // Remove and return front item\n        return 0;\n    }\n    \n    public int peek() {\n        // Return front item without removing\n        return 0;\n    }\n    \n    public boolean isEmpty() {\n        // Return true if queue is empty\n        return true;\n    }\n}'
          }
        }
      ]
    };
  }
  
  return null;
};

const MCQTest: React.FC<{ test: any }> = ({ test }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [remainingTime, setRemainingTime] = useState(test.duration * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Timer effect
  useEffect(() => {
    if (remainingTime > 0 && !isSubmitted) {
      const timer = setTimeout(() => {
        setRemainingTime(remainingTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (remainingTime === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [remainingTime, isSubmitted]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [test.questions[currentQuestion].id]: value
    });
  };
  
  const nextQuestion = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const calculateScore = () => {
    let totalScore = 0;
    test.questions.forEach((question: any) => {
      if (answers[question.id] === question.correctAnswer) {
        totalScore++;
      }
    });
    return (totalScore / test.questions.length) * 100;
  };
  
  const handleSubmit = () => {
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setIsSubmitted(true);
    toast({
      title: "Test Submitted!",
      description: `Your score: ${calculatedScore.toFixed(1)}%`,
      variant: calculatedScore >= 70 ? "default" : "destructive",
    });
  };
  
  const handleFinish = () => {
    navigate('/tests');
  };
  
  // If test is submitted, show results
  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl font-bold">{score.toFixed(1)}%</div>
              <div className="text-muted-foreground">
                {score >= 70 ? (
                  <div className="flex items-center justify-center text-green-600 gap-2">
                    <CheckCircle size={20} /> Passed
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-red-600 gap-2">
                    <AlertCircle size={20} /> Needs Improvement
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Question Review</h3>
              {test.questions.map((question: any, index: number) => (
                <div key={question.id} className="p-4 border rounded-md">
                  <div className="font-medium">Question {index + 1}: {question.question}</div>
                  <div className="mt-2 text-sm">
                    <div className="flex gap-2">
                      <span className="font-semibold">Your answer:</span>
                      <span className={question.correctAnswer === answers[question.id] ? "text-green-600" : "text-red-600"}>
                        {answers[question.id] || "Not answered"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold">Correct answer:</span>
                      <span className="text-green-600">{question.correctAnswer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleFinish} className="w-full">Return to Tests</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Currently taking test
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">
          Question {currentQuestion + 1} of {test.questions.length}
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock size={16} />
          <div className={`${remainingTime < 60 ? 'text-red-500 animate-pulse' : ''}`}>
            {formatTime(remainingTime)}
          </div>
        </div>
      </div>
      
      <Progress value={(currentQuestion + 1) / test.questions.length * 100} className="h-2" />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {test.questions[currentQuestion].question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={answers[test.questions[currentQuestion].id] || ''} 
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            {test.questions[currentQuestion].options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft size={16} className="mr-2" /> Previous
          </Button>
          
          <div className="flex gap-2">
            {currentQuestion === test.questions.length - 1 ? (
              <Button onClick={handleSubmit}>Submit Test</Button>
            ) : (
              <Button onClick={nextQuestion}>
                Next <ArrowRight size={16} className="ml-2" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

const ProgrammingTest: React.FC<{ test: any }> = ({ test }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(test.languages[0]);
  const [code, setCode] = useState<Record<number, string>>({});
  const [remainingTime, setRemainingTime] = useState(test.duration * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<Record<number, any>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Initialize code with starter code
  useEffect(() => {
    const initialCode: Record<number, string> = {};
    test.questions.forEach((question: any) => {
      initialCode[question.id] = question.starterCode[selectedLanguage];
    });
    setCode(initialCode);
  }, [selectedLanguage, test.questions]);
  
  // Timer effect
  useEffect(() => {
    if (remainingTime > 0 && !isSubmitted) {
      const timer = setTimeout(() => {
        setRemainingTime(remainingTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (remainingTime === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [remainingTime, isSubmitted]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleCodeChange = (value: string) => {
    setCode({
      ...code,
      [test.questions[currentQuestion].id]: value
    });
  };
  
  const nextQuestion = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const handleRun = () => {
    // Simulate code execution feedback
    toast({
      title: "Code executed",
      description: "Your code has been run. Check the console for output.",
    });
  };
  
  const handleSubmit = () => {
    // Simulate AI-generated feedback for all questions
    const simulatedFeedback: Record<number, any> = {};
    
    test.questions.forEach((question: any) => {
      // Generate simulated feedback based on the code length as a simple metric
      const questionCode = code[question.id] || '';
      const codeQuality = questionCode.length > 300 ? 'Good' : 'Needs improvement';
      const score = questionCode.length > 200 ? (Math.random() * 30 + 70) : (Math.random() * 40 + 30);
      
      simulatedFeedback[question.id] = {
        score: score,
        feedback: [
          {
            category: 'Code Structure',
            comment: codeQuality === 'Good' 
              ? 'Well-structured code with clear organization.'
              : 'Consider organizing your code better for readability.',
            rating: codeQuality === 'Good' ? 4 : 2
          },
          {
            category: 'Algorithm Efficiency',
            comment: codeQuality === 'Good'
              ? 'Your solution has good time complexity.'
              : 'Your solution could be more efficient.',
            rating: codeQuality === 'Good' ? 4 : 2
          },
          {
            category: 'Error Handling',
            comment: questionCode.includes('try') || questionCode.includes('catch') || questionCode.includes('except')
              ? 'Good error handling implementation.'
              : 'Missing error handling for edge cases.',
            rating: (questionCode.includes('try') || questionCode.includes('catch') || questionCode.includes('except')) ? 5 : 1
          }
        ]
      };
    });
    
    setFeedback(simulatedFeedback);
    setIsSubmitted(true);
    
    // Calculate overall score
    const overallScore = Object.values(simulatedFeedback).reduce((acc, curr) => acc + curr.score, 0) / test.questions.length;
    
    toast({
      title: "Test Submitted!",
      description: `Your average score: ${overallScore.toFixed(1)}%`,
    });
  };
  
  const handleFinish = () => {
    navigate('/tests');
  };
  
  // If test is submitted, show results
  if (isSubmitted) {
    const currentFeedback = feedback[test.questions[currentQuestion].id];
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">
            Question {currentQuestion + 1} of {test.questions.length}
          </div>
          <div className="text-sm font-medium">
            Language: {selectedLanguage}
          </div>
        </div>
        
        <Progress value={(currentQuestion + 1) / test.questions.length * 100} className="h-2" />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{test.questions[currentQuestion].title}</span>
              <Badge 
                variant="outline" 
                className={currentFeedback.score >= 70 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
              >
                Score: {currentFeedback.score.toFixed(1)}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Your Code</h3>
              <div className="bg-muted p-4 rounded-md whitespace-pre-wrap font-mono text-sm overflow-auto max-h-64">
                {code[test.questions[currentQuestion].id]}
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium">AI Feedback</h3>
              {currentFeedback.feedback.map((item: any, index: number) => (
                <div key={index} className="p-3 border rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.category}</span>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span 
                          key={i} 
                          className={`h-2 w-2 rounded-full mx-0.5 ${i < item.rating ? 'bg-primary' : 'bg-muted'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm mt-1">{item.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft size={16} className="mr-2" /> Previous
            </Button>
            
            <Button onClick={handleFinish} variant="default">
              {currentQuestion === test.questions.length - 1 ? "Finish" : (
                <div className="flex items-center">
                  Next <ArrowRight size={16} className="ml-2" />
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Currently taking test
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">
          Question {currentQuestion + 1} of {test.questions.length}
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock size={16} />
          <div className={`${remainingTime < 60 ? 'text-red-500 animate-pulse' : ''}`}>
            {formatTime(remainingTime)}
          </div>
        </div>
      </div>
      
      <Progress value={(currentQuestion + 1) / test.questions.length * 100} className="h-2" />
      
      <Card>
        <CardHeader>
          <CardTitle>{test.questions[currentQuestion].title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Problem Description</h3>
            <p>{test.questions[currentQuestion].description}</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Constraints:</span> {test.questions[currentQuestion].constraints}
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Examples</h3>
            {test.questions[currentQuestion].examples.map((example: any, index: number) => (
              <div key={index} className="bg-muted p-3 rounded-md text-sm">
                <div><span className="font-medium">Input:</span> {example.input}</div>
                <div><span className="font-medium">Output:</span> {example.output}</div>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Your Solution</h3>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {test.languages.map((lang: string) => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea 
              value={code[test.questions[currentQuestion].id] || ''}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="font-mono min-h-[300px] text-sm"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft size={16} className="mr-2" /> Previous
            </Button>
            <Button variant="outline" onClick={handleRun}>Run Code</Button>
          </div>
          
          <div className="flex gap-2">
            {currentQuestion === test.questions.length - 1 ? (
              <Button onClick={handleSubmit}>Submit Test</Button>
            ) : (
              <Button onClick={nextQuestion}>
                Next <ArrowRight size={16} className="ml-2" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

const TestTaking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch with delay
    setTimeout(() => {
      if (id) {
        const testData = getMockTestData(id);
        if (testData) {
          setTest(testData);
        }
      }
      setLoading(false);
    }, 800);
  }, [id]);
  
  if (loading) {
    return (
      <Layout title="Loading Test...">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-pulse w-64 h-4 bg-muted rounded mb-4"></div>
          <div className="animate-pulse w-40 h-4 bg-muted rounded"></div>
        </div>
      </Layout>
    );
  }
  
  if (!test) {
    return (
      <Layout title="Test Not Found">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertTriangle size={48} className="text-yellow-500" />
          <h2 className="text-2xl font-semibold">Test Not Found</h2>
          <p className="text-muted-foreground">The requested test could not be found.</p>
          <Button onClick={() => navigate('/tests')}>Return to Tests</Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={test.title}>
      {test.type === 'mcq' ? (
        <MCQTest test={test} />
      ) : (
        <ProgrammingTest test={test} />
      )}
    </Layout>
  );
};

export default TestTaking;
