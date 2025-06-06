import React, { useState ,useEffect} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  Check,
  X,
  Star,
  MessageSquare,
  Plus,
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

interface FeedbackData {
  feedback: feedback;
  
  marks: {
    obtained: number;
    total?: number;
  };
  gradeStatus: string;
}

interface feedback {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  generalComments: string;
}

interface Submission {
  _id: string;
  studentId: string;
  studentName: string;
  fileUrl: string;
  content: string;
  submittedAt: string;
  status: string;
  gradeStatus: string;
  marks: marks;
  feedback?:feedback;
  isAiFeedback?: boolean;
}

interface FeedbackDialogProps {
  assignmentId: string;
  assignmentTitle: string;
  submissions: Submission[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFeedbackSubmit: (
    submissionId: string,
    feedback: FeedbackData
  ) => Promise<void>;
}
interface marks {
  obtained: number;
  total?: number;
}
export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  assignmentId,
  assignmentTitle,
  submissions,
  open,
  onOpenChange,
  onFeedbackSubmit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [gradeStatus, setGradeStatus] = useState<string>("PENDING_REVIEW");
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(
    null
  );
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [generalComment, setGeneralComment] = useState("");
  const [Marks, setMarks] = useState(0);
  const [newStrength, setNewStrength] = useState("");
  const [newWeakness, setNewWeakness] = useState("");
  const [newSuggestion, setNewSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentSubmission && currentSubmission.feedback) {
      setStrengths(currentSubmission.feedback.strengths || []);
      setWeaknesses(currentSubmission.feedback.weaknesses || []);
      setSuggestions(currentSubmission.feedback.suggestions || []);
      setGeneralComment(currentSubmission.feedback.generalComments || "");
      setMarks(currentSubmission.marks?.obtained || 0);
      setGradeStatus(currentSubmission.gradeStatus || "PENDING_REVIEW");
    }
  }, [currentSubmission]);

  const handleCancelEdit = () => {
    if (currentSubmission?.feedback) {
      // Reset to original feedback
      setStrengths(currentSubmission.feedback.strengths || []);
      setWeaknesses(currentSubmission.feedback.weaknesses || []);
      setSuggestions(currentSubmission.feedback.suggestions || []);
      setGeneralComment(currentSubmission.feedback.generalComments || "");
      setMarks(currentSubmission.marks?.obtained || 0);
      setGradeStatus(currentSubmission.gradeStatus || "PENDING_REVIEW");
    }
    setIsEditing(false);
  };



  const handleAddPoint = (type: "strength" | "weakness" | "suggestion") => {
    let point = "";
    switch (type) {
      case "strength":
        point = newStrength.trim();
        if (!point) return;
        setStrengths([...strengths, point]);
        setNewStrength("");
        break;
      case "weakness":
        point = newWeakness.trim();
        if (!point) return;
        setWeaknesses([...weaknesses, point]);
        setNewWeakness("");
        break;
      case "suggestion":
        point = newSuggestion.trim();
        if (!point) return;
        setSuggestions([...suggestions, point]);
        setNewSuggestion("");
        break;
    }

    toast.success("Point added");
  };

  const handleRemovePoint = (
    type: "strength" | "weakness" | "suggestion",
    index: number
  ) => {
    switch (type) {
      case "strength":
        setStrengths(strengths.filter((_, i) => i !== index));
        break;
      case "weakness":
        setWeaknesses(weaknesses.filter((_, i) => i !== index));
        break;
      case "suggestion":
        setSuggestions(suggestions.filter((_, i) => i !== index));
        break;
    }
  };
  const submitFeedback = async (
    submissionId: string,
    feedback: FeedbackData
  ) => {
    try {
      const response = await axios.put(
        `http://localhost:9001/student/submissions/feedback/${submissionId}`,
        feedback,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  };

  const handleSubmitFeedback = async () => {
    if (!currentSubmission) {
      return;
    }

    try {
      setIsSubmitting(true);
      const feedbackData: FeedbackData = {
        feedback: {
          strengths,
          weaknesses,
          suggestions,
          generalComments: generalComment,
        },
        marks: {
          obtained: Marks,
          total: currentSubmission.marks.total,
        },
        gradeStatus,
      };

      await submitFeedback(currentSubmission._id, feedbackData);
      toast.success("Feedback submitted successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Review Submissions: {assignmentTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6">
          {/* Student List Sidebar */}
          <div className="w-1/3 border-r pr-4">
            <h3 className="font-medium mb-3">Students</h3>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {submissions.map((submission) => (
                <div
                  key={submission._id}
                  className={`p-3 rounded cursor-pointer ${
                    currentSubmission?._id === submission._id
                      ? "bg-accent"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setCurrentSubmission(submission);
                    setActiveTab(0);
                    // Reset feedback form when changing student
                    setStrengths([]);
                    setWeaknesses([]);
                    setSuggestions([]);
                    setGeneralComment("");
                    setMarks(Marks);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {submission.studentName}
                    </span>
                    <Badge
                      variant={
                        submission.status === "SUBMITTED"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {submission.gradeStatus}
                    </Badge>
                    {submission.feedback && submission.isAiFeedback && (
  <Badge variant="secondary">AI Feedback</Badge>
)}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Submitted:{" "}
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Area */}
          <div className="w-2/3">
            {currentSubmission ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">
                    {currentSubmission.studentName}'s Submission
                  </h3>
                  <div className="flex gap-2">
                    {currentSubmission.fileUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={currentSubmission.fileUrl}
                          download
                          className="flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={currentSubmission.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        View
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Strengths Column */}
                    <div className="space-y-2">
                      <Label>Strengths</Label>
                      <div className="space-y-2">
                        {strengths.map((point, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-green-50 p-2 rounded"
                          >
                            <Star className="h-4 w-4 text-green-500" />
                            <span className="flex-1 text-sm">{point}</span>
                            <button
                              onClick={() =>
                                handleRemovePoint("strength", index)
                              }
                              className="text-red-500 hover:bg-red-50 p-1 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            value={newStrength}
                            onChange={(e) => setNewStrength(e.target.value)}
                            placeholder="Add strength"
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddPoint("strength")
                            }
                            className="h-10"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddPoint("strength")}
                            disabled={!newStrength.trim()}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Weaknesses Column */}
                    <div className="space-y-2">
                      <Label>Areas for Improvement</Label>
                      <div className="space-y-2">
                        {weaknesses.map((point, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-yellow-50 p-2 rounded"
                          >
                            <X className="h-4 w-4 text-yellow-500" />
                            <span className="flex-1 text-sm">{point}</span>
                            <button
                              onClick={() =>
                                handleRemovePoint("weakness", index)
                              }
                              className="text-red-500 hover:bg-red-50 p-1 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            value={newWeakness}
                            onChange={(e) => setNewWeakness(e.target.value)}
                            placeholder="Add improvement"
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddPoint("weakness")
                            }
                            className="h-10"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddPoint("weakness")}
                            disabled={!newWeakness.trim()}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Suggestions Column */}
                    <div className="space-y-2">
                      <Label>Suggestions</Label>
                      <div className="space-y-2">
                        {suggestions.map((point, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-blue-50 p-2 rounded"
                          >
                            <Check className="h-4 w-4 text-blue-500" />
                            <span className="flex-1 text-sm">{point}</span>
                            <button
                              onClick={() =>
                                handleRemovePoint("suggestion", index)
                              }
                              className="text-red-500 hover:bg-red-50 p-1 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            value={newSuggestion}
                            onChange={(e) => setNewSuggestion(e.target.value)}
                            placeholder="Add suggestion"
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddPoint("suggestion")
                            }
                            className="h-10"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddPoint("suggestion")}
                            disabled={!newSuggestion.trim()}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Overall Comments</Label>
                    <Textarea
                      value={generalComment}
                      onChange={(e) => setGeneralComment(e.target.value)}
                      placeholder="Write your overall feedback here..."
                      rows={5}
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className=" flex gap-4">
                    <div className="space-y-2 w-1/3">
                      <Label>Marks</Label>
                      <Input
                        type="number"
                        value={Marks}
                        max={currentSubmission.marks.total}
                        onChange={(e) => setMarks(Number(e.target.value))}
                        placeholder="Enter marks"
                        min={0}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2 w-1/3">
                      <Label>Grade Status</Label>
                      <Select
                        value={gradeStatus}
                        onValueChange={(value) => setGradeStatus(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select grade status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING_REVIEW">
                            Pending Review
                          </SelectItem>
                          <SelectItem value="EXCELLENT">Excellent</SelectItem>
                          <SelectItem value="PASS">Pass</SelectItem>
                          <SelectItem value="NEEDS_IMPROVEMENT">
                            Needs Improvement
                          </SelectItem>
                          <SelectItem value="FAIL">Fail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitFeedback}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Feedback"
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">
                  Select a student to review their submission
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
