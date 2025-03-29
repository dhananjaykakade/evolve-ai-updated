import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssignmentCard from './AssignmentCard';
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

interface Feedback {
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  generalComments?: string;
}

interface Marks {
  obtained?: number;
  total?: number;
}

interface StudentSubmission {
  _id: string;
  assignmentId: string;
  studentId: string;
  submissionType: string;
  content: string;
  fileUrl: string;
  status: string;
  isEdited: boolean;
  gradeStatus: string;
  feedback: Feedback;
  marks: Marks;
  createdAt: string;
  updatedAt: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  teacherId: string;
  course: string;
  materials: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  studentSubmission?: StudentSubmission | null;
}

const AssignmentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'closed'>('all');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubmissionSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:9001/teacher/assignments/get/students?studentId=${user.id}`
        );
        
        if (response.data.success) {
          // Sort assignments by due date in descending order (newest first)
          const sortedAssignments = response.data.data.assignments.sort((a: Assignment, b: Assignment) => 
            new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
          );
          setAssignments(sortedAssignments);
        } else {
          throw new Error(response.data.message || 'Failed to fetch assignments');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [user.id, refreshKey]);

  // Filter assignments based on status
  const getFilteredAssignments = () => {
    const now = new Date();
    
    return assignments.filter(assignment => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        assignment.course.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by course
      const matchesCourse = filter === 'all' || assignment.course === filter;
      
      // Filter by status
      const assignmentDueDate = new Date(assignment.dueDate);
      let matchesStatus = true;
      
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending') {
          matchesStatus = assignment.status !== "CLOSED" && assignment.studentSubmission ==null && assignmentDueDate >= now;
        } else if (statusFilter === 'completed') {
          matchesStatus = assignment.studentSubmission !== null;
        } else if (statusFilter === 'closed') {
          matchesStatus = assignment.status === "CLOSED";
        }
      }
      
      return matchesSearch && matchesCourse && matchesStatus;
    });
  };

  const filteredAssignments = getFilteredAssignments();
  
  // Get unique courses for filter dropdown
  const subjects = ['all', ...new Set(assignments.map(a => a.course))];

  if (loading) {
    return <div className="text-center py-8">Loading assignments...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">Error: {error}</div>;
  }

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
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject === 'all' ? 'All Courses' : subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => (
            <AssignmentCard 
              key={assignment._id} 
              assignment={assignment} 
              onSubmissionSuccess={handleSubmissionSuccess}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No assignments found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentList;