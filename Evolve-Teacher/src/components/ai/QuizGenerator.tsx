import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Loader2, Plus, Send, Share2, Trash } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const QuizGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [questionCount, setQuestionCount] = useState<string>("5");
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  const handleGenerateQuiz = () => {
    if (!subject || !difficulty || !questionType) {
      toast.error("Please select all required fields");
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generating quiz
    setTimeout(() => {
      const mockQuestions = [];
      
      // Generate appropriate question types
      for (let i = 1; i <= parseInt(questionCount); i++) {
        if (questionType === "mcq") {
          mockQuestions.push({
            id: `q${i}`,
            type: "mcq",
            question: `What is the primary benefit of ${i % 2 === 0 ? 'inheritance' : 'encapsulation'} in OOP?`,
            options: [
              "Code reusability", 
              "Data protection", 
              "Dynamic binding", 
              "Method overloading"
            ],
            correctAnswer: i % 2 === 0 ? 0 : 1
          });
        } else if (questionType === "fill") {
          mockQuestions.push({
            id: `q${i}`,
            type: "fill",
            question: `________ is the mechanism where a new class inherits properties from an existing class.`,
            answer: "Inheritance"
          });
        } else if (questionType === "truefalse") {
          mockQuestions.push({
            id: `q${i}`,
            type: "truefalse",
            question: `Polymorphism allows objects of different types to be treated as objects of a common type.`,
            answer: true
          });
        }
      }
      
      setGeneratedQuestions(mockQuestions);
      setIsGenerating(false);
      toast.success("Quiz generated successfully");
    }, 2000);
  };

  const handlePublish = () => {
    if (generatedQuestions.length === 0) {
      toast.error("No questions to publish");
      return;
    }
    
    toast.success("Quiz published successfully");
  };

  const renderQuestionEditor = (question: any, index: number) => {
    switch (question.type) {
      case "mcq":
        return (
          <Card key={question.id} className="mb-4">
            <CardHeader>
              <CardTitle className="text-base font-medium flex justify-between">
                <span>Question {index + 1} (MCQ)</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    setGeneratedQuestions(prev => 
                      prev.filter((_, i) => i !== index)
                    );
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                value={question.question} 
                onChange={(e) => {
                  const newQuestions = [...generatedQuestions];
                  newQuestions[index].question = e.target.value;
                  setGeneratedQuestions(newQuestions);
                }}
              />
              
              <div className="space-y-2">
                <Label>Options</Label>
                <RadioGroup 
                  value={question.correctAnswer.toString()}
                  onValueChange={(value) => {
                    const newQuestions = [...generatedQuestions];
                    newQuestions[index].correctAnswer = parseInt(value);
                    setGeneratedQuestions(newQuestions);
                  }}
                >
                  {question.options.map((option: string, optIndex: number) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <RadioGroupItem 
                        value={optIndex.toString()} 
                        id={`q${index}-opt${optIndex}`}
                      />
                      <Input 
                        value={option}
                        onChange={(e) => {
                          const newQuestions = [...generatedQuestions];
                          newQuestions[index].options[optIndex] = e.target.value;
                          setGeneratedQuestions(newQuestions);
                        }}
                      />
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        );
        
      case "fill":
        return (
          <Card key={question.id} className="mb-4">
            <CardHeader>
              <CardTitle className="text-base font-medium flex justify-between">
                <span>Question {index + 1} (Fill in the Blank)</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    setGeneratedQuestions(prev => 
                      prev.filter((_, i) => i !== index)
                    );
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                value={question.question} 
                onChange={(e) => {
                  const newQuestions = [...generatedQuestions];
                  newQuestions[index].question = e.target.value;
                  setGeneratedQuestions(newQuestions);
                }}
              />
              
              <div className="space-y-2">
                <Label>Answer</Label>
                <Input 
                  value={question.answer}
                  onChange={(e) => {
                    const newQuestions = [...generatedQuestions];
                    newQuestions[index].answer = e.target.value;
                    setGeneratedQuestions(newQuestions);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        );
        
      case "truefalse":
        return (
          <Card key={question.id} className="mb-4">
            <CardHeader>
              <CardTitle className="text-base font-medium flex justify-between">
                <span>Question {index + 1} (True/False)</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    setGeneratedQuestions(prev => 
                      prev.filter((_, i) => i !== index)
                    );
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                value={question.question} 
                onChange={(e) => {
                  const newQuestions = [...generatedQuestions];
                  newQuestions[index].question = e.target.value;
                  setGeneratedQuestions(newQuestions);
                }}
              />
              
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <RadioGroup 
                  value={question.answer ? "true" : "false"}
                  onValueChange={(value) => {
                    const newQuestions = [...generatedQuestions];
                    newQuestions[index].answer = value === "true";
                    setGeneratedQuestions(newQuestions);
                  }}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id={`q${index}-true`} />
                    <Label htmlFor={`q${index}-true`}>True</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id={`q${index}-false`} />
                    <Label htmlFor={`q${index}-false`}>False</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger id="difficulty">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="question-type">Question Type</Label>
          <Select value={questionType} onValueChange={setQuestionType}>
            <SelectTrigger id="question-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq">Multiple Choice</SelectItem>
              <SelectItem value="fill">Fill in the Blanks</SelectItem>
              <SelectItem value="truefalse">True/False</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="question-count">Number of Questions</Label>
          <Input 
            id="question-count" 
            type="number" 
            min="1" 
            max="20" 
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
          />
        </div>
      </div>
      
      <Button 
        onClick={handleGenerateQuiz}
        disabled={isGenerating || !subject || !difficulty || !questionType}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Quiz...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Generate Quiz
          </>
        )}
      </Button>
      
      {generatedQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Edit Questions</h3>
            <Button size="sm" variant="outline" onClick={() => {
              const newQuestion = {
                id: `q${generatedQuestions.length + 1}`,
                type: questionType,
                question: "",
                ...(questionType === "mcq" ? {
                  options: ["", "", "", ""],
                  correctAnswer: 0
                } : questionType === "fill" ? {
                  answer: ""
                } : {
                  answer: true
                })
              };
              setGeneratedQuestions([...generatedQuestions, newQuestion]);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
          
          <div className="space-y-2">
            {generatedQuestions.map((question, index) => (
              renderQuestionEditor(question, index)
            ))}
          </div>
          
          <Button 
            className="w-full" 
            onClick={handlePublish}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Publish & Share Quiz
          </Button>
        </div>
      )}
    </div>
  );
};
