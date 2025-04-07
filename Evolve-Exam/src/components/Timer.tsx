
import React from 'react';
import { useTest } from '@/contexts/TestContext';
import { Clock } from 'lucide-react';

const Timer: React.FC = () => {
  const { timeLeft } = useTest();
  
  // Convert seconds to MM:SS format
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Determine color based on time remaining
  const getTimerColor = (): string => {
    if (timeLeft < 60) { // Less than 1 minute
      return 'text-test-red';
    } else if (timeLeft < 300) { // Less than 5 minutes
      return 'text-test-orange';
    } else {
      return 'text-white';
    }
  };
  
  return (
    <div className={`flex items-center gap-2 font-mono font-bold text-lg ${getTimerColor()}`}>
      <Clock className="h-5 w-5" />
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};

export default Timer;
