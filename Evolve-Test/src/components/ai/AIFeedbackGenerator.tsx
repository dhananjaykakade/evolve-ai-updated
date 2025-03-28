
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCw, ThumbsUp, ThumbsDown, BrainCircuit, MessageSquare, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const AIFeedbackGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const [feedbackType, setFeedbackType] = useState("comprehensive");
  const [autoGrade, setAutoGrade] = useState(true);
  const [tone, setTone] = useState(50);
  const [feedbackLength, setFeedbackLength] = useState("medium");

  // Demo feedback examples
  const feedbackExamples = {
    comprehensive: `The submission demonstrates a good understanding of database normalization principles. The explanation of 1NF, 2NF, and 3NF is accurate, though the distinction between 2NF and 3NF could be clearer. 

The ER diagram correctly shows the relationships between entities, but there are some inconsistencies in cardinality notations. The primary and foreign key designations are well-implemented.

Suggested improvements:
1. Revise the explanation of transitive dependencies in 3NF
2. Ensure consistent notation in the ER diagram
3. Consider including a practical example of normalization

Grade: B+ (87/100)`,

    concise: `Good understanding of normalization concepts. ER diagram is mostly correct with minor cardinality notation issues. Strengthen the explanation of 3NF and provide a practical example.

Grade: B+ (87/100)`,

    detailed: `The submission demonstrates a good understanding of database normalization principles. The student has correctly identified the key characteristics of each normal form:

1NF: The explanation correctly identifies that tables should have no repeating groups and each cell should contain atomic values. The example provided illustrates this well.

2NF: The student correctly explains that 2NF requires 1NF plus all non-key attributes must be fully dependent on the primary key. However, the example could better illustrate partial dependencies.

3NF: The explanation of transitive dependencies needs revision. While the student mentions that non-key attributes should not depend on other non-key attributes, the specific nature of transitive dependencies could be more clearly articulated.

The ER diagram shows appropriate entities and relationships, but there are some inconsistencies in the cardinality notation, particularly in the relationship between Customer and Order. The primary and foreign key designations are well-implemented, showing a good understanding of database design principles.

To improve this submission, I recommend:
1. Revising the explanation of transitive dependencies in 3NF with a clearer example
2. Ensuring consistent notation in the ER diagram (specifically the Customer-Order relationship)
3. Including a step-by-step practical example that shows the normalization process from unnormalized to 3NF

The submission shows solid understanding of core concepts with some room for improvement in technical precision.

Grade: B+ (87/100)`
  };

  const generateFeedback = () => {
    if (!submissionText.trim()) {
      toast.error("Please enter the student submission text first.");
      return;
    }

    setIsGenerating(true);
    setFeedback("");

    // Simulate AI generating feedback
    setTimeout(() => {
      setIsGenerating(false);
      // Choose feedback based on selected length
      if (feedbackLength === "short") {
        setFeedback(feedbackExamples.concise);
      } else if (feedbackLength === "long") {
        setFeedback(feedbackExamples.detailed);
      } else {
        setFeedback(feedbackExamples.comprehensive);
      }
      toast.success("AI feedback generated successfully");
    }, 2000);
  };

  const regenerateFeedback = () => {
    setIsGenerating(true);
    
    // Simulate regenerating feedback
    setTimeout(() => {
      setIsGenerating(false);
      // Just slightly modify existing feedback for demo purposes
      setFeedback(feedback + "\n\nAdditional note: The conceptual understanding is strong overall.");
      toast.success("Feedback regenerated with new parameters");
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(feedback);
    toast.success("Feedback copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              AI Feedback Generator
            </CardTitle>
            <CardDescription>
              Generate personalized feedback for student submissions using AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="submission">Student Submission</Label>
              <Textarea
                id="submission"
                placeholder="Paste the student's submission text here..."
                className="min-h-[200px]"
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Feedback Tone</Label>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Supportive</span>
                  <span>Constructive</span>
                  <span>Critical</span>
                </div>
                <Slider
                  value={[tone]}
                  min={0}
                  max={100}
                  step={10}
                  onValueChange={(value) => setTone(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedbackType">Feedback Focus</Label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger id="feedbackType">
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="technical">Technical Accuracy</SelectItem>
                    <SelectItem value="structure">Structure & Organization</SelectItem>
                    <SelectItem value="conceptual">Conceptual Understanding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedbackLength">Feedback Length</Label>
                <Select value={feedbackLength} onValueChange={setFeedbackLength}>
                  <SelectTrigger id="feedbackLength">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Concise</SelectItem>
                    <SelectItem value="medium">Standard</SelectItem>
                    <SelectItem value="long">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between space-y-0 pt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoGrade"
                    checked={autoGrade}
                    onCheckedChange={setAutoGrade}
                  />
                  <Label htmlFor="autoGrade">Include Auto-Grading</Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" disabled={isGenerating}>
              Save Settings
            </Button>
            <Button onClick={generateFeedback} disabled={isGenerating || !submissionText.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Generate Feedback
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teacher Notes</CardTitle>
            <CardDescription>
              Add personal notes to supplement AI feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add your own notes here..."
              className="min-h-[150px]"
            />
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <MessageSquare className="mr-2 h-4 w-4" />
              Add to Feedback
            </Button>
          </CardFooter>
        </Card>
      </div>

      {feedback && (
        <Card className="border-primary/20 animate-fade-in">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="text-lg">Generated Feedback</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-md bg-muted/50 p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {feedback}
              </pre>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Was this feedback helpful?</p>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={regenerateFeedback} disabled={isGenerating}>
                <RotateCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
              <Button size="sm" onClick={copyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};
