
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '@/contexts/TestContext';
import Timer from '@/components/Timer';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronRight, ChevronLeft, Flag, Save, SkipForward, Send } from 'lucide-react';
import { toast } from 'sonner';

const MCQTest: React.FC = () => {
  const navigate = useNavigate();
  const { 
    testType, 
    mcqQuestions, 
    mcqAnswers, 
    currentQuestionIndex, 
    setCurrentQuestionIndex,
    setMCQAnswer,
    updateQuestionStatus,
    submitTest,
    warningCount
  } = useTest();
  
  // Redirect to home if not in MCQ test
  useEffect(() => {
    if (testType !== 'mcq') {
      navigate('/');
    }
  }, [testType, navigate]);
  
  if (testType !== 'mcq') {
    return null; // Don't render anything while redirecting
  }
  
  const currentQuestion = mcqQuestions[currentQuestionIndex];
  const currentAnswer = mcqAnswers.find(a => a.questionId === currentQuestion.id);
  
  const handleOptionSelect = (optionId: string) => {
    setMCQAnswer(currentQuestion.id, optionId);
  };
  
  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < mcqQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  };
  
  const handleSkip = () => {
    updateQuestionStatus(currentQuestion.id, 'skipped');
    navigateToQuestion(currentQuestionIndex + 1);
  };
  
  const handleSave = () => {
    if (currentAnswer?.selectedOptionId) {
      updateQuestionStatus(currentQuestion.id, 'answered');
      toast.success('Answer saved!');
    } else {
      toast.error('Please select an answer before saving.');
    }
  };
  
  const handleReview = () => {
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
  const progress = (answeredCount / mcqQuestions.length) * 100;
  
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
              <p className="text-gray-800 text-lg">{currentQuestion.questionText}</p>
            </div>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className={`mcq-option ${currentAnswer?.selectedOptionId === option.id ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center mr-3">
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
        
        <div className="w-full lg:w-64 bg-white rounded-lg shadow-md p-4">
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
          
          <div className="grid grid-cols-5 gap-2">
            {mcqQuestions.map((question, index) => {
              const answer = mcqAnswers.find(a => a.questionId === question.id);
              const statusClass = getStatusColor(answer?.status || 'unanswered');
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={question.id}
                  className={`question-nav-button ${statusClass} ${isCurrent ? 'current' : ''}`}
                  onClick={() => navigateToQuestion(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          
          <div className="mt-6">
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
