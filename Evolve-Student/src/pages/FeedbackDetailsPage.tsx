
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  AlertCircle, 
  LightbulbIcon, 
  ArrowLeft, 
  MessageSquare, 
  BarChart 
} from 'lucide-react';

interface FeedbackDetail {
  id: number;
  title: string;
  subject: string;
  date: string;
  rating: number;
  content: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  score: {
    obtained: number;
    total: number;
  };
}

const FeedbackDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Sample data - would come from API in real application based on ID
  const feedbackDetails: Record<string, FeedbackDetail> = {
    "1": {
      id: 1,
      title: "Research Paper on Machine Learning",
      subject: "Computer Science",
      date: "Oct 10, 2023",
      rating: 4,
      content: "Your research paper on machine learning demonstrates a strong understanding of the core concepts and a good ability to analyze the theoretical frameworks. The introduction effectively sets up the scope of your investigation, and your methodology section is particularly well-structured. The literature review shows comprehensive reading of relevant sources, though there are some key recent publications that could have been included. The analysis section shows good critical thinking, but could benefit from more concrete examples or case studies to illustrate your points. The conclusion effectively summarizes your findings, though it could be strengthened by more explicit statements about the implications of your research and potential future directions.",
      strengths: [
        "Excellent analysis of neural network architectures",
        "Strong technical understanding of machine learning algorithms",
        "Well-structured paper with clear sections and transitions",
        "Comprehensive literature review covering foundational works"
      ],
      weaknesses: [
        "Limited discussion of practical applications",
        "Some mathematical notations inconsistent throughout the paper",
        "A few references are outdated (pre-2018)",
        "Conclusion could be more forward-looking"
      ],
      suggestions: [
        "Include a case study demonstrating real-world application",
        "Standardize mathematical notation throughout the paper",
        "Add more recent references, especially from 2020-2023",
        "Expand on future research directions in the conclusion"
      ],
      score: {
        obtained: 87,
        total: 100
      }
    },
    "2": {
      id: 2,
      title: "History Essay on Renaissance",
      subject: "History",
      date: "Oct 8, 2023",
      rating: 3,
      content: "Your essay on the Renaissance period demonstrates a solid understanding of the historical context and key events. The thesis is clearly stated and your arguments are structured logically. Your analysis of the social changes during this period is particularly insightful. However, the essay would benefit from more primary sources to support your arguments. While you've included several secondary sources, incorporating more direct quotations or references from period documents would strengthen your historical analysis. Additionally, the conclusion feels somewhat abrupt and could do more to tie together the various threads of your argument into a cohesive whole.",
      strengths: [
        "Clear thesis statement and logical structure",
        "Good contextual understanding of the Renaissance period",
        "Effective analysis of social and cultural changes",
        "Engaging writing style with good flow between sections"
      ],
      weaknesses: [
        "Limited use of primary sources",
        "Some generalizations without sufficient supporting evidence",
        "Inadequate consideration of economic factors",
        "Conclusion lacks depth and comprehensive synthesis"
      ],
      suggestions: [
        "Incorporate more primary sources from the period",
        "Provide specific examples to support broader claims",
        "Add a section addressing economic influences on Renaissance art",
        "Expand the conclusion to better synthesize your arguments"
      ],
      score: {
        obtained: 78,
        total: 100
      }
    }
  };

  const feedback = feedbackDetails[id as string];
  
  if (!feedback) {
    return (
      <Layout title="Feedback Details">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-medium mb-2">Feedback not found</h2>
          <p className="text-muted-foreground mb-4">The feedback you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/feedback')}>
            Back to Feedback
          </Button>
        </div>
      </Layout>
    );
  }

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={i < rating ? 'currentColor' : 'none'}
          stroke={i < rating ? 'none' : 'currentColor'}
          className={`h-4 w-4 ${i < rating ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      ));
  };

  return (
    <Layout title="Feedback Details">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={() => navigate('/feedback')}
          >
            <ArrowLeft size={16} />
            Back to Feedback
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold tracking-tight">{feedback.title}</h2>
            <Badge className="px-2 py-1">{feedback.subject}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              {feedback.date}
            </p>
            <div className="flex items-center gap-1">{renderStars(feedback.rating)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-primary" />
                  AI Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{feedback.content}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs space-y-2">
                    {feedback.strengths.map((strength, idx) => (
                      <li key={idx} className="flex gap-1.5">
                        <span className="text-green-500 font-bold">+</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-500" />
                    Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs space-y-2">
                    {feedback.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex gap-1.5">
                        <span className="text-amber-500 font-bold">!</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <LightbulbIcon size={16} className="text-blue-500" />
                    Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs space-y-2">
                    {feedback.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex gap-1.5">
                        <span className="text-blue-500 font-bold">→</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart size={16} className="text-primary" />
                  Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold">
                    {feedback.score.obtained}
                    <span className="text-lg text-muted-foreground">/{feedback.score.total}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-4">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(feedback.score.obtained / feedback.score.total) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round((feedback.score.obtained / feedback.score.total) * 100)}% Score
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  View Original Submission
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Request Additional Feedback
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FeedbackDetailsPage;
