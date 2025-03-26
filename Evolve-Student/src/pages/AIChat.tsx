
import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, User, Send, Clock, Sparkles, Paperclip, X, File } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  isLoading?: boolean;
  attachment?: {
    name: string;
    type: string;
    size: string;
  };
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      content: "👋 Hello! I'm your AI learning assistant. I'm here to help with your studies. What would you like to know today?",
      sender: 'ai',
      timestamp: 'Just now'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      setAttachment(file);
      toast({
        title: "File attached",
        description: `${file.name} ready to send`,
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSendMessage = () => {
    if (inputMessage.trim() || attachment) {
      // Add user message
      const userMessage: ChatMessage = {
        id: messages.length + 1,
        content: inputMessage.trim(),
        sender: 'user',
        timestamp: 'Just now'
      };

      // Add attachment if present
      if (attachment) {
        userMessage.attachment = {
          name: attachment.name,
          type: attachment.type,
          size: `${(attachment.size / 1024).toFixed(2)} KB`
        };
      }
      
      // Add AI loading message
      const aiLoadingMessage: ChatMessage = {
        id: messages.length + 2,
        content: '',
        sender: 'ai',
        timestamp: 'Just now',
        isLoading: true
      };
      
      setMessages([...messages, userMessage, aiLoadingMessage]);
      setInputMessage('');
      setAttachment(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Simulate AI response after delay
      setTimeout(() => {
        let aiResponse = '';
        
        // Simple response logic based on user input
        const lowerCaseInput = inputMessage.toLowerCase();
        
        if (attachment) {
          aiResponse = `I've analyzed your uploaded file ${attachment.name}. `;
          
          if (attachment.type.includes('pdf')) {
            aiResponse += "Based on this PDF, I can see you're working on an academic paper. The structure looks good, but consider adding more references to strengthen your arguments.";
          } else if (attachment.type.includes('image')) {
            aiResponse += "Thanks for sharing this image. I can see it contains some data visualizations which are well structured. The color scheme could be improved for better readability.";
          } else {
            aiResponse += "I've reviewed the document you shared. It looks well organized, but there are a few areas where the content could be expanded with more examples.";
          }
        } else if (lowerCaseInput.includes('deadline') || lowerCaseInput.includes('due date')) {
          aiResponse = "I can help you keep track of deadlines. Your next assignment is due on October 15, 2023. Would you like me to remind you a day before?";
        } else if (lowerCaseInput.includes('quantum') || lowerCaseInput.includes('physics')) {
          aiResponse = "Quantum mechanics can be complex. I'd recommend starting with the concept of wave-particle duality. Would you like me to explain this concept in simple terms?";
        } else if (lowerCaseInput.includes('help') || lowerCaseInput.includes('stuck')) {
          aiResponse = "I'm here to help! Could you provide more details about what you're working on? That way I can give you more specific guidance.";
        } else if (lowerCaseInput.includes('thank')) {
          aiResponse = "You're welcome! Feel free to ask if you need help with anything else.";
        } else if (inputMessage.trim() === '') {
          aiResponse = "It seems you didn't type a message. How can I assist you today? Feel free to ask any questions about your studies.";
        } else {
          aiResponse = "That's an interesting question. I'd be happy to explore this topic with you. Could you share what you already know about it so I can tailor my explanation?";
        }
        
        // Replace loading message with actual response
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.isLoading ? { ...msg, content: aiResponse, isLoading: false } : msg
          )
        );
      }, 1500);
    }
  };
  
  const renderMessage = (message: ChatMessage) => {
    return (
      <div
        key={message.id}
        className={`flex gap-3 p-4 ${
          message.sender === 'user' ? 'bg-background' : 'bg-muted/30'
        }`}
      >
        {message.sender === 'ai' ? (
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Bot size={16} className="text-white" />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <User size={16} className="text-muted-foreground" />
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {message.sender === 'ai' ? 'AI Assistant' : 'You'}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock size={12} />
              {message.timestamp}
            </span>
          </div>
          
          {message.isLoading ? (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          ) : (
            <>
              {message.content && (
                <p className="text-sm mt-1 whitespace-pre-line">{message.content}</p>
              )}
              
              {message.attachment && (
                <div className="mt-2 bg-muted/50 rounded-md p-2 flex items-center gap-2 max-w-xs">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <File size={14} className="text-primary" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-medium truncate">{message.attachment.name}</p>
                    <p className="text-xs text-muted-foreground">{message.attachment.size}</p>
                  </div>
                </div>
              )}
            </>
          )}
          
          {message.sender === 'ai' && !message.isLoading && (
            <div className="flex items-center gap-4 mt-3">
              <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388z" />
                </svg>
                Helpful
              </button>
              <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388z" fillRule="evenodd" transform="rotate(180 10 8.5)" />
                </svg>
                Not helpful
              </button>
              <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.475l6.733-3.366A2.52 2.52 0 0113 4.5z" />
                </svg>
                Share
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const suggestedQuestions = [
    "Help me understand partial derivatives",
    "What's the main idea behind quantum computing?",
    "How do I structure a research paper?",
    "Explain the Renaissance period in simple terms",
  ];
  
  return (
    <Layout title="AI Chatbot">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Bot size={24} className="text-primary" />
          <h2 className="text-3xl font-semibold tracking-tight">AI Learning Assistant</h2>
        </div>
        <p className="text-muted-foreground">
          Get immediate help with your studies from our AI-powered assistant.
        </p>
        
        <Card className="glass-card overflow-hidden h-[calc(100vh-16rem)]">
          <CardContent className="p-0 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y">
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {messages.length === 1 && (
              <div className="p-4 bg-muted/30">
                <p className="text-sm font-medium mb-2">You can ask me about:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto py-2 text-sm"
                      onClick={() => {
                        setInputMessage(question);
                      }}
                    >
                      <Sparkles size={14} className="mr-2 text-primary" />
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {attachment && (
              <div className="p-2 border-t">
                <div className="bg-muted/50 rounded-md p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <File size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">{(attachment.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={removeAttachment}
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="p-4 border-t mt-auto">
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0"
                  onClick={triggerFileInput}
                  title="Attach a file"
                >
                  <Paperclip size={16} />
                </Button>
                <Input
                  placeholder="Ask anything about your studies..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} className="shrink-0">
                  <Send size={16} className="mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AIChat;
