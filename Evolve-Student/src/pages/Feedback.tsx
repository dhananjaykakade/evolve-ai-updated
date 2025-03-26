
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BookOpen, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FeedbackItem {
  id: number;
  title: string;
  subject: string;
  date: string;
  rating: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  generalComments: string;
}

const FeedbackCard: React.FC<{feedback: FeedbackItem}> = ({ feedback }) => {
  const renderStars = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={i < feedback.rating ? 'currentColor' : 'none'}
          stroke={i < feedback.rating ? 'none' : 'currentColor'}
          className={`h-4 w-4 ${i < feedback.rating ? 'text-primary' : 'text-muted'}`}
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
    <Card className="glass-card transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} className="text-primary" />
              <CardTitle className="text-lg font-medium">{feedback.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{feedback.subject}</Badge>
              <span className="text-xs text-muted-foreground">{feedback.date}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {renderStars()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="strengths">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="strengths">Strengths</TabsTrigger>
            <TabsTrigger value="improvements">Improvements</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>
          <TabsContent value="strengths" className="space-y-2 mt-4 min-h-[150px]">
            <ul className="space-y-2">
              {feedback.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <div className="h-5 w-5 rounded-full bg-status-completed/10 flex items-center justify-center text-status-completed shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {strength}
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="improvements" className="space-y-2 mt-4 min-h-[150px]">
            <ul className="space-y-2">
              {feedback.weaknesses.map((weakness, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <div className="h-5 w-5 rounded-full bg-status-pending/10 flex items-center justify-center text-status-pending shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {weakness}
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="suggestions" className="space-y-2 mt-4 min-h-[150px]">
            <ul className="space-y-2">
              {feedback.suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <ArrowUpRight size={12} />
                  </div>
                  {suggestion}
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
        
        <div>
          <h4 className="text-sm font-medium mb-2">General Comments</h4>
          <p className="text-sm text-muted-foreground">{feedback.generalComments}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const Feedback: React.FC = () => {
  // Sample data - would come from API in real application
  const feedbacks: FeedbackItem[] = [
    {
      id: 1,
      title: "Research Paper on Machine Learning",
      subject: "Computer Science",
      date: "October 10, 2023",
      rating: 4,
      strengths: [
        "Excellent literature review with comprehensive coverage of key papers",
        "Well-structured methodology section with clear experimental design",
        "Strong analysis of neural network performance on the dataset"
      ],
      weaknesses: [
        "Limited discussion of practical applications",
        "Some technical jargon not adequately explained for broader audience",
        "Conclusion could be more comprehensive with future work suggestions"
      ],
      suggestions: [
        "Add a section on real-world applications of your model",
        "Consider including a glossary for technical terms",
        "Expand the conclusion to discuss limitations and future research directions"
      ],
      generalComments: "Overall, this is a strong research paper that demonstrates excellent technical understanding of machine learning concepts. With some refinements to improve accessibility and practical relevance, this could be publication-quality work."
    },
    {
      id: 2,
      title: "History Essay on Renaissance",
      subject: "History",
      date: "October 8, 2023",
      rating: 3,
      strengths: [
        "Strong thesis statement and clear argument throughout",
        "Good use of historical context to frame the Renaissance period",
        "Effective organization of information by themes"
      ],
      weaknesses: [
        "Limited use of primary sources",
        "Some claims lack sufficient evidence",
        "Overgeneralization in parts of the analysis"
      ],
      suggestions: [
        "Incorporate more primary sources to strengthen historical analysis",
        "Provide specific examples to support your broader claims",
        "Consider addressing counter-arguments to strengthen your thesis"
      ],
      generalComments: "Your essay presents a solid overview of the Renaissance period with a clear argument. To elevate this work to the next level, focus on incorporating more primary sources and specific historical evidence to support your analysis. Your writing style is engaging, but the argument needs stronger evidentiary support."
    }
  ];

  return (
    <Layout title="AI Feedback">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles size={24} className="text-primary" />
          <h2 className="text-3xl font-semibold tracking-tight">AI-Generated Feedback</h2>
        </div>
        <p className="text-muted-foreground">
          Review personalized feedback on your submitted assignments.
        </p>
        
        <div className="space-y-6">
          {feedbacks.map((feedback) => (
            <FeedbackCard key={feedback.id} feedback={feedback} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Feedback;
