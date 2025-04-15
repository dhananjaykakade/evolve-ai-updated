import { Button } from "../ui/button";

/**
{
            "_id": "67f37e0a3f8aa79fc8a6d3f3",
            "testId": "67f37e0a3f8aa79fc8a6d3ec",
            "questionText": "Which tag is used to define an internal style sheet?",
            "options": [
                {
                    "id": "opt1",
                    "text": "<style>"
                },
                {
                    "id": "opt2",
                    "text": "<css>"
                },
                {
                    "id": "opt3",
                    "text": "<script>"
                },
                {
                    "id": "opt4",
                    "text": "<link>"
                }
            ],
            "correctOptionId": "opt1",
            "marks": 1,
            "__v": 0,
            "createdAt": "2025-04-07T07:26:02.866Z",
            "updatedAt": "2025-04-07T07:26:02.866Z"
        },
        refer this question and make interfce for question

 */
interface MCQOption {
    id: string;
    text: string;
    }
interface MCQQuestion {
    _id: string;
    testId: string;
    questionText: string;
    options: MCQOption[];
    correctOptionId: string;
    marks: number;
    createdAt: string;
    updatedAt: string;
}

export const MCQCard = ({ question, onDelete,onEdit }: { question: MCQQuestion; onDelete: () => void ; onEdit:() => void}) => (
  <div className="p-4 border rounded shadow-sm space-y-2">
    <h3 className="font-semibold">{question.questionText}</h3>
    <ul className="list-disc pl-5 text-sm">
      {question.options.map((opt: MCQOption) => (
        <li key={opt.id}>
          <strong>{opt.id}:</strong> {opt.text}
        </li>
      ))}
    </ul>
    <p className="text-xs text-muted-foreground">Correct: {question.correctOptionId}</p>
    <p className="text-xs text-muted-foreground">Marks: {question.marks}</p>
<div className="flex justify-between gap-2 mt-4">
<Button size="sm" variant="destructive" onClick={onDelete}>Delete</Button>
    
    <Button variant="outline" size="sm" onClick={onEdit}>
      Edit
    </Button>
</div>
  </div>
);
