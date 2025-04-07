
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

interface TestContextType {
  isTestActive: boolean;
  warningCount: number;
  timeRemaining: number;
  startTest: (testType: 'mcq' | 'coding', minutes: number) => void;
  endTest: () => void;
  addWarning: () => void;
  resetTest: () => void;
  testType: 'mcq' | 'coding' | null;
  submitTest: () => void;
  openInNewWindow: (type: 'mcq' | 'coding') => void;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const useTest = (): TestContextType => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};

interface TestProviderProps {
  children: ReactNode;
}

export const TestProvider = ({ children }: TestProviderProps) => {
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [warningCount, setWarningCount] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [testType, setTestType] = useState<'mcq' | 'coding' | null>(null);
  const [isInternalAction, setIsInternalAction] = useState<boolean>(false);
  const navigate = useNavigate();

  // Check if we're in a new window test session
  useEffect(() => {
    const storedTestType = localStorage.getItem('testType');
    const storedTestTime = localStorage.getItem('testTime');
    
    if (storedTestType && storedTestTime && !isTestActive) {
      const testType = storedTestType as 'mcq' | 'coding';
      const minutes = parseInt(storedTestTime, 10) || 60;
      
      // Clear localStorage to prevent future auto-starts
      localStorage.removeItem('testType');
      localStorage.removeItem('testTime');
      
      // Start the test
      startTest(testType, minutes);
      
      // Try to enter fullscreen after a slight delay
      setTimeout(() => {
        tryEnterFullscreen();
      }, 1000);
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isTestActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isTestActive && timeRemaining === 0) {
      setIsInternalAction(true);
      toast.info("Time's up! Your test will be submitted automatically.");
      submitTest();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTestActive, timeRemaining]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (isTestActive && !document.fullscreenElement && !isInternalAction) {
        addWarning();
        toast.error("Warning: You exited fullscreen mode!");
        // Try to re-enter fullscreen
        setTimeout(() => tryEnterFullscreen(), 1000);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isTestActive && !isInternalAction) {
        e.preventDefault();
        e.returnValue = "You will receive a warning if you leave this page. Are you sure?";
        return e.returnValue;
      }
    };

    const handleVisibilityChange = () => {
      if (isTestActive && document.visibilityState === 'hidden' && !isInternalAction) {
        addWarning();
        toast.error("Warning: You navigated away from the test tab!");
      }
    };

    if (isTestActive) {
      // Add event listeners for test security
      window.addEventListener('blur', handleWindowBlur);
      document.addEventListener('contextmenu', handleContextMenu);
      window.addEventListener('keydown', handleFunctionKeys);
      window.addEventListener('copy', handleCopyPaste);
      window.addEventListener('paste', handleCopyPaste);
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }

    return () => {
      // Clean up event listeners
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleFunctionKeys);
      window.removeEventListener('copy', handleCopyPaste);
      window.removeEventListener('paste', handleCopyPaste);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isTestActive, isInternalAction]);

  const tryEnterFullscreen = useCallback(async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen && document.fullscreenElement === null) {
        setIsInternalAction(true);
        await docEl.requestFullscreen();
        setTimeout(() => setIsInternalAction(false), 500);
      }
    } catch (error) {
      console.error("Couldn't enter fullscreen mode:", error);
      setIsInternalAction(false);
      // Don't throw warning for failed fullscreen, as browsers may block it for security reasons
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        setIsInternalAction(true);
        await document.exitFullscreen();
        setTimeout(() => setIsInternalAction(false), 500);
      } catch (err) {
        console.error("Error exiting fullscreen:", err);
        setIsInternalAction(false);
      }
    }
  }, []);

  const handleWindowBlur = useCallback(() => {
    if (isTestActive && !isInternalAction) {
      addWarning();
      toast.error("Warning: You switched away from the test window!");
    }
  }, [isTestActive, isInternalAction]);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (isTestActive) {
      e.preventDefault();
      return false;
    }
  }, [isTestActive]);

  const handleFunctionKeys = useCallback((e: KeyboardEvent) => {
    if (isTestActive) {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault();
        if (!isInternalAction) {
          addWarning();
          toast.error("Warning: Developer tools shortcuts are disabled during the test!");
        }
      }
      
      // Handle Escape key to prevent exiting fullscreen
      if (e.key === 'Escape' && document.fullscreenElement) {
        e.preventDefault();
        if (!isInternalAction) {
          toast.error("Exiting fullscreen is not allowed during the test!");
        }
      }
    }
  }, [isTestActive, isInternalAction]);

  const handleCopyPaste = useCallback((e: Event) => {
    if (isTestActive && testType === 'mcq' && !isInternalAction) {
      e.preventDefault();
      addWarning();
      toast.error("Warning: Copy/paste is not allowed during the MCQ test!");
    }
  }, [isTestActive, testType, isInternalAction]);

  const startTest = useCallback((type: 'mcq' | 'coding', minutes: number) => {
    setTestType(type);
    setTimeRemaining(minutes * 60); // Convert minutes to seconds
    setWarningCount(0);
    setIsTestActive(true);
    
    // Navigate to the appropriate test page
    if (type === 'mcq') {
      navigate('/mcq-test');
    } else {
      navigate('/coding-test');
    }
  }, [navigate]);

  const openInNewWindow = useCallback((type: 'mcq' | 'coding') => {
    // Create URL with type parameter
    const testUrl = type === 'mcq' ? '/mcq-test' : '/coding-test';
    
    // Store test parameters in localStorage for the new window to pick up
    localStorage.setItem('testType', type);
    localStorage.setItem('testTime', '60'); // Default to 60 minutes
    
    // Open in a new window with specific features
    const windowFeatures = 'width=1200,height=800';
    const newWindow = window.open(window.location.origin + testUrl, '_blank', windowFeatures);
    
    if (newWindow) {
      newWindow.focus();
    } else {
      // If window.open returns null, it means popup was blocked
      toast.error('Please allow popups for this site to start the test.');
    }
  }, []);

  const endTest = useCallback(() => {
    setIsInternalAction(true);
    
    // First exit fullscreen if active
    if (document.fullscreenElement) {
      exitFullscreen().then(() => {
        setIsTestActive(false);
        setTestType(null);
        navigate('/test-submitted');
      }).catch(() => {
        // If exiting fullscreen fails, still reset the test
        setIsTestActive(false);
        setTestType(null);
        navigate('/test-submitted');
      });
    } else {
      setIsTestActive(false);
      setTestType(null);
      navigate('/test-submitted');
    }
    
    setTimeout(() => setIsInternalAction(false), 500);
  }, [navigate, exitFullscreen]);

  const addWarning = useCallback(() => {
    if (isInternalAction) return; // Don't add warnings during internal actions

    setWarningCount((prev) => {
      const newCount = prev + 1;
      
      if (newCount >= 3) {
        toast.error("Maximum warnings reached! Your test will be terminated.");
        
        // Use setTimeout to allow the toast to be shown before the confirmation dialog
        setTimeout(() => {
          // Show confirmation dialog
          alert("You have received 3 warnings. The test will now be terminated automatically.");
          submitTest();
        }, 1000);
      }
      
      return newCount;
    });
  }, [isInternalAction]);

  const resetTest = useCallback(() => {
    setIsTestActive(false);
    setWarningCount(0);
    setTimeRemaining(0);
    setTestType(null);
  }, []);

  const submitTest = useCallback(() => {
    setIsInternalAction(true);
    toast.success("Test submitted successfully!");
    endTest();
  }, [endTest]);

  const value = {
    isTestActive,
    warningCount,
    timeRemaining,
    startTest,
    endTest,
    addWarning,
    resetTest,
    testType,
    submitTest,
    openInNewWindow,
  };

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
};
