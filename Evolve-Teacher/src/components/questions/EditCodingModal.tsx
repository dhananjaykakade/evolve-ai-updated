import React, { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios from "axios";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface EditCodingModalProps {
  question: {
    _id: string;
    title: string;
    description: string;
    difficulty: string;
    language: string;
    starterCode: string;
    testCases: { input: string; expectedOutput: string }[];
    marks: number;
  };
  onClose: () => void;
  onSuccess: (updatedQuestion: any) => void;
}

export const EditCodingModal: React.FC<EditCodingModalProps> = ({
  question,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState(question.title);
  const [description, setDescription] = useState(question.description);
  const [difficulty, setDifficulty] = useState(question.difficulty);
  const [language, setLanguage] = useState(question.language);
  const [starterCode, setStarterCode] = useState(question.starterCode);
  const [testCases, setTestCases] = useState(question.testCases);
  const [marks, setMarks] = useState(question.marks);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {

  const processedTestCases = testCases.map(tc => ({
    input: tc.input.replace(/\\n/g, '\n'),  // Convert \n to actual newlines
    expectedOutput: tc.expectedOutput.replace(/\\n/g, '\n')
  }));


    setLoading(true);
    try {
      const updatedQuestion = {
        ...question,
        title,
        description,
        difficulty,
        language,
        starterCode,
        testCases: processedTestCases,
        marks,
      };

      await axios.put(
        `http://localhost:9001/teacher/coding/question/${question._id}`,
        updatedQuestion
      );

      onSuccess(updatedQuestion);
      onClose();
      toast.success("Coding question updated successfully");
    } catch (err) {
      console.error("Failed to update coding question", err);
      toast.error("Failed to update coding question");
    } finally {
      setLoading(false);
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Coding Question</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Difficulty</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Marks</label>
              <Input
                type="number"
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                min="1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Starter Code</label>
            <Textarea
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
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
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};