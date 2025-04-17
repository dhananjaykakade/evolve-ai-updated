
import React from 'react';
import { XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocation } from 'react-router-dom';

const TestError = () => {
  const location = useLocation();
  const errorMessage = location.state?.message || "Invalid test configuration or access denied";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="mb-6 flex justify-center">
          <XCircle className="h-20 w-20 text-destructive" />
        </div>
        
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="text-center text-lg">
            {errorMessage}
          </AlertDescription>
        </Alert>
        
        <p className="text-center text-gray-600">
          Please check your test link and try again. If the problem persists, contact your test administrator.
        </p>
      </div>
    </div>
  );
};

export default TestError;
