
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Save, Send, Trash } from "lucide-react";
import { toast } from "sonner";

export const AssignmentCreator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [subject, setSubject] = useState("");
  const [assignmentType, setAssignmentType] = useState("");
  const [wordLimit, setWordLimit] = useState("");
  const [deadline, setDeadline] = useState("");
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  const handleGenerateQuestions = () => {
    if (!subject || !assignmentType) {
      toast.error("Please select subject and assignment type first");
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generating questions
    setTimeout(() => {
      const mockQuestions = [
        "Explain the concept of inheritance in object-oriented programming with examples.",
        "Compare and contrast functional programming vs object-oriented programming.",
        "Describe how polymorphism is implemented in a language of your choice.",
        "Analyze the time complexity of common sorting algorithms and explain when each would be preferred.",
        "Design a simple database schema for a library management system."
      ];
      
      setSuggestedQuestions(mockQuestions);
      setIsGenerating(false);
      toast.success("AI has generated questions based on your criteria");
    }, 2000);
  };

  const handleRemoveQuestion = (index: number) => {
    setSuggestedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    setSuggestedQuestions(prev => [...prev, ""]);
  };

  const handleQuestionChange = (index: number, value: string) => {
    setSuggestedQuestions(prev => 
      prev.map((question, i) => i === index ? value : question)
    );
  };

  const handleSave = () => {
    if (!subject || !assignmentType || !deadline || suggestedQuestions.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    toast.success("Assignment saved successfully");
  };

  const handlePublish = () => {
    if (!subject || !assignmentType || !deadline || suggestedQuestions.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    toast.success("Assignment published successfully");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger id="subject">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="programming">Programming</SelectItem>
              <SelectItem value="database">Database Systems</SelectItem>
              <SelectItem value="algorithms">Algorithms</SelectItem>
              <SelectItem value="webdev">Web Development</SelectItem>
              <SelectItem value="ai">Artificial Intelligence</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Assignment Type</Label>
          <Select value={assignmentType} onValueChange={setAssignmentType}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq">Multiple Choice Questions</SelectItem>
              <SelectItem value="essay">Essay</SelectItem>
              <SelectItem value="problem">Problem-Solving</SelectItem>
              <SelectItem value="coding">Coding Assignment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="word-limit">Word Limit</Label>
          <Input 
            id="word-limit" 
            placeholder="e.g. 500" 
            type="number" 
            value={wordLimit}
            onChange={(e) => setWordLimit(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input 
            id="deadline" 
            type="date" 
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">AI-Suggested Questions</h3>
        <Button 
          variant="outline" 
          onClick={handleGenerateQuestions}
          disabled={isGenerating || !subject || !assignmentType}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Generate Questions
            </>
          )}
        </Button>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto p-1">
        {suggestedQuestions.length === 0 ? (
          <div className="text-center p-8 border rounded-md border-dashed">
            <p className="text-muted-foreground">
              Questions will appear here after generation
            </p>
          </div>
        ) : (
          suggestedQuestions.map((question, index) => (
            <div key={index} className="flex gap-2 items-start">
              <Textarea 
                value={question} 
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                placeholder="Question text"
                className="min-h-[100px]"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleRemoveQuestion(index)}
                className="flex-shrink-0 mt-1"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
        
        {suggestedQuestions.length > 0 && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleAddQuestion}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        )}
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
        <Button onClick={handlePublish}>Publish Assignment</Button>
      </div>
    </div>
  );
};
