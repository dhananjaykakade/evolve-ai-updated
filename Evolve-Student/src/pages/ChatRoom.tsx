
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, User, Send, Clock, Search, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: number;
  content: string;
  sender: 'user' | 'other' | 'teacher' | 'ai';
  time: string;
  isLiked?: boolean;
  likes?: number;
  replies?: ChatMessage[];
}

interface ChatThread {
  id: number;
  title: string;
  lastActivity: string;
  messages: ChatMessage[];
  participants: number;
}

const ChatRoomSidebar: React.FC<{
  threads: ChatThread[];
  activeThread: number; 
  setActiveThread: (id: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}> = ({ threads, activeThread, setActiveThread, searchQuery, setSearchQuery }) => {
  // Filter threads based on search query
  const filteredThreads = threads.filter(thread => 
    thread.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full md:w-64 border-r md:h-[calc(100vh-16rem)]">
      <div className="p-4 border-b">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search threads..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            size={14}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
        </div>
      </div>
      
      <div className="overflow-y-auto h-full">
        {filteredThreads.length > 0 ? (
          filteredThreads.map((thread) => (
            <div
              key={thread.id}
              className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                thread.id === activeThread ? 'bg-muted' : ''
              }`}
              onClick={() => setActiveThread(thread.id)}
            >
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare size={14} className="text-primary" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-medium text-sm truncate">{thread.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Clock size={12} className="mr-1" />
                    {thread.lastActivity}
                    <span className="mx-1">•</span>
                    <span>{thread.participants} participants</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No threads found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

const ChatMessage: React.FC<{message: ChatMessage}> = ({ message }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [isLiked, setIsLiked] = useState(message.isLiked || false);
  const [likesCount, setLikesCount] = useState(message.likes || 0);
  
  const getSenderAvatar = () => {
    switch (message.sender) {
      case 'user':
        return (
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
        );
      case 'teacher':
        return (
          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-4 h-4">
              <path d="M10 8.75a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75z" />
              <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.76 14.3A6.5 6.5 0 0110 17a6.5 6.5 0 01-4.24-2.7zM4.7 5.76A6.5 6.5 0 017 4.24v3.5a.75.75 0 01-.75.75h-3.5a6.5 6.5 0 011.95-2.73zM7 9.5v3.26a6.5 6.5 0 01-2.73-1.95h2.23a.75.75 0 01.75.75v3.5a6.5 6.5 0 01-2.73-1.95h2.23a.75.75 0 01.5-.19zm2.25 4.5h.5a.75.75 0 01.75.75v3.5a6.5 6.5 0 01-2 0v-3.5a.75.75 0 01.75-.75zm3.75 0a.75.75 0 00-.75.75v3.26a6.5 6.5 0 002.73-1.95h-2.23a.75.75 0 00-.75.75v3.5a6.5 6.5 0 002.73-1.95h-2.23a.75.75 0 00-.5-.19zm2.5-9.5h-3.5a.75.75 0 00-.75.75v3.5a.75.75 0 00.75.75h3.5A6.5 6.5 0 0013 4.24v3.5a.75.75 0 00.75.75h3.5a6.5 6.5 0 00-1.95-2.73z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'ai':
        return (
          <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-4 h-4">
              <path fillRule="evenodd" d="M2 10c0-3.967 3.69-7 8-7 4.31 0 8 3.033 8 7s-3.69 7-8 7a9.165 9.165 0 01-1.504-.123 5.976 5.976 0 01-3.935 1.107.75.75 0 01-.584-1.143 3.478 3.478 0 00.522-1.756C2.979 13.825 2 12.025 2 10z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <User size={14} className="text-muted-foreground" />
          </div>
        );
    }
  };
  
  const getSenderLabel = () => {
    switch (message.sender) {
      case 'user':
        return 'You';
      case 'teacher':
        return 'Teacher';
      case 'ai':
        return 'AI Assistant';
      default:
        return 'Anonymous';
    }
  };

  const handleLike = () => {
    if (isLiked) {
      setLikesCount(prevCount => prevCount - 1);
    } else {
      setLikesCount(prevCount => prevCount + 1);
    }
    setIsLiked(!isLiked);
  };
  
  return (
    <div className="flex gap-3 py-4">
      {getSenderAvatar()}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{getSenderLabel()}</span>
          <span className="text-xs text-muted-foreground">{message.time}</span>
        </div>
        <p className="text-sm mt-1">{message.content}</p>
        
        <div className="flex items-center gap-4 mt-2">
          <button 
            className={`text-xs ${isLiked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'} flex items-center gap-1`}
            onClick={handleLike}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388z" />
            </svg>
            {likesCount}
          </button>
          
          {message.replies && message.replies.length > 0 && (
            <button 
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              onClick={() => setShowReplies(!showReplies)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0110 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.947v5.05c0 1.456-.993 2.716-2.43 2.946a41.196 41.196 0 01-3.55.414c-.28.02-.521.18-.643.4l-1.712 3.082a.75.75 0 01-1.33 0l-1.713-3.082a.75.75 0 00-.642-.4 41.189 41.189 0 01-3.55-.414C1.993 13.237 1 11.977 1 10.521v-5.05c0-1.457.993-2.716 2.43-2.947z" clipRule="evenodd" />
              </svg>
              {message.replies.length} replies
            </button>
          )}
          
          <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.475l6.733-3.366A2.52 2.52 0 0113 4.5z" />
            </svg>
            Share
          </button>
        </div>
        
        {showReplies && message.replies && (
          <div className="mt-3 ml-6 space-y-3 border-l pl-3">
            {message.replies.map((reply, index) => (
              <div key={index} className="flex gap-2">
                {getSenderAvatar()}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs">{getSenderLabel()}</span>
                    <span className="text-xs text-muted-foreground">{reply.time}</span>
                  </div>
                  <p className="text-xs mt-1">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AskQuestionDialog = ({ onQuestionSubmit }: { onQuestionSubmit: (question: string, topic: string) => void }) => {
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter your question",
        variant: "destructive"
      });
      return;
    }
    
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your question",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate submission process
    setTimeout(() => {
      onQuestionSubmit(question, topic);
      setQuestion('');
      setTopic('');
      setIsSubmitting(false);
      
      toast({
        title: "Question Submitted",
        description: "Your question has been posted to the chatroom"
      });
    }, 1000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} className="mr-2" />
          Ask a Question
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ask a Question</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input 
                id="topic" 
                placeholder="E.g., Calculus, Physics, Literature" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question">Your Question</Label>
              <Textarea 
                id="question" 
                placeholder="Enter your question here..." 
                rows={5}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Be specific about what you need help with. Other students or teachers will answer your question.
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Submitting...
                </>
              ) : "Submit Question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ChatRoom: React.FC = () => {
  const [activeThread, setActiveThread] = useState(1);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discussions');
  const [myQuestions, setMyQuestions] = useState<ChatThread[]>([]);
  const { toast } = useToast();
  
  // Sample data - would come from API in real application
  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: 1,
      title: "Questions about Quantum Computing concepts",
      lastActivity: "5 minutes ago",
      participants: 8,
      messages: [
        {
          id: 1,
          content: "Can someone explain how quantum entanglement works in a way that's easier to understand than what's in the textbook?",
          sender: 'other',
          time: '1 hour ago',
          likes: 4,
          replies: [
            {
              id: 3,
              content: "Think of it like this: when two particles are entangled, they behave as a single system regardless of distance. When you measure one particle, you instantly know information about the other.",
              sender: 'teacher',
              time: '45 min ago',
            }
          ]
        },
        {
          id: 2,
          content: "I'm having trouble understanding the concept of quantum superposition. Can anyone provide a simple analogy?",
          sender: 'user',
          time: '30 min ago',
          likes: 2,
          replies: [
            {
              id: 4,
              content: "Imagine a coin spinning in the air - it's neither heads nor tails until it lands. Quantum particles are similar until measured.",
              sender: 'ai',
              time: '15 min ago',
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: "Calculus: Partial Differentiation Help",
      lastActivity: "2 hours ago",
      participants: 5,
      messages: [
        {
          id: 5,
          content: "I'm struggling with partial derivatives in multivariable calculus. Any resources or explanations would be helpful!",
          sender: 'other',
          time: '2 hours ago',
          likes: 3
        }
      ]
    },
    {
      id: 3,
      title: "Literature: Modernist Movement Discussion",
      lastActivity: "Yesterday",
      participants: 12,
      messages: [
        {
          id: 6,
          content: "Let's discuss key characteristics of modernist literature and how they differ from earlier movements.",
          sender: 'teacher',
          time: 'Yesterday',
          likes: 7
        }
      ]
    }
  ]);
  
  const activeThreadData = activeTab === 'discussions' 
    ? threads.find(t => t.id === activeThread) || threads[0]
    : myQuestions.find(t => t.id === activeThread);
  
  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now(),
        content: message,
        sender: 'user',
        time: 'Just now',
        likes: 0
      };
      
      if (activeTab === 'discussions') {
        const updatedThreads = threads.map(thread => {
          if (thread.id === activeThread) {
            return {
              ...thread,
              messages: [...thread.messages, newMessage],
              lastActivity: 'Just now'
            };
          }
          return thread;
        });
        
        setThreads(updatedThreads);
      } else if (activeTab === 'my-questions' && activeThreadData) {
        const updatedMyQuestions = myQuestions.map(thread => {
          if (thread.id === activeThread) {
            return {
              ...thread,
              messages: [...thread.messages, newMessage],
              lastActivity: 'Just now'
            };
          }
          return thread;
        });
        
        setMyQuestions(updatedMyQuestions);
      }
      
      setMessage('');
      
      toast({
        title: "Message Sent",
        description: "Your message has been posted to the chatroom"
      });
    }
  };

  const handleQuestionSubmit = (questionText: string, topic: string) => {
    const newThread: ChatThread = {
      id: Date.now(),
      title: topic,
      lastActivity: 'Just now',
      participants: 1,
      messages: [
        {
          id: Date.now(),
          content: questionText,
          sender: 'user',
          time: 'Just now',
          likes: 0
        }
      ]
    };
    
    setMyQuestions(prevQuestions => [newThread, ...prevQuestions]);
    setActiveTab('my-questions');
    setActiveThread(newThread.id);
  };
  
  return (
    <Layout title="Chat Room">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare size={24} className="text-primary" />
          <h2 className="text-3xl font-semibold tracking-tight">Anonymous Chat Room</h2>
        </div>
        <p className="text-muted-foreground">
          Ask questions and discuss course topics anonymously with your peers.
        </p>
        
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            <Tabs defaultValue="discussions" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-2 rounded-none">
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
                <TabsTrigger value="my-questions">My Questions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="discussions" className="m-0">
                <div className="flex flex-col md:flex-row">
                  <ChatRoomSidebar 
                    threads={threads} 
                    activeThread={activeThread}
                    setActiveThread={setActiveThread}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                  />
                  
                  {activeThreadData ? (
                    <div className="flex-1 flex flex-col h-[calc(100vh-16rem)]">
                      <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-medium">{activeThreadData.title}</h3>
                        <div className="text-xs text-muted-foreground">
                          {activeThreadData.participants} participants
                        </div>
                      </div>
                      
                      <div className="p-4 flex-1 overflow-y-auto">
                        <div className="divide-y">
                          {activeThreadData.messages.map((message) => (
                            <ChatMessage key={message.id} message={message} />
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-4 border-t">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1"
                          />
                          <Button onClick={handleSendMessage}>
                            <Send size={16} className="mr-2" />
                            Send
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-muted-foreground">Select a thread to view messages</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="my-questions" className="m-0">
                {myQuestions.length > 0 ? (
                  <div className="flex flex-col md:flex-row">
                    <ChatRoomSidebar 
                      threads={myQuestions} 
                      activeThread={activeThread}
                      setActiveThread={setActiveThread}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                    />
                    
                    {activeThreadData ? (
                      <div className="flex-1 flex flex-col h-[calc(100vh-16rem)]">
                        <div className="p-4 border-b flex items-center justify-between">
                          <h3 className="font-medium">{activeThreadData.title}</h3>
                          <div className="text-xs text-muted-foreground">
                            {activeThreadData.participants} participants
                          </div>
                        </div>
                        
                        <div className="p-4 flex-1 overflow-y-auto">
                          <div className="divide-y">
                            {activeThreadData.messages.map((message) => (
                              <ChatMessage key={message.id} message={message} />
                            ))}
                          </div>
                        </div>
                        
                        <div className="p-4 border-t">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Type your message..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                              className="flex-1"
                            />
                            <Button onClick={handleSendMessage}>
                              <Send size={16} className="mr-2" />
                              Send
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-muted-foreground">Select a question to view messages</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare size={40} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">You haven't asked any questions yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ask a question anonymously to get help from your peers and teachers.
                    </p>
                    <AskQuestionDialog onQuestionSubmit={handleQuestionSubmit} />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ChatRoom;
