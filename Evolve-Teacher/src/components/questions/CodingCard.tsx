import { Button } from "../ui/button";

/**
{
                "_id": "67fe41df5ae760533332ca61",
                "title": "Longest Substring Without Repeating Characters updated",
                "testId": "67f544ddf1bd1ef9f4b10965",
                "description": "Write a function that finds the length of the longest substring without repeating characters.",
                "difficulty": "easy",
                "language": "javascript",
                "starterCode": "function lengthOfLongestSubstring(s) {\n  // Your code here\n}",
                "testCases": [
                    {
                        "input": "\"abcabcbb\"",
                        "expectedOutput": "3",
                        "_id": "67fe41df5ae760533332ca62"
                    },
                    {
                        "input": "\"bbbbb\"",
                        "expectedOutput": "1",
                        "_id": "67fe41df5ae760533332ca63"
                    },
                    {
                        "input": "\"pwwkew\"",
                        "expectedOutput": "3",
                        "_id": "67fe41df5ae760533332ca64"
                    }
                ],
                "marks": 10,
                "createdAt": "2025-04-15T11:24:15.049Z",
                "updatedAt": "2025-04-15T11:24:15.049Z",
                "__v": 0
            }
                refer this question and make interfce for question
 */

interface CodingTestCase {
  input: string;
  expectedOutput: string;
    _id: string;
}

interface CodingQuestion {

    title: string;
    testId: string;
    description: string;
    difficulty: string;
    Language: string;
    starterCode: string;
    testCases: CodingTestCase[];
    marks: number;
    createdAt: string;
    updatedAt: string;

}

export const CodingCard = ({ question, onDelete,onEdit }: { question: CodingQuestion; onDelete: () => void;onEdit:() => void }) => (
  <div className="p-4 border rounded shadow-sm space-y-2">
    <h3 className="font-semibold">{question.title}</h3>
    <p className="text-sm">{question.description}</p>
    <p className="text-xs text-muted-foreground">Difficulty: {question.difficulty}</p>
    <p className="text-xs text-muted-foreground">Marks: {question.marks}</p>
    <div className="text-sm mt-2">
      <strong>Starter Code:</strong>
      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">{question.starterCode}</pre>
    </div>
    <div className="text-sm mt-2">
      <strong>Test Cases:</strong>
      {question.testCases.map((tc) => (
        <div key={tc._id} className="mt-1">
          <p><strong>Input:</strong> {tc.input}</p>
          <p><strong>Expected Output:</strong> {tc.expectedOutput}</p>
        </div>
      ))}
    </div>
<div className="flex justify-between gap-2 mt-4">

<Button size="sm" variant="destructive" onClick={onDelete}>Delete</Button>

<Button variant="outline" size="sm" onClick={onEdit}>
  Edit
</Button>
</div>
  </div>
);
