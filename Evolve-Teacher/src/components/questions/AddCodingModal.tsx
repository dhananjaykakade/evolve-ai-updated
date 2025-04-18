import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios from "axios";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const AddCodingModal = ({ testId, onSuccess }: { testId: string, onSuccess: () => void }) => {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [starterCode, setStarterCode] = useState("");
  const [testCases, setTestCases] = useState([{ input: "", expectedOutput: "" }]);
  const [marks, setMarks] = useState(1);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {


    const processedTestCases = testCases.map(tc => ({
      input: tc.input.replace(/\\n/g, '\n'),  // Convert \n to actual newlines
      expectedOutput: tc.expectedOutput.replace(/\\n/g, '\n')
    }));

    try {
      await axios.post("http://localhost:9001/teacher/coding", {
        testId,
        title,
        description,
        difficulty,
        language,
        starterCode,
        testCases:processedTestCases,
        marks
      });

      onSuccess();
      setOpen(false);
    } catch (err) {
      console.error("Failed to add coding question", err);
    }
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "" }]);
  };

  const removeTestCase = (index: number) => {
    if (testCases.length > 1) {
      const newCases = testCases.filter((_, i) => i !== index);
      setTestCases(newCases);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Coding Question</Button>
      </DialogTrigger>
      <DialogContent className="space-y-4 max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold">Add Coding Question</h2>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Question title" />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Description</label>
          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Detailed description of the question" 
            rows={4}
          />
        </div>
        <div className="space-y-2">
  <label className="block text-sm font-medium">Language</label>
  <Select value={language} onValueChange={setLanguage}>
    <SelectTrigger>
      <SelectValue placeholder="Select language" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="javascript">JavaScript</SelectItem>
      <SelectItem value="python">Python</SelectItem>
      <SelectItem value="cpp">C++</SelectItem>
      <SelectItem value="java">Java</SelectItem>
    </SelectContent>
  </Select>
</div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Difficulty</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Marks</label>
            <Input 
              type="number" 
              value={marks} 
              onChange={(e) => setMarks(Number(e.target.value))} 
              min="1"
              placeholder="Points"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Starter Code</label>
          <Textarea
            value={starterCode}
            onChange={(e) => setStarterCode(e.target.value)}
            placeholder="Initial code provided to students"
            rows={6}
            className="font-mono text-sm"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium">Test Cases</label>
            <Button variant="outline" size="sm" onClick={addTestCase}>
              Add Test Case
            </Button>
          </div>
          
          {testCases.map((tc, idx) => (
            <div key={idx} className="space-y-2 p-3 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Test Case {idx + 1}</span>
                {testCases.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeTestCase(idx)}
                    className="text-red-500"
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <Input 
                  value={tc.input} 
                  onChange={(e) => {
                    const newCases = [...testCases];
                    newCases[idx].input = e.target.value;
                    // refine \n to actual newlines
                    newCases[idx].input = newCases[idx].input.replace(/\\n/g, '\n');
                    setTestCases(newCases);
                  }} 
                  placeholder="Input (e.g., [1,2,3], 5, 'test')" 
                />
                <Input 
                  value={tc.expectedOutput} 
                  onChange={(e) => {
                    const newCases = [...testCases];
                    newCases[idx].expectedOutput = e.target.value;
                    setTestCases(newCases);
                  }} 
                  placeholder="Expected Output" 
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Question</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};