import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, FileText, Code, AlertCircle, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

interface Test {
  _id: string;
  title: string;
  type: 'MCQ' | 'CODING';
  course: string;
  scheduledAt: string;
  expiresAt: string;
  totalMarks: number;
  isPublished: boolean;
  reopenedFor: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface TestResponse {
  upcoming: Test[];
  ongoing: Test[];
  expired: Test[];
}

interface TestStatus {
  mcq?: 'not started' | 'not submitted' | 'submitted' | 'terminated';
  coding?: 'not started' | 'not submitted' | 'submitted' | 'terminated';
  mcqAutoSubmitted?: boolean;
  codingAutoSubmitted?: boolean;
}

const TestStatusBadge = ({ status }: { status: 'upcoming' | 'ongoing' | 'expired' }) => {
  const statusMap = {
    upcoming: { text: 'Upcoming', color: 'bg-blue-100 text-blue-800', icon: <AlertCircle size={14} className="mr-1" /> },
    ongoing: { text: 'Ongoing', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} className="mr-1" /> },
    expired: { text: 'Expired', color: 'bg-gray-100 text-gray-800', icon: <XCircle size={14} className="mr-1" /> }
  };

  return (
    <Badge className={`font-medium ${statusMap[status].color} flex items-center`}>
      {statusMap[status].icon}
      {statusMap[status].text}
    </Badge>
  );
};

const TestCard = ({ 
  test, 
  status, 
  testStatus 
}: { 
  test: Test; 
  status: 'upcoming' | 'ongoing' | 'expired'; 
  testStatus?: TestStatus;
}) => {
  const { token, user } = useAuth();
  const now = new Date();
  const scheduledAt = new Date(test.scheduledAt);
  const expiresAt = new Date(test.expiresAt);
  
  const isTestAvailable = status === 'ongoing' || 
    (status === 'upcoming' && now >= scheduledAt && now <= expiresAt);

  const testType = test.type.toLowerCase() as 'mcq' | 'coding';
  const currentStatus = testStatus?.[testType];
  
  // Determine button state based on test status
  const isSubmitted = currentStatus === 'submitted';
  const isTerminated = currentStatus === 'terminated';
  const isAutoSubmitted = testStatus?.[`${testType}AutoSubmitted`];

  // Consider auto-submitted tests as terminated
  const effectivelyTerminated = isTerminated || isAutoSubmitted;

  const startTest = () => {
    if (isTestAvailable && !isSubmitted && !effectivelyTerminated) {
      window.open(`http://localhost:8085/test/${test._id}/${test.type}/${token}/${user.id}`, '_blank');
    }
  };

  const getTimeInfo = () => {
    if (status === 'upcoming') {
      return `Starts in ${formatDistanceToNow(scheduledAt)} (${format(scheduledAt, 'PPpp')})`;
    } else if (status === 'ongoing') {
      return `Ends in ${formatDistanceToNow(expiresAt)}`;
    } else {
      return `Expired on ${format(expiresAt, 'PPpp')}`;
    }
  };

  // Determine if we should show results button
  const showResultsButton = status === 'expired' || isSubmitted || effectivelyTerminated;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{test.title}</CardTitle>
            <CardDescription>{test.course}</CardDescription>
          </div>
          <TestStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1.5">
              <Clock size={16} />
              <span>{getTimeInfo()}</span>
            </div>
            <div>
              <span className="font-medium">{test.totalMarks}</span> marks
            </div>
          </div>
          <div className="flex items-center justify-between">
            {test.type === 'MCQ' ? (
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText size={14} />
                Multiple Choice
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <Code size={14} />
                Coding Test
              </Badge>
            )}
            
            
            {isAutoSubmitted && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle size={14} className="mr-1" />
                Terminated
              </Badge>
            )}
            
            {isSubmitted && !isAutoSubmitted && (
              <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
                <CheckCircle size={14} className="mr-1" />
                Submitted
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-row gap-2 w-full">
          {status === 'expired' ? (
            <Button variant="outline" className="flex-1" disabled>
              Test Expired
            </Button>
          ) : effectivelyTerminated ? (
            <Button variant="destructive" className="flex-1" disabled>
              Terminated
            </Button>
          ) : isSubmitted ? (
            <Button variant="outline" className="flex-1" disabled>
              Submitted
            </Button>
          ) : isTestAvailable ? (
            <Button onClick={startTest} size="lg" className="flex-1">
              Start Test
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" disabled>
              Available {formatDistanceToNow(scheduledAt)}
            </Button>
          )}
          
          {showResultsButton && (
            <Button variant="outline" className="flex-1" asChild>
              <Link to={`/tests/${test._id}/result`}>View Result</Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

const Tests: React.FC = () => {
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({});
  const { user } = useAuth();
  const [testData, setTestData] = useState<TestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchTestsAndStatuses = async () => {
      try {
        setLoading(true);
  
        // Make parallel API requests for better performance
        const [testsRes, statusRes] = await Promise.all([
          axios.get('http://localhost:9001/student/tests/available'),
          axios.get(`http://localhost:9001/student/tests/status/${user.id}`)
        ]);
  
        if (testsRes.data.success && statusRes.data.success) {
          setTestData(testsRes.data.data);
          setTestStatuses(statusRes.data.data);
        } else {
          setError('Failed to fetch test or status data');
        }
      } catch (err) {
        setError('Failed to connect to the server');
        console.error('Error fetching tests or statuses:', err);
      } finally {
        setLoading(false);
      }
    };
  
    if (user?.id) {
      fetchTestsAndStatuses();
    }
  }, [user?.id]);
  
  if (loading) {
    return (
      <Layout title="Tests">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Tests">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Tests">
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Tests</h2>
          <p className="text-muted-foreground">
            Take assessment tests to evaluate your understanding.
          </p>
        </div>
        
        <Tabs 
          defaultValue="upcoming" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">
              Upcoming
              {testData?.upcoming && testData.upcoming.length > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-800">{testData.upcoming.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ongoing">
              Ongoing
              {testData?.ongoing && testData.ongoing.length > 0 && (
                <Badge className="ml-2 bg-green-100 text-green-800">{testData.ongoing.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired
              {testData?.expired && testData.expired.length > 0 && (
                <Badge className="ml-2 bg-gray-100 text-gray-800">{testData.expired.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="animate-fade-in">
            {testData?.upcoming && testData.upcoming.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testData.upcoming.map((test) => (
                  <TestCard 
                    key={test._id} 
                    test={test} 
                    status="upcoming" 
                    testStatus={testStatuses[test._id]} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming tests scheduled
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ongoing" className="animate-fade-in">
            {testData?.ongoing && testData.ongoing.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testData.ongoing.map((test) => (
                  <TestCard 
                    key={test._id} 
                    test={test} 
                    status="ongoing" 
                    testStatus={testStatuses[test._id]} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No tests currently in progress
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="expired" className="animate-fade-in">
            {testData?.expired && testData.expired.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testData.expired.map((test) => (
                  <TestCard 
                    key={test._id} 
                    test={test} 
                    status="expired" 
                    testStatus={testStatuses[test._id]} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No expired tests to show
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Tests;