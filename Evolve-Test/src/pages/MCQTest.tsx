import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import TestHeader from '@/components/TestHeader';
import { useTest } from '@/contexts/TestContext';
import { Flag, Check, AlertCircle, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { toast } from 'sonner';

const mockQuestions = [
  {
    id: 1,
    question: "What is the time complexity of binary search?",
    options: [
      "O(n)",
      "O(log n)",
      "O(n log n)",
      "O(n²)"
    ],
    correctAnswer: 1 // zero-indexed
  },
  {
    id: 2,
    question: "Which data structure uses LIFO (Last In First Out)?",
    options: [
      "Queue",
      "Stack",
      "Linked List",
      "Binary Tree"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "Which sorting algorithm has the best average time complexity?",
    options: [
      "Bubble Sort",
      "Selection Sort",
      "Quick Sort",
      "Insertion Sort"
    ],
    correctAnswer: 2
  },
  {
    id: 4,
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Multi Language",
      "Hyper Transfer Markup Language",
      "Hyper Text Mechanism Language"
    ],
    correctAnswer: 0
  },
  {
    id: 5,
    question: "Which of the following is not a JavaScript framework?",
    options: [
      "Angular",
      "React",
      "Django",
      "Vue"
    ],
    correctAnswer: 2
  }
];

const MCQTest = () => {
  const navigate = useNavigate();
  const { isTestActive, submitTest, startTest } = useTest();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(mockQuestions.length).fill(null));
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  
  useEffect(() => {
    const testType = localStorage.getItem('testType');
    const testTime = localStorage.getItem('testTime');
    
    if (testType === 'mcq' && testTime && !isTestActive) {
      startTest('mcq', parseInt(testTime));
      localStorage.removeItem('testType');
      localStorage.removeItem('testTime');
    } else if (!isTestActive) {
      navigate('/');
    }
  }, [isTestActive, navigate, startTest]);

  const currentQuestion = mockQuestions[currentQuestionIndex];

  const handleAnswerSelect = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleToggleFlag = () => {
    if (flaggedQuestions.includes(currentQuestionIndex)) {
      setFlaggedQuestions(flaggedQuestions.filter(q => q !== currentQuestionIndex));
      toast("Question unflagged for review");
    } else {
      setFlaggedQuestions([...flaggedQuestions, currentQuestionIndex]);
      toast("Question flagged for review");
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleShowSummary = () => {
    setShowSummary(true);
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowSummary(false);
  };

  const handleSubmitTest = () => {
    const unansweredCount = answers.filter(a => a === null).length;
    
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    } else {
      const confirmSubmit = window.confirm(
        "Are you sure you want to submit your test? You cannot change your answers after submission."
      );
      if (!confirmSubmit) return;
    }
    
    submitTest();
  };

  if (showSummary) {
    return (
      <div className="min-h-screen pt-16 pb-6 px-4 md:px-8 bg-background">
        <TestHeader />
        
        <div className="max-w-3xl mx-auto mt-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-4">Test Summary</h2>
          
          <div className="bg-card rounded-lg shadow p-4 mb-6">
            <p className="mb-2">
              <span className="font-medium">Total Questions:</span> {mockQuestions.length}
            </p>
            <p className="mb-2">
              <span className="font-medium">Answered:</span> {answers.filter(a => a !== null).length}
            </p>
            <p className="mb-2">
              <span className="font-medium">Unanswered:</span> {answers.filter(a => a === null).length}
            </p>
            <p className="mb-2">
              <span className="font-medium">Flagged for Review:</span> {flaggedQuestions.length}
            </p>
          </div>
          
          <div className="bg-card rounded-lg shadow p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3">Questions Overview</h3>
            
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {mockQuestions.map((_, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className={`h-10 ${
                    answers[index] !== null 
                      ? flaggedQuestions.includes(index)
                        ? 'bg-yellow-100 border-yellow-400'
                        : 'bg-green-100 border-green-400'
                      : flaggedQuestions.includes(index)
                        ? 'bg-orange-100 border-orange-400'
                        : 'bg-gray-100'
                  }`}
                  onClick={() => handleJumpToQuestion(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-400 rounded"></div>
                <span className="text-sm">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-400 rounded"></div>
                <span className="text-sm">Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-400 rounded"></div>
                <span className="text-sm">Answered & Flagged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 border border-orange-400 rounded"></div>
                <span className="text-sm">Unanswered & Flagged</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline"
              onClick={() => setShowSummary(false)}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Test
            </Button>
            
            <Button 
              onClick={handleSubmitTest}
              className="flex items-center gap-1"
            >
              <Send className="h-4 w-4" />
              Submit Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-6 px-4 md:px-8 bg-background">
      <TestHeader />
      
      <div className="max-w-3xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {mockQuestions.length}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFlag}
            className={`flex items-center gap-1 ${
              flaggedQuestions.includes(currentQuestionIndex) 
                ? 'bg-yellow-100 text-yellow-700 border-yellow-300' 
                : ''
            }`}
          >
            <Flag className="h-4 w-4" />
            {flaggedQuestions.includes(currentQuestionIndex) 
              ? 'Unflag'
              : 'Flag for Review'}
          </Button>
        </div>
        
        <Card className="mb-8 animate-fade-in">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>
            
            <RadioGroup 
              value={answers[currentQuestionIndex]?.toString() || ''}
              onValueChange={handleAnswerSelect}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 border border-input p-3 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </Card>
        
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentQuestionIndex === mockQuestions.length - 1}
              className="flex items-center gap-1"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={handleShowSummary}
              className="flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              Review Answers
            </Button>
            
            <Button
              onClick={handleSubmitTest}
              className="flex items-center gap-1"
            >
              <Send className="h-4 w-4" />
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQTest;
