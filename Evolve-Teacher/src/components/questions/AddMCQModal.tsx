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

export const AddMCQModal = ({ testId, onSuccess }: { testId: string, onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(null);
  const [marks, setMarks] = useState(1);

  const handleSubmit = async () => {
    if (correctOptionIndex === null) {
      alert("Please select the correct answer");
      return;
    }

    try {
      const formattedOptions = options.map((text, idx) => ({
        id: `option${idx + 1}`,
        text,
      }));

      await axios.post(`http://localhost:9001/teacher/questions`, {
        testId,
        questionText,
        options: formattedOptions,
        correctOptionId: `option${correctOptionIndex + 1}`,
        marks
      });

      onSuccess();
      setOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to add MCQ", err);
    }
  };

  const resetForm = () => {
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectOptionIndex(null);
    setMarks(1);
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
        setCorrectOptionIndex(null);
      } else if (correctOptionIndex !== null && correctOptionIndex > index) {
        setCorrectOptionIndex(correctOptionIndex - 1);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add MCQ Question</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add Multiple Choice Question</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Question Text</label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter the question text"
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
                    placeholder={`Option ${idx + 1}`}
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
                placeholder="Points"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => {
              setOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Question</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};