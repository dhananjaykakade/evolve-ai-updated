import { createContext, useContext, ReactNode, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios'; 
import { connectWebSocket, sendLog, disconnectWebSocket } from '@/util/websocket';

// Types (same as before)
export type TestType = 'mcq' | 'coding';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface User{
  id: string;
  name: string;
  email: string;
}

export interface MCQOption {
  id: string;
  text: string;
}

export interface MCQQuestion {
  id: string;
  questionText: string;
  options: MCQOption[];
  correctOptionId?: string;
}

export interface CodingQuestion {
  _id: string;
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  description: string;
  starterCode: string;
  testCases: {
    input: string;
    expectedOutput: string;
    _id: string;
  }[];
  marks: number;
  language: string;
}

type QuestionStatus = 'unanswered' | 'answered' | 'skipped' | 'reviewed';

interface MCQAnswer {
  questionId: string;
  selectedOptionId: string | null;
  status: QuestionStatus;
}

interface CodingAnswer {
  questionId: string;
  code: string;
  status: QuestionStatus;
}

interface TestContextType {
  testType: TestType | null;
  testDetails: any | null;
  isLoading: boolean;
  error: string | null;
  startTest: (type: TestType, testId: string) => void;
  endTest: () => void;
  submitTest: () => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  mcqQuestions: MCQQuestion[];
  codingQuestions: CodingQuestion[];
  mcqAnswers: MCQAnswer[];
  setMCQAnswer: (questionId: string, optionId: string | null) => void;
  updateQuestionStatus: (questionId: string, status: QuestionStatus) => void;
  codingAnswers: CodingAnswer[];
  setCodingAnswer: (questionId: string, code: string) => void;
  updateCodingQuestionStatus: (questionId: string, status: QuestionStatus) => void;
  currentCodingAnswer: string;
  currentCodingQuestion: CodingQuestion | null;
  warningCount: number;
  addWarning: () => void;
  timeLeft: number;
  isFullscreen: boolean;
  requestFullscreen: () => void;
  exitFullscreen: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
  isSocketConnected: boolean;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

// Test duration in seconds (30 minutes)
const TEST_DURATION = 30 * 60;

// Provider component
export const TestProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [testType, setTestType] = useState<TestType | null>(null);
  const [testDetails, setTestDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
  const [codingQuestions, setCodingQuestions] = useState<CodingQuestion[]>([]);
  const [mcqAnswers, setMcqAnswers] = useState<MCQAnswer[]>([]);
  const [codingAnswers, setCodingAnswers] = useState<CodingAnswer[]>([]);
  const [warningCount, setWarningCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  
  // Create a ref to track active test ID
  const activeTestIdRef = useRef<string | null>(null);
  
  // Check if we're on a test page
  const isTestPage = location.pathname.startsWith('/test/') && 
                    !location.pathname.includes('/test/invalid') &&
                    testType !== null;
  
  // Handle user persistence
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  }, []);

  const setUserWithStorage = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  };
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Ensure WebSocket disconnection when component unmounts
      if (isSocketConnected) {
        disconnectWebSocket();
        setIsSocketConnected(false);
      }
    };
  }, [isSocketConnected]);
  
  // Fetch test questions from backend
  const fetchTestQuestions = async (testId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`http://localhost:9001/student/tests/${testId}`);
      
      if (response.data.success) {
        console.log(response.data.data);
        setTestDetails(response.data.data);
        
        // Process questions based on test type
        if (response.data.data.type === 'CODING') {
          // Handle coding questions
          const processedCodingQuestions = response.data.data.questions.map((q: any) => ({
            ...q,
            id: q._id,
            difficulty: q.difficulty.toLowerCase() as DifficultyLevel
          }));
          
          setCodingQuestions(processedCodingQuestions);
          setCodingAnswers(
            processedCodingQuestions.map((q: any) => ({
              questionId: q._id,
              code: q.starterCode,
              status: 'unanswered'
            }))
          );
        } else if (response.data.data.type === 'MCQ') {
          
          // Handle MCQ questions
          const processedMCQQuestions = response.data.data.questions.map((q: any) => ({
            id: q._id,
            questionText: q.questionText,
            options: q.options.map((opt: any, index: number) => ({
              id: opt.id, // Unique ID for each option
              text: opt.text || opt.option
            })),
            correctOptionId: q.correctOptionId
          }));
          
          setMcqQuestions(processedMCQQuestions);

          setMcqAnswers(
            processedMCQQuestions.map(q => ({
              questionId: q.id,
              selectedOptionId: null,
              status: 'unanswered'
            }))
          );
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch test questions');
      }
    } catch (err) {
      console.error('Error fetching test questions:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Failed to load test questions');
      navigate('/test/invalid');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize answers when questions change
  useEffect(() => {
    if (testType === 'mcq' && mcqQuestions.length > 0 && mcqAnswers.length === 0) {
      setMcqAnswers(
        mcqQuestions.map(q => ({
          questionId: q.id,
          selectedOptionId: null,
          status: 'unanswered'
        }))
      );
    }
  }, [testType, mcqQuestions, mcqAnswers]);

  // Test timer
  useEffect(() => {
    if (!isTestPage) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.warning("Time's up! Submitting your test...");
          setTimeout(() => submitTest(), 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isTestPage]);
  
  // Detect tab switching - only on test pages
  useEffect(() => {
    if (!isTestPage || !user || !testDetails) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendLog(`Tab switched or minimized by student ${user.name}`, user.id, user.name, testDetails._id);
        addWarning();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTestPage, user, testDetails]);
  
  // Detect right-click and keyboard shortcuts - only on test pages
  useEffect(() => {
    if (!isTestPage || !user || !testDetails) return;
    
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      sendLog(`Right-click detected for student ${user.name}`, user.id, user.name, testDetails._id);
      addWarning();
      return false;
    };
    
    const handleKeydown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.key === 'F12')
      ) {
        e.preventDefault();
        sendLog(`Developer tools shortcut detected for student ${user.name}`, user.id, user.name, testDetails._id);
        addWarning();
      }
      
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v')) {
        if (testType === 'mcq') {
          e.preventDefault();
          sendLog(`Copy/paste detected in MCQ test for student ${user.name}`, user.id, user.name, testDetails._id);
          addWarning();
        }
      }
    };
    
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeydown);
    
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [isTestPage, testType, user, testDetails]);
  
  // Prevent closing/reloading - only on test pages
  useEffect(() => {
    if (!isTestPage) return;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isTestPage]);
  
  // Functions
  const startTest = (type: TestType, testId: string) => {
    if (!user) {
      toast.error("Please login before starting the test");
      navigate('/login'); // Redirect to login page
      return;
    }
    
    setTestType(type);
    setTimeLeft(TEST_DURATION);
    setWarningCount(0);
    setCurrentQuestionIndex(0);
    
    // Save testId to ref for cleanup
    activeTestIdRef.current = testId;
    
    // Fetch questions from backend
    fetchTestQuestions(testId);
    
    requestFullscreen();
    navigate(`/test/${type}/${testId}`);
    toast.info("Test started. Do not exit fullscreen or switch tabs!");

    // Connect WebSocket
    try {
      connectWebSocket(user.id, user.name, testId);
      setIsSocketConnected(true);
      sendLog(`Test started for student ${user.name} (${user.id})`, user.id, user.name, testId);
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      toast.error("Warning: Could not connect monitoring system");
    }
  };
  
  const endTest = async () => {
    if (user && testDetails) {
      sendLog(`Test terminated for student ${user.name}`, user.id, user.name, testDetails._id);
      
      try {    await axios.post(`http://localhost:9001/student/tests/${testDetails._id}/submit`, {
        studentId: user.id,
        warningCount,
        isAutoSubmitted: true
      });
      toast.error("test terminated")
      } catch (error) {
        console.error("Failed to submit test:", error);
        toast.error("Failed to submit test");
      }

      // Disconnect WebSocket
      if (isSocketConnected) {
        disconnectWebSocket();
        setIsSocketConnected(false);
      }
    } else {
      console.error("Cannot end test: User or test details missing");
    }
    
    setTestType(null);
    setTestDetails(null);
    activeTestIdRef.current = null;
    exitFullscreen();
    navigate('/terminated');
  };
  
  const submitTest = async () => {
    // Submit answers here using axios if needed
try {    await axios.post(`http://localhost:9001/student/tests/${testDetails._id}/submit`, {
  studentId: user.id,
  warningCount,
  
});

toast.success("Test submitted successfully!");

if (user && testDetails) {
  sendLog(`Test submitted by student ${user.name}`, user.id, user.name, testDetails._id);
  
  // Disconnect WebSocket
  if (isSocketConnected) {
    disconnectWebSocket();
    setIsSocketConnected(false);
  }
} else {
  console.error("Cannot submit test: User or test details missing");
}
  
} catch (error) {
  console.error("Failed to submit test:", error);
  toast.error("Failed to submit test");
  
}
    
    exitFullscreen();
    setTestType(null);
    setTestDetails(null);
    activeTestIdRef.current = null;
    navigate('/submitted');
  };
  
  const setMCQAnswer = async (questionId: string, optionId: string | null) => {
    setMcqAnswers(prev => 
      prev.map(a => 
        a.questionId === questionId 
          ? { ...a, selectedOptionId: optionId, status: optionId ? 'answered' : 'unanswered' } 
          : a
      )
    );
  
    if (user && testDetails) {
      try {
        const response = await axios.post(`http://localhost:9001/student/tests/mcq/${testDetails._id}/save`, {
          studentId: user.id,
          questionId,
          selectedOptionId: optionId,
          status: optionId ? 'answered' : 'unanswered'
        });
        // show confirm message in toast from backend
        toast.success(response.data.message);
      } catch (error) {
        console.error("Failed to save answer to backend:", error);
        toast.error("Failed to sync answer");
      }
    }
  };
  
  const updateQuestionStatus = (questionId: string, status: QuestionStatus) => {
    setMcqAnswers(prev => 
      prev.map(a => 
        a.questionId === questionId 
          ? { ...a, status } 
          : a
      )
    );

    
  };

  

  const setCodingAnswer = async(questionId: string, code: string) => {
    setCodingAnswers(prev => 
      prev.map(a => 
        a.questionId === questionId 
          ? { ...a, code, status: 'answered' } 
          : a
      )
    );

    if (user && testDetails) {
      try {
        const response = await axios.post(`http://localhost:9001/student/tests/coding/${testDetails._id}/save`, {
          studentId: user.id,
          questionId,
         code,
  status: 'answered'
        });
        // show confirm message in toast from backend
        // toast.success(response.data.message);
      } catch (error) {
        console.error("Failed to save answer to backend:", error);
        toast.error("Failed to sync answer");
      }
    }
  };

  const updateCodingQuestionStatus = (questionId: string, status: QuestionStatus) => {
    setCodingAnswers(prev => 
      prev.map(a => 
        a.questionId === questionId 
          ? { ...a, status } 
          : a
      )
    );
  };
  
  const addWarning = () => {
    if (!isTestPage) return;
    
    setWarningCount(prev => {
      const newCount = prev + 1;
      
      if (newCount === 3) {
        toast.error("You've received 3 warnings. Test is being terminated.");
        setTimeout(() => {
          endTest();
        }, 3000);
      } else {
        toast.warning(`Warning ${newCount} of 3: Suspicious activity detected!`);
      }
      
      return newCount;
    });
  };
  
  const requestFullscreen = () => {
    const elem = document.documentElement;
    
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error('Error attempting to enable fullscreen:', err));
    } else {
      console.error('Fullscreen API not supported');
    }
  };
  
  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.error('Error attempting to exit fullscreen:', err));
    }
  };
  
  // Check fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (testType && !isCurrentlyFullscreen && isTestPage) {
        addWarning();
        requestFullscreen();
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [testType, isTestPage]);

  // Get current coding question and answer
  const currentCodingQuestion = testType === 'coding' && currentQuestionIndex < codingQuestions.length
    ? codingQuestions[currentQuestionIndex]
    : null;
  
  const currentAnswer = currentCodingQuestion && codingAnswers.length > 0
    ? codingAnswers.find(a => a.questionId === currentCodingQuestion._id)?.code || currentCodingQuestion.starterCode
    : '';
    
  
  const value = {
    testType,
    testDetails,
    isLoading,
    error,
    startTest,
    endTest,
    submitTest,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    mcqQuestions,
    codingQuestions,
    mcqAnswers,
    setMCQAnswer,
    updateQuestionStatus,
    codingAnswers,
    setCodingAnswer,
    updateCodingQuestionStatus,
    currentCodingAnswer: currentAnswer,
    currentCodingQuestion,
    warningCount,
    addWarning,
    timeLeft,
    isFullscreen,
    requestFullscreen,
    exitFullscreen,
    setUser: setUserWithStorage,
    user,
    isSocketConnected
  };
  
  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
};

// Custom hook to use the test context
export const useTest = () => {
  const context = useContext(TestContext);
  
  if (context === undefined) {
    throw new Error('useTest must be used within a TestProvider');
  }
  
  return context;
};