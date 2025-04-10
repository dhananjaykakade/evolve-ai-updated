import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

// Types
export type TestType = 'mcq' | 'coding';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface MCQOption {
  id: string;
  text: string;
}

export interface MCQQuestion {
  id: string;
  questionText: string;
  options: MCQOption[];
  correctOptionId?: string; // Only for evaluation
}

export interface CodingQuestion {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  description: string;
  starterCode: string;
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
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
  startTest: (type: TestType) => void;
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
}

const TestContext = createContext<TestContextType | undefined>(undefined);

// Sample data for MCQ questions
const sampleMCQQuestions: MCQQuestion[] = [
  {
    id: 'q1',
    questionText: 'What is the primary purpose of TypeScript?',
    options: [
      { id: 'q1_o1', text: 'To provide a runtime environment for JavaScript' },
      { id: 'q1_o2', text: 'To add static typing to JavaScript' },
      { id: 'q1_o3', text: 'To replace JavaScript completely' },
      { id: 'q1_o4', text: 'To optimize JavaScript execution speed' }
    ],
    correctOptionId: 'q1_o2'
  },
  {
    id: 'q2',
    questionText: 'Which of the following is NOT a React Hook?',
    options: [
      { id: 'q2_o1', text: 'useRef' },
      { id: 'q2_o2', text: 'useState' },
      { id: 'q2_o3', text: 'useHistory' },
      { id: 'q2_o4', text: 'useReactState' }
    ],
    correctOptionId: 'q2_o4'
  },
  {
    id: 'q3',
    questionText: 'What does the "useEffect" hook allow you to do in React?',
    options: [
      { id: 'q3_o1', text: 'Create CSS effects' },
      { id: 'q3_o2', text: 'Perform side effects in function components' },
      { id: 'q3_o3', text: 'Affect the rendering speed of components' },
      { id: 'q3_o4', text: 'Override React\'s default effect system' }
    ],
    correctOptionId: 'q3_o2'
  },
  {
    id: 'q4',
    questionText: 'Which method is NOT part of the component lifecycle in class-based React components?',
    options: [
      { id: 'q4_o1', text: 'componentDidMount' },
      { id: 'q4_o2', text: 'componentWillUpdate' },
      { id: 'q4_o3', text: 'componentDidCatch' },
      { id: 'q4_o4', text: 'componentWillRender' }
    ],
    correctOptionId: 'q4_o4'
  },
  {
    id: 'q5',
    questionText: 'What is a key benefit of using Vite over other build tools?',
    options: [
      { id: 'q5_o1', text: 'It was created by the React team' },
      { id: 'q5_o2', text: 'It has built-in support for multiple frameworks like React, Vue, etc.' },
      { id: 'q5_o3', text: 'Fast development server with hot module replacement' },
      { id: 'q5_o4', text: 'It natively supports PHP' }
    ],
    correctOptionId: 'q5_o3'
  }
];

// Sample data for coding questions
const sampleCodingQuestions: CodingQuestion[] = [
  {
    id: 'coding_easy',
    title: 'Sum of Two Numbers',
    difficulty: 'easy',
    description: 'Write a function that takes two numbers as parameters and returns their sum.',
    starterCode: 'function add(a, b) {\n  // Your code here\n}',
    testCases: [
      { input: '2, 3', expectedOutput: '5' },
      { input: '-1, 1', expectedOutput: '0' },
      { input: '0, 0', expectedOutput: '0' }
    ]
  },
  {
    id: 'coding_medium',
    title: 'Find Missing Number',
    difficulty: 'medium',
    description: 'Write a function that finds the missing number in an array of integers from 1 to n where one number is missing.',
    starterCode: 'function findMissingNumber(nums) {\n  // Your code here\n}',
    testCases: [
      { input: '[1, 2, 4, 5]', expectedOutput: '3' },
      { input: '[1, 3]', expectedOutput: '2' },
      { input: '[2, 3, 4, 5]', expectedOutput: '1' }
    ]
  },
  {
    id: 'coding_hard',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'hard',
    description: 'Write a function that finds the length of the longest substring without repeating characters.',
    starterCode: 'function lengthOfLongestSubstring(s) {\n  // Your code here\n}',
    testCases: [
      { input: '"abcabcbb"', expectedOutput: '3' },
      { input: '"bbbbb"', expectedOutput: '1' },
      { input: '"pwwkew"', expectedOutput: '3' }
    ]
  }
];

// Test duration in seconds (30 minutes)
const TEST_DURATION = 30 * 60;

