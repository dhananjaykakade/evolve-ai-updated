
import React, { useState } from 'react';
import { 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Calendar, BookOpen, MessageSquare, Bot, Sparkles, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  type: 'deadline' | 'assignment' | 'chat' | 'ai' | 'feedback';
  title: string;
  time: string;
  read: boolean;
}

const NotificationDropdown: React.FC = () => {
  const { toast } = useToast();
  // Sample data - would come from API in real application
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'deadline',
      title: 'Research Paper due in 24 hours',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 2,
      type: 'feedback',
      title: 'New AI feedback on your Physics Lab Report',
      time: '3 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'chat',
      title: 'New response to your question about calculus',
      time: '5 hours ago',
      read: true,
    },
    {
      id: 4,
      type: 'assignment',
      title: 'New assignment added: Data Visualization Project',
      time: '1 day ago',
      read: true,
    },
    {
      id: 5,
      type: 'ai',
      title: 'AI Chatbot suggested a new resource for your research',
      time: '2 days ago',
      read: true,
    },
  ]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
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

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast({
      title: "Notifications",
      description: "All notifications marked as read",
    });
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed",
    });
  };

  const viewAllNotifications = () => {
    window.location.href = '/notifications';
  };

  return (
    <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
      <DropdownMenuLabel className="flex items-center justify-between">
        <span>Notifications</span>
        <span 
          className="text-xs text-primary cursor-pointer" 
          onClick={markAllAsRead}
        >
          Mark all as read
        </span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <DropdownMenuItem 
            key={notification.id} 
            className="flex items-start gap-2 p-3 cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className={`text-sm line-clamp-2 ${notification.read ? 'text-muted-foreground' : 'font-medium'}`}>
                {notification.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
            </div>
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1"></div>
            )}
            <button 
              className="p-1 hover:bg-muted rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                deleteNotification(notification.id);
              }}
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          </DropdownMenuItem>
        ))
      ) : (
        <div className="py-4 text-center text-muted-foreground text-sm">
          No notifications
        </div>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem 
        className="flex justify-center text-primary text-sm cursor-pointer"
        onClick={viewAllNotifications}
      >
        View all notifications
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
};

export default NotificationDropdown;
