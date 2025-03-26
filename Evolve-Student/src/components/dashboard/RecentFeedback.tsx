
import React from 'react';
import { MessageSquareText, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FeedbackItemProps {
  title: string;
  excerpt: string;
  date: string;
  rating: number;
  subjectArea: string;
  id: number;
}

const FeedbackItem: React.FC<FeedbackItemProps> = ({ title, excerpt, date, rating, subjectArea, id }) => {
  const navigate = useNavigate();
  
  const renderStars = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={i < rating ? 'currentColor' : 'none'}
          stroke={i < rating ? 'none' : 'currentColor'}
          className={`h-3 w-3 ${i < rating ? 'text-primary' : 'text-muted-foreground'}`}
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

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/feedback/${id}`);
  };

  return (
    <div className="py-3 space-y-2 group transition-all cursor-pointer" onClick={handleViewDetails}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
            {title}
          </h3>
          <Badge variant="outline" className="text-[10px] h-4 px-1.5 py-0">
            {subjectArea}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">{excerpt}</p>
      <div className="flex items-center gap-1">{renderStars()}</div>
    </div>
  );
};

const RecentFeedback: React.FC = () => {
  const navigate = useNavigate();
  
  // Sample data - would come from API in real application
  const feedbacks = [
    {
      id: 1,
      title: "Research Paper on Machine Learning",
      excerpt: "Your analysis of neural networks is thorough, but consider expanding on the practical applications. The literature review section is excellent and well-researched.",
      date: "Oct 10, 2023",
      rating: 4,
      subjectArea: "CS",
    },
    {
      id: 2,
      title: "History Essay on Renaissance",
      excerpt: "Strong thesis and well-structured arguments. Work on incorporating more primary sources to strengthen your historical analysis and provide more context.",
      date: "Oct 8, 2023",
      rating: 3,
      subjectArea: "History",
    },
  ];

  const handleViewAll = () => {
    navigate('/feedback');
  };

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <MessageSquareText size={18} className="text-primary" />
          Recent AI Feedback
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1" onClick={handleViewAll}>
          View all <ArrowRight size={14} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {feedbacks.map((feedback) => (
            <FeedbackItem
              key={feedback.id}
              id={feedback.id}
              title={feedback.title}
              excerpt={feedback.excerpt}
              date={feedback.date}
              rating={feedback.rating}
              subjectArea={feedback.subjectArea}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentFeedback;
