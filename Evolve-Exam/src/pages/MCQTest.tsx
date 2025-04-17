import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '@/contexts/TestContext';
import Timer from '@/components/Timer';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronRight, ChevronLeft, Flag, Save, SkipForward, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const MCQTest: React.FC = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { 
    testType, 
    mcqQuestions, 
    mcqAnswers, 
    currentQuestionIndex, 
    setCurrentQuestionIndex,
    setMCQAnswer,
    updateQuestionStatus,
    submitTest,
    warningCount,
    isLoading,
    error,
    startTest,
    user
  } = useTest();

  // Fix #1: Avoid destructuring startTest separately which creates a separate reference
  // and could contribute to re-renders

  // Initialize test only once
  useEffect(() => {
    if (testId && !isInitialized) {
      startTest('mcq', testId);
      setIsInitialized(true);
    }
  }, [testId, startTest, isInitialized]);
  
  // Handle loading and error states
  useEffect(() => {
    // Fix #2: Only run this effect when not loading
    if (!isLoading) {
      if (error) {
        toast.error('Failed to load questions');
        navigate('/error');
      } else if (mcqQuestions.length === 0) {
        // Fix #3: Create error timeout only if no questions are loaded
        const timer = setTimeout(() => {
          toast.error('Questions taking too long to load');
          navigate('/error');
        }, 10000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, error, mcqQuestions.length, navigate]);
  
  // Redirect to home if not in MCQ test - only after loading is complete
  useEffect(() => {
    if (!isLoading && testType !== 'mcq' && isInitialized) {
      navigate('/');
    }
  }, [testType, navigate, isLoading, isInitialized]);


  
  
  // Show loading state
  if (isLoading || mcqQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-test-teal mx-auto mb-4"></div>
          <p className="text-gray-700">Loading test questions...</p>
        </div>
      </div>
    );
  }

  if (testType !== 'mcq') {
    return null; // Don't render anything while redirecting
  }
  
  // Fix #4: Handle case when questions array is empty or current index is out of bounds
  if (mcqQuestions.length === 0 || currentQuestionIndex >= mcqQuestions.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-test-orange mx-auto mb-4" />
          <p className="text-gray-700">No questions available for this test.</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = mcqQuestions[currentQuestionIndex];
  // Fix #5: Safely handle the case when currentQuestion might be undefined
  const currentAnswer = currentQuestion 
    ? mcqAnswers.find(a => a.questionId === currentQuestion.id) 
    : undefined;
  
  const handleOptionSelect = (optionId: string) => {
    if (!currentQuestion) return;
    setMCQAnswer(currentQuestion.id, optionId);
  };
  
  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < mcqQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  };
  
  const handleSkip = () => {
    if (!currentQuestion) return;
    updateQuestionStatus(currentQuestion.id, 'skipped');
    
    // Fix #6: Check if this is the last question before navigating
    if (currentQuestionIndex < mcqQuestions.length - 1) {
      navigateToQuestion(currentQuestionIndex + 1);
    } else {
      toast.info("You've reached the last question!");
    }
  };
  
  const handleSave = () => {
    if (!currentQuestion) return;
    if (currentAnswer?.selectedOptionId) {
      updateQuestionStatus(currentQuestion.id, 'answered');
      toast.success('Answer saved!');
    } else {
      toast.error('Please select an answer before saving.');
    }
  };
  
  const handleReview = () => {
    if (!currentQuestion) return;
    updateQuestionStatus(currentQuestion.id, 'reviewed');
    toast.info('Question marked for review.');
  };
  
  const handleSubmit = () => {
    const unansweredCount = mcqAnswers.filter(a => 
      a.status === 'unanswered' || a.selectedOptionId === null
    ).length;
    
    if (unansweredCount > 0) {
      toast.warning(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`, {
        action: {
          label: 'Submit Anyway',
          onClick: submitTest
        }
      });
    } else {
      submitTest();
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-test-teal text-white';
      case 'skipped': return 'bg-test-orange text-white';
      case 'reviewed': return 'bg-yellow-500 text-white';
      default: return 'bg-white';
    }
  };
  
  // Calculate progress
  const answeredCount = mcqAnswers.filter(a => a.status === 'answered').length;
  const progress = mcqQuestions.length > 0 
    ? (answeredCount / mcqQuestions.length) * 100 
    : 0;
  
  return (
    <div className="test-container">
      <header className="test-header">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">MCQ Test</h1>
          
          {warningCount > 0 && (
            <div className="flex items-center text-test-orange">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span className="text-sm">Warnings: {warningCount}/3</span>
            </div>
          )}
        </div>
        
        <Timer />
      </header>
      
      <div className="test-content flex flex-col lg:flex-row gap-6">
        <div className="flex-grow">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">
                Question {currentQuestionIndex + 1} of {mcqQuestions.length}
              </h2>
              <p className="text-gray-800 text-lg">{currentQuestion?.questionText}</p>
            </div>
            
            <div className="space-y-3">
              {currentQuestion?.options?.map((option) => (
                <div
                  key={option.id}
                  className={`mcq-option p-3 border rounded-md flex items-center cursor-pointer hover:bg-gray-50 transition-colors ${
                    currentAnswer?.selectedOptionId === option.id 
                      ? 'border-test-teal bg-test-teal/10' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                    currentAnswer?.selectedOptionId === option.id 
                      ? 'border-test-teal' 
                      : 'border-gray-400'
                  }`}>
                    {currentAnswer?.selectedOptionId === option.id && (
                      <div className="w-3 h-3 rounded-full bg-test-teal"></div>
                    )}
                  </div>
                  <span>{option.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex items-center gap-1 border-test-orange text-test-orange hover:bg-test-orange/10"
              >
                <SkipForward className="h-4 w-4" /> Skip
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSave}
                className="flex items-center gap-1 border-test-teal text-test-teal hover:bg-test-teal/10"
                disabled={!currentAnswer?.selectedOptionId}
              >
                <Save className="h-4 w-4" /> Save
              </Button>
              
              <Button
                variant="outline"
                onClick={handleReview}
                className="flex items-center gap-1 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
              >
                <Flag className="h-4 w-4" /> Review
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
              disabled={currentQuestionIndex === mcqQuestions.length - 1}
              className="flex items-center gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="w-full lg:w-64 bg-white rounded-lg shadow-md p-4 flex flex-col">
          <h3 className="font-semibold text-gray-700 mb-3">Question Navigator</h3>
          
          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-test-teal rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{answeredCount} answered</span>
              <span>{mcqQuestions.length} total</span>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-4">
            {mcqQuestions.map((question, index) => {
              const answer = mcqAnswers.find(a => a.questionId === question.id);
              const statusClass = getStatusColor(answer?.status || 'unanswered');
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={question.id}
                  className={`question-nav-button w-8 h-8 flex items-center justify-center rounded-md text-sm ${statusClass} ${
                    isCurrent ? 'ring-2 ring-offset-1 ring-test-navy' : ''
                  }`}
                  onClick={() => navigateToQuestion(index)}
                  aria-label={`Go to question ${index + 1}`}
                  title={
                    answer?.status 
                      ? `Question ${index + 1} (${answer.status})` 
                      : `Question ${index + 1} (unanswered)`
                  }
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          
          <div className="mt-auto">
            <Button 
              className="w-full flex items-center gap-1 bg-test-navy hover:bg-test-navy/90"
              onClick={handleSubmit}
            >
              <Send className="h-4 w-4" /> Submit Test
            </Button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-3 bg-test-teal rounded-full"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-3 bg-test-orange rounded-full"></div>
              <span>Skipped</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Marked for review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQTest;