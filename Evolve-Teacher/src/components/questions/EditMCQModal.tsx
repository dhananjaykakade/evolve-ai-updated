import React, { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios from "axios";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";

interface EditMCQModalProps {
  question: {
    _id: string;
    questionText: string;
    options: { id: string; text: string }[];
    correctOptionId: string;
    marks: number;
  };
  onClose: () => void;
  onSuccess: (updatedQuestion: any) => void;
}

export const EditMCQModal: React.FC<EditMCQModalProps> = ({
  question,
  onClose,
  onSuccess,
}) => {
  const [questionText, setQuestionText] = useState(question.questionText);
  const [options, setOptions] = useState(question.options.map(opt => opt.text));
  const [correctOptionIndex, setCorrectOptionIndex] = useState(
    question.options.findIndex(opt => opt.id === question.correctOptionId)
  );
  const [marks, setMarks] = useState(question.marks);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (correctOptionIndex === -1) {
      toast.error("Please select the correct answer");
      return;
    }

    setLoading(true);
    try {
      const formattedOptions = options.map((text, idx) => ({
        id: `option${idx + 1}`,
        text,
      }));

      const updatedQuestion = {
        ...question,
        questionText,
        options: formattedOptions,
        correctOptionId: `option${correctOptionIndex + 1}`,
        marks,
      };

      await axios.put(
        `http://localhost:9001/teacher/questions/${question._id}`,
        updatedQuestion
      );

      onSuccess(updatedQuestion);
      onClose();
      toast.success("MCQ updated successfully");
    } catch (err) {
      console.error("Failed to update MCQ", err);
      toast.error("Failed to update MCQ");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOpts = [...options];
    newOpts[index] = value;
    setOptions(newOpts);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOpts = options.filter((_, i) => i !== index);
      setOptions(newOpts);
      if (correctOptionIndex === index) {
        setCorrectOptionIndex(-1);
      } else if (correctOptionIndex > index) {
        setCorrectOptionIndex(correctOptionIndex - 1);
      }
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit MCQ Question</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Question Text</label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium">Options</label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctOptionIndex === idx}
                    onChange={() => setCorrectOptionIndex(idx)}
                    className="h-4 w-4"
                  />
                  <Input
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                  />
                </div>
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(idx)}
                    className="text-red-500"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <Button variant="outline" size="sm" onClick={addOption}>
                Add Option
              </Button>
            )}
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