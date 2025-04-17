import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RealtimeLogs from './RealtimeLogs';

// Interface for Test data
interface Test {
  _id: string;
  title: string;
  type: string;
  startTime: string;
  duration: number;
}

// Example parent component showing how to use RealtimeLogs
const TestMonitoring: React.FC = () => {
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const baseUrl = 'http://localhost:9001';

  useEffect(() => {
    // Fetch available tests
    const fetchTests = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await axios.get<{success: boolean; data: Test[]}>(`${baseUrl}/teacher/tests`);
        if (response.data.success) {
          setTests(response.data.data);
          
          // Optionally auto-select the first test
          if (response.data.data.length > 0 && !selectedTestId) {
            setSelectedTestId(response.data.data[0]._id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch tests:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTests();
  }, [baseUrl, selectedTestId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Test Monitoring</h1>
      
      {/* Test selector */}
      <div className="mb-6">
        <label htmlFor="test-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select a test to monitor
        </label>
        <select
          id="test-select"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={selectedTestId || ''}
          onChange={(e) => setSelectedTestId(e.target.value)}
          disabled={isLoading}
        >
          {!selectedTestId && <option value="">Select a test</option>}
          {tests.map((test) => (
            <option key={test._id} value={test._id}>
              {test.title} ({test.type})
            </option>
          ))}
        </select>
      </div>
      
      {/* Render RealtimeLogs component when a test is selected */}
      {selectedTestId ? (
        <RealtimeLogs testId={selectedTestId} baseUrl={baseUrl} />
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Please select a test to view monitoring logs</p>
        </div>
      )}
    </div>
  );
};

export default TestMonitoring;