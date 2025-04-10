
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '@/contexts/TestContext';
import Timer from '@/components/Timer';
import CodeEditor from '@/components/CodeEditor';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Play, Send, Terminal, ChevronRight, ChevronLeft, Flag, Save, SkipForward } from 'lucide-react';
import { toast } from 'sonner';

const CodingTest: React.FC = () => {
  const navigate = useNavigate();
  const { 
    testType, 
    codingQuestions,
    codingAnswers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    currentCodingQuestion,
    currentCodingAnswer,
    setCodingAnswer,
    updateCodingQuestionStatus,
    submitTest,
    warningCount
  } = useTest();
  
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  
  // Redirect to home if not in coding test
  useEffect(() => {
    if (testType !== 'coding') {
      navigate('/');
    }
  }, [testType, navigate]);
  
  if (testType !== 'coding' || !currentCodingQuestion) {
    return null; // Don't render anything while redirecting
  }

  // Get difficulty color
  const getDifficultyColor = () => {
    switch(currentCodingQuestion.difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-green-500';
    }
  };

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < codingQuestions.length) {
      setSelectedTestCase(0); // Reset selected test case when changing questions
      setTestOutput(''); // Clear output
      setCurrentQuestionIndex(index);
    }
  };

  const handleSkip = () => {
    updateCodingQuestionStatus(currentCodingQuestion.id, 'skipped');
    navigateToQuestion(currentQuestionIndex + 1);
  };
  
  const handleSave = () => {
    updateCodingQuestionStatus(currentCodingQuestion.id, 'answered');
    toast.success('Code saved!');
  };
  
  const handleReview = () => {
    updateCodingQuestionStatus(currentCodingQuestion.id, 'reviewed');
    toast.info('Question marked for review.');
  };
  
  const handleRunCode = () => {
    setIsRunning(true);
    setTestOutput('Running code...');
    
    // Simple timeout to simulate code execution
    setTimeout(() => {
      try {
        // This is a very simplified evaluation
        let input = testInput;
        
        // If there's no custom input, use the selected test case
        if (!input && currentCodingQuestion.testCases[selectedTestCase]) {
          input = currentCodingQuestion.testCases[selectedTestCase].input;
        }
        
        // Create a function from the code
        // WARNING: This is unsafe in a production environment!
        // This is just a simplified example
        let evalFunc;
        let result;
        
        if (currentCodingQuestion.difficulty === 'easy') {
          const funcBody = currentCodingAnswer.replace(/function\s+add\s*\([^)]*\)\s*{/, '').replace(/}$/, '');
          evalFunc = new Function('a', 'b', funcBody + ' return add(a, b);');
          const [a, b] = input.split(',').map(Number);
          result = evalFunc(a, b);
        } else if (currentCodingQuestion.difficulty === 'medium') {
          const funcBody = currentCodingAnswer.replace(/function\s+findMissingNumber\s*\([^)]*\)\s*{/, '').replace(/}$/, '');
          evalFunc = new Function('nums', funcBody + ' return findMissingNumber(nums);');
          const nums = JSON.parse(input);
          result = evalFunc(nums);
        } else if (currentCodingQuestion.difficulty === 'hard') {
          const funcBody = currentCodingAnswer.replace(/function\s+lengthOfLongestSubstring\s*\([^)]*\)\s*{/, '').replace(/}$/, '');
          evalFunc = new Function('s', funcBody + ' return lengthOfLongestSubstring(s);');
          const s = JSON.parse(input);
          result = evalFunc(s);
        }
        
        setTestOutput(`Output: ${result}`);
        
        // Check against expected output
        if (currentCodingQuestion.testCases[selectedTestCase]) {
          const expected = currentCodingQuestion.testCases[selectedTestCase].expectedOutput;
          if (result.toString() === expected) {
            setTestOutput(prev => prev + '\n✅ Test passed!');
          } else {
            setTestOutput(prev => prev + `\n❌ Test failed! Expected: ${expected}`);
          }
        }
      } catch (error) {
        setTestOutput(`Error: ${(error as Error).message}`);
      } finally {
        setIsRunning(false);
      }
    }, 1000);
  };

  const handleCodeChange = (code: string) => {
    setCodingAnswer(currentCodingQuestion.id, code);
  };
  
  const handleSubmit = () => {
    const unansweredCount = codingAnswers.filter(a => 
      a.status === 'unanswered' || !a.code
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

  // Calculate progress
  const answeredCount = codingAnswers.filter(a => a.status === 'answered').length;
  const progress = (answeredCount / codingQuestions.length) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-test-teal text-white';
      case 'skipped': return 'bg-test-orange text-white';
      case 'reviewed': return 'bg-yellow-500 text-white';
      default: return 'bg-white';
    }
  };
  
  return (
    <div className="test-container">
      <header className="test-header">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Coding Test</h1>
          <span className={`text-sm font-medium ${getDifficultyColor()}`}>
            {currentCodingQuestion.difficulty.charAt(0).toUpperCase() + currentCodingQuestion.difficulty.slice(1)} Difficulty
          </span>
          
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-1">{currentCodingQuestion.title}</h2>
              <div className="text-sm text-gray-500 mb-4">Question {currentQuestionIndex + 1} of {codingQuestions.length}</div>
              <div className="prose prose-sm max-w-none">
                <p>{currentCodingQuestion.description}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2 text-gray-700">Code Editor</h3>
              <div className="h-[300px]">
                <CodeEditor 
                  initialValue={currentCodingAnswer} 
                  onChange={handleCodeChange} 
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                  <Terminal className="h-4 w-4 mr-1" />
                  Console Output
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center gap-1"
                >
                  <Play className="h-3 w-3" /> Run
                </Button>
              </div>
              <div className="bg-gray-900 text-gray-100 font-mono text-sm p-3 rounded-md overflow-auto whitespace-pre h-[120px]">
                {testOutput || 'Click "Run" to execute your code'}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between">
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
                disabled={currentQuestionIndex === codingQuestions.length - 1}
              >
                <SkipForward className="h-4 w-4" /> Skip
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSave}
                className="flex items-center gap-1 border-test-teal text-test-teal hover:bg-test-teal/10"
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
              disabled={currentQuestionIndex === codingQuestions.length - 1}
              className="flex items-center gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="w-full lg:w-64 bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Test Cases & Navigation</h3>
          
          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-test-teal rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{answeredCount} answered</span>
              <span>{codingQuestions.length} total</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            {codingQuestions.map((question, index) => {
              const answer = codingAnswers.find(a => a.questionId === question.id);
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
          
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2">Test Cases</h4>
            <div className="flex mb-2 overflow-x-auto bg-gray-100 rounded-md">
              {currentCodingQuestion.testCases.map((testCase, index) => (
                <button
                  key={index}
                  className={`px-3 py-2 text-xs whitespace-nowrap ${
                    selectedTestCase === index 
                      ? 'bg-test-teal text-white' 
                      : 'text-gray-700'
                  }`}
                  onClick={() => setSelectedTestCase(index)}
                >
                  Test {index + 1}
                </button>
              ))}
            </div>
            <div className="bg-gray-100 p-2 rounded-md">
              <div className="mb-2">
                <label className="block text-xs text-gray-600">Input</label>
                <div className="font-mono text-xs bg-white p-2 rounded border border-gray-300 overflow-x-auto">
                  {currentCodingQuestion.testCases[selectedTestCase].input}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600">Expected</label>
                <div className="font-mono text-xs bg-white p-2 rounded border border-gray-300 overflow-x-auto">
                  {currentCodingQuestion.testCases[selectedTestCase].expectedOutput}
                </div>
              </div>
            </div>
          </div>

          <Button 
            className="w-full flex items-center gap-1 bg-test-navy hover:bg-test-navy/90"
            onClick={handleSubmit}
          >
            <Send className="h-4 w-4" /> Submit Test
          </Button>

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

export default CodingTest;
