
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const SubmittedTest: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Submitted Successfully!</h1>
        
        <p className="text-gray-600 mb-8">
          Thank you for completing your test. Your responses have been recorded.
        </p>
        
        <Button 
          className="flex items-center gap-2 mx-auto"
          onClick={() => window.open('http://localhost:8081/tests')}
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default SubmittedTest;
