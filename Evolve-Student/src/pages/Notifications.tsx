
import React from 'react';
import Layout from '@/components/layout/Layout';
import { 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  Bot, 
  Bell,
  Sparkles,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

interface Notification {
  id: number;
  type: 'deadline' | 'assignment' | 'chat' | 'ai' | 'feedback';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const NotificationItem: React.FC<{notification: Notification}> = ({ notification }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'deadline':
        return <Calendar size={16} className="text-status-pending" />;
      case 'assignment':
        return <BookOpen size={16} className="text-primary" />;
      case 'chat':
        return <MessageSquare size={16} className="text-status-completed" />;
      case 'ai':
        return <Bot size={16} className="text-purple-500" />;
      case 'feedback':
        return <Sparkles size={16} className="text-blue-400" />;
    }
  };

  return (
    <div className={`p-4 transition-colors hover:bg-muted/50 ${notification.read ? '' : 'bg-primary/5'}`}>
      <div className="flex gap-4">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h3 className={`text-sm ${notification.read ? '' : 'font-medium'}`}>
            {notification.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {notification.description}
          </p>
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            <span>{notification.time}</span>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between gap-2">
          {!notification.read && (
            <div className="h-2 w-2 rounded-full bg-primary"></div>
          )}
          <div className="flex gap-1">
            {!notification.read && (
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <CheckCircle2 size={14} />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Notifications: React.FC = () => {
  // Sample data - would come from API in real application
  const notifications: Notification[] = [
    {
      id: 1,
      type: 'deadline',
      title: 'Upcoming deadline: Research Paper',
      description: 'Your research paper on Quantum Computing is due in 24 hours.',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 2,
      type: 'feedback',
      title: 'New AI feedback available',
      description: 'Your Physics Lab Report has received AI-generated feedback.',
      time: '3 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'chat',
      title: 'New response in Chat Room',
      description: 'Someone responded to your question about calculus.',
      time: '5 hours ago',
      read: true,
    },
    {
      id: 4,
      type: 'assignment',
      title: 'New assignment added',
      description: 'Data Visualization Project has been added to your assignments.',
      time: '1 day ago',
      read: true,
    },
    {
      id: 5,
      type: 'ai',
      title: 'Resource suggestion from AI Assistant',
      description: 'AI Chatbot suggested a new resource for your research on machine learning.',
      time: '2 days ago',
      read: true,
    },
    {
      id: 6,
      type: 'deadline',
      title: 'Assignment deadline updated',
      description: 'The deadline for Mathematics Problem Set has been extended by 2 days.',
      time: '3 days ago',
      read: true,
    },
    {
      id: 7,
      type: 'chat',
      title: 'New topic in Chat Room',
      description: 'A new discussion thread about Literature Review techniques has been created.',
      time: '4 days ago',
      read: true,
    },
  ];

  const unreadNotifications = notifications.filter(n => !n.read);
  const allNotifications = notifications;

  return (
    <Layout title="Notifications">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={24} className="text-primary" />
            <h2 className="text-3xl font-semibold tracking-tight">Notifications</h2>
          </div>
          <Button variant="outline" size="sm">
            Mark all as read
          </Button>
        </div>
        <p className="text-muted-foreground">
          Stay updated with important alerts about your assignments, feedback, and messages.
        </p>
        
        <Tabs defaultValue="unread" className="w-full">
          <Card className="glass-card">
            <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
              <TabsTrigger value="unread" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Unread ({unreadNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                All ({allNotifications.length})
              </TabsTrigger>
            </TabsList>
            
            <CardContent className="p-0">
              <TabsContent value="unread" className="m-0">
                {unreadNotifications.length > 0 ? (
                  <div className="divide-y">
                    {unreadNotifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <CheckCircle2 size={48} className="text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">All caught up!</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You've read all your notifications.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="all" className="m-0">
                <div className="divide-y">
                  {allNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Notifications;
