
import React from 'react';
import { useTest } from '@/contexts/TestContext';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const TestHeader = () => {
  const { timeRemaining, warningCount, endTest, testType, isTestActive } = useTest();

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleEndTest = () => {
    const confirmed = window.confirm('Are you sure you want to exit and terminate the test? This action cannot be undone.');
    if (confirmed) {
      toast.error('Test terminated by user');
      endTest();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-2">
        <Clock className="h-5 w-5 text-primary" />
        <span className={`font-mono font-semibold ${timeRemaining < 60 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          {formatTime(timeRemaining)}
        </span>
        <span className="text-sm text-muted-foreground">remaining</span>
      </div>
      
      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold">
          {testType === 'mcq' ? 'Multiple Choice Questions' : 'Coding Assessment'}
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <AlertTriangle className={`h-5 w-5 ${warningCount > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
          <span className={`ml-1 font-medium ${warningCount > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
            {warningCount}/3
          </span>
        </div>
        
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleEndTest}
          className="flex items-center gap-1"
        >
          <AlertCircle className="h-4 w-4" />
          <span>Exit</span>
        </Button>
      </div>
    </div>
  );
};

export default TestHeader;