// Provider component
export const TestProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [testType, setTestType] = useState<TestType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<MCQAnswer[]>([]);
  const [codingAnswers, setCodingAnswers] = useState<CodingAnswer[]>([]);
  const [warningCount, setWarningCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Check if we're on a test page
  const isTestPage = location.pathname.startsWith('/test/');
  
  // Initialize MCQ answers
  useEffect(() => {
    if (testType === 'mcq' && mcqAnswers.length === 0) {
      setMcqAnswers(
        sampleMCQQuestions.map(q => ({
          questionId: q.id,
          selectedOptionId: null,
          status: 'unanswered'
        }))
      );
    }
  }, [testType, mcqAnswers.length]);

  // Initialize Coding answers
  useEffect(() => {
    if (testType === 'coding' && codingAnswers.length === 0) {
      setCodingAnswers(
        sampleCodingQuestions.map(q => ({
          questionId: q.id,
          code: q.starterCode,
          status: 'unanswered'
        }))
      );
    }
  }, [testType, codingAnswers.length]);
  
  // Test timer
  useEffect(() => {
    if (!testType) return;
    
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
  }, [testType]);
  
  // Detect tab switching - only on test pages
  useEffect(() => {
    if (!testType || !isTestPage) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        addWarning();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [testType, isTestPage]);
  
  // Detect right-click and keyboard shortcuts - only on test pages
  useEffect(() => {
    if (!testType || !isTestPage) return;
    
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addWarning();
      return false;
    };
    
    const handleKeydown = (e: KeyboardEvent) => {
      // Detect common dev tools shortcuts
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.key === 'F12')
      ) {
        e.preventDefault();
        addWarning();
      }
      
      // Detect copy/paste
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v')) {
        if (testType === 'mcq') {
          e.preventDefault();
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
  }, [testType, isTestPage]);
  
  // Prevent closing/reloading - only on test pages
  useEffect(() => {
    if (!testType || !isTestPage) return;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [testType, isTestPage]);
  
  // Functions
  const startTest = (type: TestType) => {
    setTestType(type);
    setTimeLeft(TEST_DURATION);
    setWarningCount(0);
    setCurrentQuestionIndex(0);
    
    requestFullscreen();
    
    if (type === 'mcq') {
      navigate('/test/mcq');
      
      // Initialize MCQ answers
      setMcqAnswers(
        sampleMCQQuestions.map(q => ({
          questionId: q.id,
          selectedOptionId: null,
          status: 'unanswered'
        }))
      );
    } else {
      navigate('/test/coding');
      
      // Initialize Coding answers
      setCodingAnswers(
        sampleCodingQuestions.map(q => ({
          questionId: q.id,
          code: q.starterCode,
          status: 'unanswered'
        }))
      );
    }
    
    toast.info("Test started. Do not exit fullscreen or switch tabs!");
  };
  
  const endTest = () => {
    setTestType(null);
    exitFullscreen();
    navigate('/');
  };
  
  const submitTest = () => {
    exitFullscreen();
    navigate('/submitted');
  };
  
  const setMCQAnswer = (questionId: string, optionId: string | null) => {
    setMcqAnswers(prev => 
      prev.map(a => 
        a.questionId === questionId 
          ? { ...a, selectedOptionId: optionId, status: optionId ? 'answered' : 'unanswered' } 
          : a
      )
    );
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

  const setCodingAnswer = (questionId: string, code: string) => {
    setCodingAnswers(prev => 
      prev.map(a => 
        a.questionId === questionId 
          ? { ...a, code, status: 'answered' } 
          : a
      )
    );
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
    // Only add warnings on test pages
    if (!isTestPage) return;
    
    setWarningCount(prev => {
      const newCount = prev + 1;
      
      if (newCount === 3) {
        toast.error("You've received 3 warnings. Test is being terminated.");
        setTimeout(() => {
          navigate('/');
          setTestType(null);
          exitFullscreen();
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
  
  // Check fullscreen changes - only enforce on test pages
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
  const currentCodingQuestion = testType === 'coding' && currentQuestionIndex < sampleCodingQuestions.length
    ? sampleCodingQuestions[currentQuestionIndex]
    : null;
  
  const currentAnswer = currentCodingQuestion && codingAnswers.length > 0
    ? codingAnswers.find(a => a.questionId === currentCodingQuestion.id)?.code || currentCodingQuestion.starterCode
    : '';
  
  const value = {
    testType,
    startTest,
    endTest,
    submitTest,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    mcqQuestions: sampleMCQQuestions,
    codingQuestions: sampleCodingQuestions,
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
    exitFullscreen
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
