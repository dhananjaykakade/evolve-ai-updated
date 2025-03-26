import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssignmentCard, { Assignment } from './AssignmentCard';
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter } from 'lucide-react';

const AssignmentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Sample data - would come from API in real application
  const assignments: Assignment[] = [
    {
      id: 1,
      title: "Research Paper on Quantum Computing",
      subject: "Computer Science",
      dueDate: "Oct 15, 2023",
      status: "pending",
      fileUrl: "#",
    },
    {
      id: 2,
      title: "Mathematics Problem Set 3",
      subject: "Mathematics",
      dueDate: "Oct 18, 2023",
      status: "pending",
      fileUrl: "#",
    },
    {
      id: 3,
      title: "Literature Review Essay",
      subject: "English Literature",
      dueDate: "Oct 20, 2023",
      status: "pending",
      fileUrl: "#",
    },
    {
      id: 4,
      title: "Physics Lab Report",
      subject: "Physics",
      dueDate: "Oct 12, 2023",
      status: "overdue",
      fileUrl: "#",
    },
    {
      id: 5,
      title: "Data Structures Assignment",
      subject: "Computer Science",
      dueDate: "Oct 14, 2023",
      status: "completed",
      marks: {
        obtained: 85,
        total: 100,
      },
      fileUrl: "#",
      submissionUrl: "#",
      feedback: {
        strengths: [
          "Excellent implementation of binary search trees",
          "Clean code structure with proper documentation",
          "Efficient algorithms with good time complexity analysis"
        ],
        weaknesses: [
          "Some edge cases not handled properly in graph algorithms",
          "Memory management could be improved in certain sections"
        ],
        suggestions: [
          "Consider using an adjacency list instead of a matrix for sparse graphs",
          "Add more comprehensive unit tests for edge cases"
        ],
        generalComments: "Overall, this is a strong submission that demonstrates good understanding of data structures. The implementation is clean and well-documented, although there are a few areas that could be improved. Keep up the good work!"
      }
    },
    {
      id: 6,
      title: "Organic Chemistry Lab Notes",
      subject: "Chemistry",
      dueDate: "Oct 5, 2023",
      status: "completed",
      marks: {
        obtained: 78,
        total: 100,
      },
      fileUrl: "#",
      submissionUrl: "#",
      feedback: {
        strengths: [
          "Detailed experimental observations",
          "Good analysis of chemical reactions",
          "Proper safety protocols followed"
        ],
        weaknesses: [
          "Some reaction diagrams could be clearer",
          "Data interpretation lacks depth in certain sections"
        ],
        suggestions: [
          "Include more molecular structure drawings",
          "Elaborate on the reaction mechanisms in more detail"
        ],
        generalComments: "Your lab notes show good attention to detail in the experimental process. The analysis demonstrates understanding of basic organic chemistry principles, but could benefit from deeper exploration of reaction mechanisms. Work on your data presentation for future assignments."
      }
    },
  ];

  const pendingAssignments = assignments.filter(
    (assignment) => assignment.status === "pending" || assignment.status === "overdue"
  );
  
  const completedAssignments = assignments.filter(
    (assignment) => assignment.status === "completed"
  );

  const filterAssignments = (assignmentList: Assignment[]) => {
    return assignmentList
      .filter((assignment) => {
        // Filter by search term
        if (searchTerm && !assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Filter by subject
        if (filter !== 'all' && assignment.subject !== filter) {
          return false;
        }
        
        return true;
      });
  };

  const filteredPendingAssignments = filterAssignments(pendingAssignments);
  const filteredCompletedAssignments = filterAssignments(completedAssignments);

  // Get unique subjects for filter
  const subjects = ['all', ...new Set(assignments.map(a => a.subject))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search assignments..."
            className="w-full sm:w-[300px] pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-muted-foreground" />
          <Select
            value={filter}
            onValueChange={setFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {filteredPendingAssignments.length > 0 ? (
            filteredPendingAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No pending assignments found.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {filteredCompletedAssignments.length > 0 ? (
            filteredCompletedAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No completed assignments found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssignmentList;
