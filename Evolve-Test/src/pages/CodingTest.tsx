
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TestHeader from '@/components/TestHeader';
import { useTest } from '@/contexts/TestContext';
import TestSandbox from '@/components/TestSandbox';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeEditor from '@/components/CodeEditor';
import { toast } from 'sonner';

const CodingTest = () => {
  const navigate = useNavigate();
  const { isTestActive, startTest, submitTest } = useTest();
  const [testMode, setTestMode] = useState<'simple' | 'sandbox'>('simple');
  const [code, setCode] = useState(`// Write your solution here

function twoSum(nums, target) {
  // Your implementation here
}

// Example usage:
console.log(twoSum([2, 7, 11, 15], 9)); // Expected output: [0, 1]
`);
  
  useEffect(() => {
    const testType = localStorage.getItem('testType');
    const testTime = localStorage.getItem('testTime');
    
    if (testType === 'coding' && testTime && !isTestActive) {
      startTest('coding', parseInt(testTime));
      localStorage.removeItem('testType');
      localStorage.removeItem('testTime');
    } else if (!isTestActive) {
      navigate('/');
    }
  }, [isTestActive, navigate, startTest]);

  const handleSubmitTest = () => {
    const confirmSubmit = window.confirm(
      "Are you sure you want to submit your solution? You cannot make changes after submission."
    );
    
    if (confirmSubmit) {
      toast.success("Test submitted successfully!");
      submitTest();
    }
  };

  const codingProblem = {
    title: "Two Sum",
    description: `
      Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
      
      You may assume that each input would have exactly one solution, and you may not use the same element twice.
      
      You can return the answer in any order.
    `,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 6, we return [0, 1]."
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ]
  };

  return (
    <div className="min-h-screen pt-16 pb-6 bg-background">
      <TestHeader />
      
      <div className="container mx-auto px-4 md:px-0 mt-4 animate-fade-in">
        <Card className="mb-4 p-4">
          <h2 className="text-2xl font-bold">{codingProblem.title}</h2>
          <p className="mt-2 whitespace-pre-line">{codingProblem.description}</p>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium">Examples:</h3>
            <div className="space-y-2 mt-2">
              {codingProblem.examples.map((ex, index) => (
                <div key={index} className="bg-muted/30 p-3 rounded-md">
                  <p><strong>Input:</strong> {ex.input}</p>
                  <p><strong>Output:</strong> {ex.output}</p>
                  <p><strong>Explanation:</strong> {ex.explanation}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium">Constraints:</h3>
            <ul className="list-disc pl-5 mt-2">
              {codingProblem.constraints.map((constraint, index) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>
        </Card>
        
        <Tabs defaultValue="simple" className="mt-4">
          <TabsList>
            <TabsTrigger value="simple" onClick={() => setTestMode('simple')}>
              Simple Editor
            </TabsTrigger>
            <TabsTrigger value="sandbox" onClick={() => setTestMode('sandbox')}>
              Sandbox Environment
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="simple" className="mt-4">
            <Card className="h-[400px] overflow-hidden">
              <CodeEditor 
                value={code} 
                onChange={setCode} 
                language="javascript" 
              />
            </Card>
            
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSubmitTest}>
                Submit Solution
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="sandbox" className="mt-4">
            {testMode === 'sandbox' && (
              <TestSandbox 
                testType="fullstack"
                testTitle={codingProblem.title}
                testDescription={`${codingProblem.description}
                
Examples:
${codingProblem.examples.map(ex => `- Input: ${ex.input}\n  Output: ${ex.output}\n  Explanation: ${ex.explanation}`).join('\n\n')}

Constraints:
${codingProblem.constraints.map(c => `- ${c}`).join('\n')}`}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CodingTest;
