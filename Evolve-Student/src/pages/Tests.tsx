import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, FileText, Code, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
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

const TestCard = ({ test, status }: { test: Test; status: 'upcoming' | 'ongoing' | 'expired' }) => {
  const now = new Date();
  const scheduledAt = new Date(test.scheduledAt);
  const expiresAt = new Date(test.expiresAt);
  
  const isTestAvailable = status === 'ongoing' || 
    (status === 'upcoming' && now >= scheduledAt && now <= expiresAt);

  const startTest = () => {
    if (isTestAvailable) {
      window.open(`http://localhost:8084/test/${test._id}`, '_blank');
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
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {status === 'expired' ? (
          <div className="flex flex-row gap-2">
  <Button variant="outline" className="w-full" disabled>
    Test Expired
  </Button>
  <Button variant="outline" className="w-full" asChild>
    <Link to={`/tests/${test._id}/result`}>View Result</Link>
  </Button>
</div>

        
        ) : isTestAvailable ? (
          <Button onClick={startTest} size="lg" className="w-full">
            Start Test
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Available {formatDistanceToNow(scheduledAt)}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const Tests: React.FC = () => {
  const [testData, setTestData] = useState<TestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:9001/student/tests/available');
        if (response.data.success) {
          setTestData(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch tests');
        }
      } catch (err) {
        setError('Failed to connect to the server');
        console.error('Error fetching tests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

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
        
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="animate-fade-in">
            {testData?.upcoming && testData.upcoming.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testData.upcoming.map((test) => (
                  <TestCard key={test._id} test={test} status="upcoming" />
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
                  <TestCard key={test._id} test={test} status="ongoing" />
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
                  <TestCard key={test._id} test={test} status="expired" />
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