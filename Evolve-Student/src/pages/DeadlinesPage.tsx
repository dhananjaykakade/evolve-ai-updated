
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Filter, Search, Calendar, Download, Upload } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

interface Deadline {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  daysLeft: number;
  description: string;
}

const DeadlinesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Sample data - would come from API in real application
  const deadlines: Deadline[] = [
    { id: 1, title: "Research Paper on Quantum Computing", subject: "Computer Science", dueDate: "Oct 15, 2023", daysLeft: 1, description: "Write a 10-page research paper on quantum computing principles and applications." },
    { id: 2, title: "Mathematics Problem Set 3", subject: "Mathematics", dueDate: "Oct 18, 2023", daysLeft: 4, description: "Complete all problems in Chapter 7, focusing on differential equations." },
    { id: 3, title: "Literature Review Essay", subject: "English Literature", dueDate: "Oct 20, 2023", daysLeft: 6, description: "Write a critical analysis of the assigned novels, comparing themes and character development." },
    { id: 4, title: "Physics Lab Report", subject: "Physics", dueDate: "Oct 12, 2023", daysLeft: -2, description: "Document your findings from the particle acceleration experiment, including all data and analysis." },
    { id: 5, title: "Data Structures Assignment", subject: "Computer Science", dueDate: "Oct 14, 2023", daysLeft: 0, description: "Implement a balanced tree and graph algorithms as specified in the requirements." },
    { id: 6, title: "Chemistry Lab Analysis", subject: "Chemistry", dueDate: "Oct 22, 2023", daysLeft: 8, description: "Complete the analysis of chemical compounds from the recent lab experiment." },
    { id: 7, title: "Digital Media Project", subject: "Media Studies", dueDate: "Oct 25, 2023", daysLeft: 11, description: "Create a multimedia presentation on the impact of social media on modern communication." },
    { id: 8, title: "Psychology Case Study", subject: "Psychology", dueDate: "Oct 17, 2023", daysLeft: 3, description: "Analyze the provided case study using the theoretical frameworks discussed in class." },
  ];

  // Get unique subjects for filtering
  const subjects = ['all', ...Array.from(new Set(deadlines.map(d => d.subject)))];
  
  // Filter deadlines based on search term and selected subject
  const filteredDeadlines = deadlines.filter(deadline => {
    const matchesSearch = deadline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deadline.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || deadline.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  const getStatusBadge = (daysLeft: number) => {
    if (daysLeft < 0) return <Badge className="bg-red-500">Overdue</Badge>;
    if (daysLeft <= 1) return <Badge className="bg-amber-500">Urgent</Badge>;
    if (daysLeft <= 3) return <Badge className="bg-blue-500">Upcoming</Badge>;
    return <Badge className="bg-green-500">Scheduled</Badge>;
  };

  return (
    <Layout title="Deadlines">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Upcoming Deadlines</h2>
          <p className="text-muted-foreground">
            View and manage all your assignment deadlines in one place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search deadlines..."
              className="w-full sm:w-[300px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-muted-foreground" />
            <select 
              className="border border-input bg-background px-3 py-1 rounded-md text-sm"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeadlines.map((deadline) => (
                  <TableRow key={deadline.id}>
                    <TableCell className="font-medium">{deadline.title}</TableCell>
                    <TableCell>{deadline.subject}</TableCell>
                    <TableCell>{deadline.dueDate}</TableCell>
                    <TableCell>{getStatusBadge(deadline.daysLeft)}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>{deadline.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="flex justify-between items-center">
                              <Badge variant="outline" className="px-2 py-0.5">{deadline.subject}</Badge>
                              {getStatusBadge(deadline.daysLeft)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar size={14} />
                              <span>Due: {deadline.dueDate}</span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Description:</p>
                              <p className="text-sm text-muted-foreground">
                                {deadline.description}
                              </p>
                            </div>
                            <div className="flex justify-between pt-4">
                              <Button variant="outline" size="sm">
                                <Download size={14} className="mr-1" />
                                Download
                              </Button>
                              {deadline.daysLeft >= 0 && (
                                <Button size="sm">
                                  <Upload size={14} className="mr-1" />
                                  Submit
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DeadlinesPage;
