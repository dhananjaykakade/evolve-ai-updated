
import React from 'react';
import { XOctagon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TestTerminated = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="mb-6 flex justify-center">
          <XOctagon className="h-20 w-20 text-destructive" />
        </div>
        
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="text-center text-lg">
            Your test has been terminated due to suspicious activity.
          </AlertDescription>
        </Alert>
        
        <p className="text-center text-gray-600">
          Please contact your test administrator for further instructions.
        </p>
      </div>
    </div>
  );
};

export default TestTerminated;
