
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, FileText, Code } from 'lucide-react';

// Mock data for available tests
const mockTests = {
  mcq: [
    {
      id: 'mcq-1',
      title: 'Midterm Mathematics Quiz',
      subject: 'Mathematics',
      duration: 45,
      questions: 20,
      difficulty: 'Medium',
      type: 'mcq'
    },
    {
      id: 'mcq-2',
      title: 'Physics Chapter 3 Assessment',
      subject: 'Physics',
      duration: 30,
      questions: 15,
      difficulty: 'Hard',
      type: 'mcq'
    },
    {
      id: 'mcq-3',
      title: 'History Pop Quiz',
      subject: 'History',
      duration: 20,
      questions: 10,
      difficulty: 'Easy',
      type: 'mcq'
    }
  ],
  programming: [
    {
      id: 'prog-1',
      title: 'Data Structures Implementation',
      subject: 'Computer Science',
      duration: 60,
      questions: 3,
      difficulty: 'Hard',
      type: 'programming',
      languages: ['JavaScript', 'Python', 'Java']
    },
    {
      id: 'prog-2',
      title: 'Web Development Challenge',
      subject: 'Web Programming',
      duration: 45,
      questions: 2,
      difficulty: 'Medium',
      type: 'programming',
      languages: ['JavaScript', 'HTML/CSS']
    }
  ]
};

const DifficultyBadge = ({ level }: { level: string }) => {
  const colorMap: Record<string, string> = {
    'Easy': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Hard': 'bg-red-100 text-red-800'
  };
  
  return (
    <Badge className={`font-medium ${colorMap[level] || ''}`}>
      {level}
    </Badge>
  );
};

const TestCard = ({ test }: { test: any }) => {
  const startTest = () => {
    window.open('http://localhost:8084/', '_blank');
  };
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{test.title}</CardTitle>
            <CardDescription>{test.subject}</CardDescription>
          </div>
          {test.type === 'mcq' ? (
            <FileText size={20} className="text-muted-foreground" />
          ) : (
            <Code size={20} className="text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1.5">
              <Clock size={16} />
              <span>{test.duration} mins</span>
            </div>
            <div>
              <span className="font-medium">{test.questions}</span> questions
            </div>
          </div>
          <div className="flex items-center justify-between">
            <DifficultyBadge level={test.difficulty} />
            {test.type === 'programming' && (
              <div className="text-xs text-muted-foreground">
                {test.languages.join(', ')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link to={`/tests/${test.id}`} className="w-full">
        <Button onClick={startTest} size="lg"
          >Start Test</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

const Tests: React.FC = () => {



  return (
    <Layout title="Tests">
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Tests</h2>
          <p className="text-muted-foreground">
            Take assessment tests to evaluate your understanding.
          </p>
        </div>
        
        <Tabs defaultValue="mcq" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="mcq">Multiple Choice</TabsTrigger>
            <TabsTrigger value="programming">Programming</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mcq" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTests.mcq.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="programming" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTests.programming.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Tests;
