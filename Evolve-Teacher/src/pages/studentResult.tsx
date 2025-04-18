import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/Dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  Eye, 
  Award,
  ArrowUpDown,
  MoreVertical
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Interface for student result
interface StudentResult {
  _id: string;
  studentId: string;
  studentName: string;
  testId: string;
  testName: string;
  testType: "MCQ" | "CODING";
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  submittedAt: string;
  evaluatedAt: string;
}

const StudentResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "submittedAt",
    direction: "desc"
  });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch("http://localhost:9001/teacher/tests/get/gradingResults");
        if (!response.ok) {
          throw new Error("Failed to fetch results");
        }
        const data = await response.json();
        
        console.log("Fetched Results:", data.data[0]);
        setResults(data.data);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching student results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Filter results based on test type and search query
  const filteredResults = results.filter(result => {
    const matchesFilter = filter === "ALL" || result.testType === filter;
    const matchesSearch = 
      result.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.testName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortConfig.key === "percentage" || sortConfig.key === "obtainedMarks" || sortConfig.key === "totalMarks") {
      return sortConfig.direction === "asc" 
        ? a[sortConfig.key] - b[sortConfig.key]
        : b[sortConfig.key] - a[sortConfig.key];
    }
    
    if (sortConfig.key === "submittedAt" || sortConfig.key === "evaluatedAt") {
      return sortConfig.direction === "asc"
        ? new Date(a[sortConfig.key]).getTime() - new Date(b[sortConfig.key]).getTime()
        : new Date(b[sortConfig.key]).getTime() - new Date(a[sortConfig.key]).getTime();
    }
    
    return sortConfig.direction === "asc"
      ? a[sortConfig.key].localeCompare(b[sortConfig.key])
      : b[sortConfig.key].localeCompare(a[sortConfig.key]);
  });

  // Handle sort
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc"
    });
  };

  // View result details
  const viewResultDetails = (testId: string, studentId: string, testType: string) => {
    navigate(`/results/${testId}/${studentId}/${testType}`);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Get grade color
  const getGradeColor = (grade: string) => {
    switch(grade) {
      case "A": return "bg-green-100 text-green-800";
      case "B": return "bg-blue-100 text-blue-800";
      case "C": return "bg-yellow-100 text-yellow-800";
      case "D": return "bg-orange-100 text-orange-800";
      case "F": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">
              Student Results
            </h1>
            <p className="text-muted-foreground">
              View and analyze all student test results
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Results
            </Button>
            <Button className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Performance Insights
            </Button>
          </div>
        </div>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Complete overview of all student test results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student or test name..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilter("ALL")}>All Tests</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("MCQ")}>MCQ Tests</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("CODING")}>Coding Tests</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Tabs defaultValue="ALL" className="w-full">
              <TabsList className="mb-4 w-full justify-start">
                <TabsTrigger value="ALL" onClick={() => setFilter("ALL")}>
                  All Tests
                </TabsTrigger>
                <TabsTrigger value="MCQ" onClick={() => setFilter("MCQ")}>
                  MCQ Tests
                </TabsTrigger>
                <TabsTrigger value="CODING" onClick={() => setFilter("CODING")}>
                  Coding Tests
                </TabsTrigger>
              </TabsList>
              <TabsContent value={filter || "ALL"}>
                {loading ? (
                  <div className="flex justify-center my-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">
                            <button 
                              className="flex items-center gap-1" 
                              onClick={() => handleSort("studentName")}
                            >
                              Student 
                              <ArrowUpDown className="h-3 w-3" />
                            </button>
                          </TableHead>
                          <TableHead className="w-[250px]">
                            <button 
                              className="flex items-center gap-1" 
                              onClick={() => handleSort("testName")}
                            >
                              Test Name
                              <ArrowUpDown className="h-3 w-3" />
                            </button>
                          </TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-center">
                            <button 
                              className="flex items-center gap-1" 
                              onClick={() => handleSort("obtainedMarks")}
                            >
                              Score
                              <ArrowUpDown className="h-3 w-3" />
                            </button>
                          </TableHead>
                          <TableHead className="text-center">
                            <button 
                              className="flex items-center gap-1" 
                              onClick={() => handleSort("percentage")}
                            >
                              Percentage
                              <ArrowUpDown className="h-3 w-3" />
                            </button>
                          </TableHead>
                          <TableHead className="text-center">Grade</TableHead>
                          <TableHead className="text-center">
                            <button 
                              className="flex items-center gap-1" 
                              onClick={() => handleSort("submittedAt")}
                            >
                              Submitted
                              <ArrowUpDown className="h-3 w-3" />
                            </button>
                          </TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedResults.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                              No results found
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortedResults.map((result) => (
                            <TableRow 
                              key={`${result._id}-${result.studentId}`}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => viewResultDetails(result.testId, result.studentId, result.testType)}
                            >
                              <TableCell className="font-medium">{result.studentName}</TableCell>
                              <TableCell>{result.testName}</TableCell>
                              <TableCell>
                                <Badge variant={result.testType === "MCQ" ? "outline" : "secondary"}>
                                  {result.testType}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {result.obtainedMarks.toFixed(2)}/{result.totalMarks}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className={
                                  result.percentage >= 85 ? "bg-green-100 text-green-800" :
                                  result.percentage >= 70 ? "bg-blue-100 text-blue-800" :
                                  result.percentage >= 55 ? "bg-yellow-100 text-yellow-800" :
                                  result.percentage >= 40 ? "bg-orange-100 text-orange-800" :
                                  "bg-red-100 text-red-800"
                                }>
                                  {result.percentage.toFixed(1)}%
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className={getGradeColor(result.grade)}>
                                  {result.grade}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(result.submittedAt)}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      viewResultDetails(result.testId, result.studentId, result.testType);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/teacher/student/${result.studentId}`);
                                      }}>
                                        View Student Profile
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/teacher/test/${result.testId}`);
                                      }}>
                                        View Test Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        // Function to download result
                                        toast.success("Result downloaded successfully");
                                      }}>
                                        Download Result
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all test types
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {results.length ? 
                  (results.reduce((sum, result) => sum + result.percentage, 0) / results.length).toFixed(1) + "%" 
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                Overall performance
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">MCQ Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {results.filter(r => r.testType === "MCQ").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Multiple choice assessments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Coding Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {results.filter(r => r.testType === "CODING").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Programming assessments
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentResults;