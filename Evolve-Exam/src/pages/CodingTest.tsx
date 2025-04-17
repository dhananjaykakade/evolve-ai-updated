import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTest } from '@/contexts/TestContext';
import Timer from '@/components/Timer';
import CodeEditor from '@/components/CodeEditor';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, Play, Send, Terminal, ChevronRight, ChevronLeft, 
  Flag, Save, SkipForward, RefreshCw, 
  ChevronDown, ChevronUp, SplitSquareVertical, Code2, FileText, 
  CheckCircle, XCircle, Info
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

// Supported languages
const LANGUAGES = [
  { id: 62, name: 'Java (OpenJDK 13.0.1)', extension: 'java' },
  { id: 63, name: 'JavaScript (Node.js 12.14.0)', extension: 'js' },
  { id: 71, name: 'Python (3.8.1)', extension: 'py' },
  { id: 54, name: 'C++ (GCC 9.2.0)', extension: 'cpp' },
  { id: 51, name: 'C# (Mono 6.6.0.161)', extension: 'cs' }
];

// Create a dedicated API service for Judge0 calls
const codeExecutionService = {
  executeCode: async (code: string, languageId: string, input: string, expectedOutput: string) => {
    try {
      // Make request to your backend instead of directly to Judge0
      const response = await axios.post('http://localhost:9001/student/tests/execute', {
        code,
        language: languageId,
        testCases: [{ input, expectedOutput }]
      });
      
      return response.data;
    } catch (error) {
      console.error('Code execution failed:', error);
      throw error;
    }
  },
  
  runAllTestCases: async (code: string, languageId: number, testCases: { input: string, expectedOutput: string }[]) => {
    try {
      const response = await axios.post('http://localhost:9001/student/tests/execute', {
        code,
        language: languageId,
        testCases: testCases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput }))
      });
      
      return response.data;
    } catch (error) {
      console.error('Test case execution failed:', error);
      throw error;
    }
  }
};

const CodingTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
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
    warningCount,
    isLoading,
    error,
    startTest
  } = useTest();
  
  // UI state
  const [testInput, setTestInput] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[1]); // Default to Python
  const [viewMode, setViewMode] = useState('split'); // 'description', 'code', or 'split'
  const [executionResult, setExecutionResult] = useState(null);
  const [executionError, setExecutionError] = useState(null);
  const [allTestResults, setAllTestResults] = useState([]);
  const [showConsole, setShowConsole] = useState(true);
  const [showTestResults, setShowTestResults] = useState(false);
  
  // Initialize test
  useEffect(() => {
    if (testId && !isInitialized) {
      startTest('coding', testId);
      setIsInitialized(true);
    }
  }, [testId, startTest, isInitialized]);
  
  // Handle loading and error states
  useEffect(() => {
    if (!isLoading) {
      if (error) {
        toast.error('Failed to load questions');
        navigate('/error');
      } else if (codingQuestions.length === 0) {
        const timer = setTimeout(() => {
          toast.error('Questions taking too long to load');
          navigate('/error');
        }, 10000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, error, codingQuestions, navigate]);
  
  // Redirect to home if not in coding test
  useEffect(() => {
    if (!isLoading && testType !== 'coding' && isInitialized) {
      navigate('/');
    }
  }, [testType, navigate, isLoading, isInitialized]);
  
  // Show loading state
  if (isLoading || codingQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-test-teal mx-auto mb-4"></div>
          <p className="text-gray-700">Loading test questions...</p>
        </div>
      </div>
    );
  }

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

  const navigateToQuestion = (index) => {
    if (index >= 0 && index < codingQuestions.length) {
      setSelectedTestCase(0); // Reset selected test case when changing questions
      setTestOutput(''); // Clear output
      setExecutionResult(null); // Clear execution result
      setExecutionError(null); // Clear execution error
      setAllTestResults([]); // Clear all test results
      setShowTestResults(false); // Hide test results
      setCurrentQuestionIndex(index);
    }
  };

  const handleSkip = () => {
    if (!currentCodingQuestion) return;
    updateCodingQuestionStatus(currentCodingQuestion.id, 'skipped');
    
    if (currentQuestionIndex < codingQuestions.length - 1) {
      navigateToQuestion(currentQuestionIndex + 1);
    } else {
      toast.info("You've reached the last question!");
    }
  };
  
  const handleSave = () => {
    if (!currentCodingQuestion) return;
    updateCodingQuestionStatus(currentCodingQuestion.id, 'answered');
    toast.success('Code saved!');
  };
  
  const handleReview = () => {
    if (!currentCodingQuestion) return;
    updateCodingQuestionStatus(currentCodingQuestion.id, 'reviewed');
    toast.info('Question marked for review.');
  };
  
  const handleRunCode = async () => {
    if (!currentCodingAnswer || !currentCodingQuestion) return;
    
    setIsRunning(true);
    setTestOutput('Compiling and executing code...');
    setExecutionResult(null);
    setExecutionError(null);
    setShowTestResults(false);
    
    try {
      // Prepare input data
      const input = showCustomInput ? customInput : currentCodingQuestion.testCases[selectedTestCase].input;
      const expectedOutput = currentCodingQuestion.testCases[selectedTestCase].expectedOutput;
      
      // Execute code
      const response = await codeExecutionService.executeCode(
        currentCodingAnswer,
        currentCodingQuestion.language,
        input,
        expectedOutput
      );
      
      // Process results
      if (response && response.data && response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        setExecutionResult(result);
        
        // Format output
        let outputText = result.output || 'No output generated.';
        
        // If there's an error, display it
        if (result.error) {
          outputText = `Error: ${result.error}`;
        } 
        // Otherwise check against expected if not using custom input
        else if (!showCustomInput) {
          if (result.passed) {
            outputText += '\n\n✅ Test passed!';
          } else {
            outputText += `\n\n❌ Test failed!\nExpected: ${expectedOutput}\nGot: ${result.output}`;
          }
        }
        
        setTestOutput(outputText);
      } else {
        throw new Error('Invalid response format from execution service');
      }
    } catch (error) {
      console.error('Code execution error:', error);
      setExecutionError(error);
      setTestOutput(`Error executing code: ${error.message || 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!currentCodingAnswer || !currentCodingQuestion) return;
    
    setIsRunning(true);
    setTestOutput('Validating your solution against all test cases...');
    setShowTestResults(true);
    
    try {
      // Run against all test cases at once
      const response = await codeExecutionService.runAllTestCases(
        currentCodingAnswer,
        selectedLanguage.id,
        currentCodingQuestion.testCases
      );
      
      if (response && response.data) {
        const { results, summary } = response.data;
        setAllTestResults(results);
        
        // Analyze results
        if (summary.failed === 0) {
          setTestOutput('✅ All test cases passed! Solution is correct.');
          updateCodingQuestionStatus(currentCodingQuestion.id, 'answered');
          toast.success('Solution submitted successfully!');
        } else {
          setTestOutput(`❌ ${summary.failed} of ${summary.total} test cases failed. Please check the results.`);
          toast.error(`${summary.failed} test cases failed. Please fix your solution.`);
        }
      } else {
        throw new Error('Invalid response format from execution service');
      }
    } catch (error) {
      console.error('Code submission error:', error);
      setExecutionError(error);
      setTestOutput(`Error submitting code: ${error.message || 'Unknown error'}`);
      toast.error('Failed to submit solution');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCodeChange = (code) => {
    setCodingAnswer(currentCodingQuestion.id, code);
  };
  
  const handleSubmitTest = () => {
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
  const progress = codingQuestions.length > 0 
    ? (answeredCount / codingQuestions.length) * 100 
    : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered': return 'bg-test-teal text-white';
      case 'skipped': return 'bg-test-orange text-white';
      case 'reviewed': return 'bg-yellow-500 text-white';
      default: return 'bg-white';
    }
  };

  const getStatusBadge = (item) => {
    const status = codingAnswers.find(a => a.questionId === item.id)?.status || 'unanswered';
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
        {status === 'answered' && <CheckCircle className="h-3 w-3 mr-1" />}
        {status === 'skipped' && <SkipForward className="h-3 w-3 mr-1" />}
        {status === 'reviewed' && <Flag className="h-3 w-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  const toggleConsole = () => {
    setShowConsole(!showConsole);
  };
  
  return (
    <div className="test-container flex flex-col h-screen bg-gray-50">
      <header className="test-header py-2 px-4 bg-white shadow-sm border-b border-gray-200 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Coding Test</h1>
            <span className={`text-sm font-medium ${getDifficultyColor()} bg-opacity-10 px-2 py-1 rounded-full`}>
              {currentCodingQuestion.difficulty.charAt(0).toUpperCase() + currentCodingQuestion.difficulty.slice(1)}
            </span>
            
            {warningCount > 0 && (
              <div className="flex items-center text-test-orange">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span className="text-sm">Warnings: {warningCount}/3</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button 
                className={`p-1 rounded ${viewMode === 'description' ? 'bg-gray-200' : ''}`}
                onClick={() => setViewMode('description')}
                title="Show description only"
              >
                <FileText className="h-4 w-4" />
              </button>
              <button 
                className={`p-1 rounded ${viewMode === 'split' ? 'bg-gray-200' : ''}`}
                onClick={() => setViewMode('split')}
                title="Split view"
              >
                <SplitSquareVertical className="h-4 w-4" />
              </button>
              <button 
                className={`p-1 rounded ${viewMode === 'code' ? 'bg-gray-200' : ''}`}
                onClick={() => setViewMode('code')}
                title="Show code only"
              >
                <Code2 className="h-4 w-4" />
              </button>
            </div>
            
            <select 
              className="text-sm border rounded p-1"
              value={selectedLanguage.id}
              onChange={(e) => setSelectedLanguage(LANGUAGES.find(lang => lang.id === parseInt(e.target.value)) || LANGUAGES[0])}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
            
            <Timer />
          </div>
        </div>
      </header>
      
      <div className="flex-grow overflow-hidden">
        <div className="h-full flex">
          {/* Left panel - Problem description */}
          {(viewMode === 'description' || viewMode === 'split') && (
            <div className={`bg-white overflow-y-auto ${viewMode === 'split' ? 'w-1/2 border-r' : 'w-full'}`}>
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold">{currentCodingQuestion.title}</h2>
                    {getStatusBadge(currentCodingQuestion)}
                  </div>
                  <div className="text-sm text-gray-500 mb-4 flex items-center">
                    <span>Question {currentQuestionIndex + 1} of {codingQuestions.length}</span>
                    <span className="mx-2">•</span>
                    <div className="flex gap-2 items-center">
                      <span>Progress:</span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-test-teal rounded-full" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{answeredCount}/{codingQuestions.length}</span>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none mb-6">
                    <p className="whitespace-pre-line">{currentCodingQuestion.description}</p>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Examples</h3>
                    {currentCodingQuestion.testCases.map((testCase, idx) => (
                      <div 
                        key={idx} 
                        className={`mb-4 p-3 rounded-md border ${
                          allTestResults[idx]?.passed === false 
                            ? 'bg-red-50 border-red-200' 
                            : allTestResults[idx]?.passed 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Test Case {idx + 1}</span>
                          {allTestResults[idx] && (
                            allTestResults[idx].passed 
                              ? <span className="text-green-600 flex items-center text-xs"><CheckCircle className="h-3 w-3 mr-1" /> Passed</span>
                              : <span className="text-red-600 flex items-center text-xs"><XCircle className="h-3 w-3 mr-1" /> Failed</span>
                          )}
                        </div>
                        <div className="mb-2">
                          <span className="font-medium">Input:</span> 
                          <pre className="mt-1 bg-gray-100 p-2 rounded text-sm">{testCase.input}</pre>
                        </div>
                        <div>
                          <span className="font-medium">Expected Output:</span>
                          <pre className="mt-1 bg-gray-100 p-2 rounded text-sm">{testCase.expectedOutput}</pre>
                        </div>
                        {allTestResults[idx] && allTestResults[idx].output && (
                          <div className="mt-2">
                            <span className="font-medium">Your Output:</span>
                            <pre className={`mt-1 p-2 rounded text-sm ${
                              allTestResults[idx].passed ? 'bg-green-100' : 'bg-red-100'
                            }`}>{allTestResults[idx].output}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Constraints</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {/* These would normally come from your API */}
                      <li>Time complexity: O(n)</li>
                      <li>Space complexity: O(1)</li>
                      <li>1 ≤ input size ≤ 10^5</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Right panel - Code editor */}
          {(viewMode === 'code' || viewMode === 'split') && (
            <div className={`flex flex-col ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
              <div className={`flex-grow ${showConsole ? '' : 'h-full'}`}>
                <CodeEditor 
                  initialValue={currentCodingAnswer} 
                  onChange={handleCodeChange}
                  language={selectedLanguage.extension}
                />
              </div>
              
              {showConsole && (
                <div className="h-1/3 flex flex-col bg-gray-50 border-t border-gray-300">
                  <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b border-gray-300">
                    <div className="flex items-center">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                        <Terminal className="h-4 w-4 mr-1" />
                        Console
                      </h3>
                      
                      {executionResult && (
                        executionResult.passed !== undefined ? (
                          executionResult.passed 
                            ? <span className="ml-2 text-xs font-medium text-green-500 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" /> Passed
                              </span>
                            : <span className="ml-2 text-xs font-medium text-red-500 flex items-center">
                                <XCircle className="h-3 w-3 mr-1" /> Failed
                              </span>
                        ) : null
                      )}
                      
                      {executionError && (
                        <span className="ml-2 text-xs font-medium text-red-500 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Error
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        className="text-xs text-gray-500 hover:text-gray-700"
                        onClick={toggleConsole}
                        title="Minimize console"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      
                      <div>
                        <button 
                          className="text-xs text-blue-600 hover:underline flex items-center"
                          onClick={() => setShowCustomInput(!showCustomInput)}
                        >
                          {showCustomInput ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                          {showCustomInput ? "Hide custom input" : "Custom input"}
                        </button>
                      </div>
                      
                      <select 
                        className="text-xs border rounded p-1"
                        value={selectedTestCase}
                        onChange={(e) => setSelectedTestCase(parseInt(e.target.value))}
                        disabled={showCustomInput}
                      >
                        {currentCodingQuestion.testCases.map((_, idx) => (
                          <option key={idx} value={idx}>Test Case {idx + 1}</option>
                        ))}
                      </select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRunCode}
                        disabled={isRunning}
                        className="flex items-center gap-1 text-xs border-blue-500 text-blue-500 hover:bg-blue-500/10"
                      >
                        {isRunning ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                        Run
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={handleSubmitCode}
                        disabled={isRunning}
                        className="flex items-center gap-1 text-xs bg-test-teal hover:bg-test-teal/90"
                      >
                        {isRunning ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                        Submit
                      </Button>
                    </div>
                  </div>
                  
                  {showCustomInput && (
                    <div className="p-2 border-b border-gray-300 bg-white">
                      <textarea
                        className="w-full text-sm font-mono p-2 border border-gray-300 rounded resize-none h-20"
                        placeholder="Enter your custom input here..."
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                      ></textarea>
                    </div>
                  )}
                  
                  <div className="flex-grow overflow-y-auto">
                    <div className="p-4">
                      {showTestResults && allTestResults.length > 0 ? (
                        <div>
                          <div className="mb-3 flex items-center">
                            <h4 className="font-medium">Test Results Summary:</h4>
                            <span className="ml-2 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                              {allTestResults.filter(r => r.passed).length} passed
                            </span>
                            {allTestResults.some(r => !r.passed) && (
                              <span className="ml-2 px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                                {allTestResults.filter(r => !r.passed).length} failed
                              </span>
                            )}
                          </div>
                          <pre className="font-mono text-sm whitespace-pre-wrap">{testOutput}</pre>
                        </div>
                      ) : (
                        <pre className="font-mono text-sm whitespace-pre-wrap">
                          {testOutput || (
                            <div className="text-gray-500 flex items-center">
                              <Info className="h-4 w-4 mr-2" />
                              Click "Run" to execute your code or "Submit" to test against all test cases
                            </div>
                          )}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {!showConsole && (
                <div 
                  className="bg-gray-100 p-1 cursor-pointer text-center border-t border-gray-300"
                  onClick={toggleConsole}
                >
                  <ChevronUp className="h-4 w-4 mx-auto" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <footer className="bg-white border-t border-gray-200 p-3 shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {codingQuestions.map((_, idx) => {
                const questionStatus = codingAnswers.find(a => a.questionId === codingQuestions[idx].id)?.status || 'unanswered';
                return (
                  <button
                    key={idx}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm 
                      ${idx === currentQuestionIndex ? 'ring-2 ring-test-navy' : ''}
                      ${questionStatus === 'answered' ? 'bg-test-teal text-white' : 
                        questionStatus === 'skipped' ? 'bg-test-orange text-white' : 
                        questionStatus === 'reviewed' ? 'bg-yellow-500 text-white' : 
                        'bg-gray-200 text-gray-700'}`
                    }
                    onClick={() => navigateToQuestion(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            
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
                onClick={handleReview}
                className="flex items-center gap-1 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
              >
                <Flag className="h-4 w-4" /> Review Later
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSave}
                className="flex items-center gap-1 border-test-teal text-test-teal hover:bg-test-teal/10"
              >
                <Save className="h-4 w-4" /> Save
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
              disabled={currentQuestionIndex === codingQuestions.length - 1}
              className="flex items-center gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              className="flex items-center gap-1 bg-test-navy hover:bg-test-navy/90"
              onClick={handleSubmitTest}
            >
              <Send className="h-4 w-4" /> Submit Test
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CodingTest;