
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  MessageCircle, 
  Users, 
  Bot, 
  ArrowRight
} from 'lucide-react';

interface QuickLinkProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  color: string;
}

const QuickLink: React.FC<QuickLinkProps> = ({ 
  icon, 
  title, 
  description, 
  to, 
  color 
}) => {
  return (
    <Link to={to}>
      <Card className="glass-card h-full transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] group cursor-pointer">
        <CardContent className="p-4 flex flex-col h-full">
          <div 
            className={`h-10 w-10 rounded-full flex items-center justify-center mb-3 ${color}`}
          >
            {icon}
          </div>
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1 flex-1">{description}</p>
          <div className="flex items-center gap-1 text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Get started</span>
            <ArrowRight size={12} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const QuickLinks: React.FC = () => {
  const links = [
    {
      icon: <Upload size={16} className="text-white" />,
      title: "Submit Assignment",
      description: "Upload your completed work for grading",
      to: "/assignments",
      color: "bg-blue-500",
    },
    {
      icon: <MessageCircle size={16} className="text-white" />,
      title: "Ask a Question",
      description: "Post questions to the anonymous chat room",
      to: "/chat-room",
      color: "bg-green-500",
    },
    {
      icon: <Users size={16} className="text-white" />,
      title: "Join Study Group",
      description: "Connect with peers in your interest area",
      to: "/student-groups",
      color: "bg-purple-500",
    },
    {
      icon: <Bot size={16} className="text-white" />,
      title: "Chat with AI",
      description: "Get instant help with your studies",
      to: "/ai-chat",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {links.map((link, index) => (
        <QuickLink
          key={index}
          icon={link.icon}
          title={link.title}
          description={link.description}
          to={link.to}
          color={link.color}
        />
      ))}
    </div>
  );
};

export default QuickLinks;
