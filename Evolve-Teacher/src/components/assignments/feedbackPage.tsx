import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, Check, X, Star, MessageSquare, Plus, Loader2 } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';

interface Submission {
  _id: string;
  studentId: string;
  studentName: string;
  fileUrl: string;
  content: string;
  submittedAt: string;
  status: string;
}

interface FeedbackDialogProps {
  assignmentId: string;
  assignmentTitle: string;
  submissions: Submission[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFeedbackSubmit: (submissionId: string, feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    generalComments: string;
    marks: number;
  }) => Promise<void>;
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  assignmentId,
  assignmentTitle,
  submissions,
  open,
  onOpenChange,
  onFeedbackSubmit
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [generalComment, setGeneralComment] = useState('');
  const [marks, setMarks] = useState(0);
  const [newPoint, setNewPoint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPoint = (type: 'strength' | 'weakness' | 'suggestion') => {
    if (!newPoint.trim()) return;

    switch (type) {
      case 'strength':
        setStrengths([...strengths, newPoint]);
        break;
      case 'weakness':
        setWeaknesses([...weaknesses, newPoint]);
        break;
      case 'suggestion':
        setSuggestions([...suggestions, newPoint]);
        break;
    }

    setNewPoint('');
    toast.success('Point added');
  };

  const handleRemovePoint = (type: 'strength' | 'weakness' | 'suggestion', index: number) => {
    switch (type) {
      case 'strength':
        setStrengths(strengths.filter((_, i) => i !== index));
        break;
      case 'weakness':
        setWeaknesses(weaknesses.filter((_, i) => i !== index));
        break;
      case 'suggestion':
        setSuggestions(suggestions.filter((_, i) => i !== index));
        break;
    }
  };

  const handleSubmitFeedback = async () => {
    if (!currentSubmission) return;

    try {
      setIsSubmitting(true);
      await onFeedbackSubmit(currentSubmission._id, {
        strengths,
        weaknesses,
        suggestions,
        generalComments: generalComment,
        marks
      });
      toast.success('Feedback submitted successfully!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
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
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {submissions.map((submission, index) => (
                <div
                  key={submission._id}
                  className={`p-3 rounded cursor-pointer ${currentSubmission?._id === submission._id ? 'bg-accent' : 'hover:bg-gray-100'}`}
                  onClick={() => {
                    setCurrentSubmission(submission);
                    setActiveTab(0);
                    // Reset feedback form when changing student
                    setStrengths([]);
                    setWeaknesses([]);
                    setSuggestions([]);
                    setGeneralComment('');
                    setMarks(0);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{submission.studentName}</span>
                    <Badge variant={submission.status === 'SUBMITTED' ? 'default' : 'secondary'}>
                      {submission.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
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
                  <h3 className="font-medium">{currentSubmission.studentName}'s Submission</h3>
                  <div className="flex gap-2">
                    {currentSubmission.fileUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={currentSubmission.fileUrl} download className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a href={currentSubmission.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        View
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Strengths</Label>
                      <div className="space-y-2">
                        {strengths.map((point, index) => (
                          <div key={index} className="flex items-center gap-2 bg-green-50 p-2 rounded">
                            <Star className="h-4 w-4 text-green-500" />
                            <span className="flex-1 text-sm">{point}</span>
                            <button onClick={() => handleRemovePoint('strength', index)} className="text-red-500">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            value={newPoint}
                            onChange={(e) => setNewPoint(e.target.value)}
                            placeholder="Add strength"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddPoint('strength')}
                          />
                          <Button size="sm" onClick={() => handleAddPoint('strength')}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Areas for Improvement</Label>
                      <div className="space-y-2">
                        {weaknesses.map((point, index) => (
                          <div key={index} className="flex items-center gap-2 bg-yellow-50 p-2 rounded">
                            <X className="h-4 w-4 text-yellow-500" />
                            <span className="flex-1 text-sm">{point}</span>
                            <button onClick={() => handleRemovePoint('weakness', index)} className="text-red-500">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            value={newPoint}
                            onChange={(e) => setNewPoint(e.target.value)}
                            placeholder="Add improvement"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddPoint('weakness')}
                          />
                          <Button size="sm" onClick={() => handleAddPoint('weakness')}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Suggestions</Label>
                      <div className="space-y-2">
                        {suggestions.map((point, index) => (
                          <div key={index} className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                            <Check className="h-4 w-4 text-blue-500" />
                            <span className="flex-1 text-sm">{point}</span>
                            <button onClick={() => handleRemovePoint('suggestion', index)} className="text-red-500">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            value={newPoint}
                            onChange={(e) => setNewPoint(e.target.value)}
                            placeholder="Add suggestion"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddPoint('suggestion')}
                          />
                          <Button size="sm" onClick={() => handleAddPoint('suggestion')}>
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
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Marks</Label>
                    <Input
                      type="number"
                      value={marks}
                      onChange={(e) => setMarks(Number(e.target.value))}
                      placeholder="Enter marks"
                      min={0}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitFeedback} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Feedback'
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Select a student to review their submission</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};