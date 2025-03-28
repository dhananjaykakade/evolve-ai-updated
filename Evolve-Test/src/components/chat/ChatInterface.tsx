
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Send,
  Paperclip,
  MoreVertical,
  Search,
  BrainCircuit,
  User,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  sender: "teacher" | "student" | "ai";
  content: string;
  timestamp: string;
  read?: boolean;
}

const initialMessages: Message[] = [
  {
    id: "msg-1",
    sender: "student",
    content: "Hi Professor, I'm having trouble with Assignment 3. Can you help me understand the requirements for the database design section?",
    timestamp: "10:24 AM",
    read: true,
  },
  {
    id: "msg-2",
    sender: "teacher",
    content: "Of course! For the database design section, you need to create an ER diagram and implement at least 3 normalized tables. Make sure to include proper relationships and constraints.",
    timestamp: "10:26 AM",
  },
  {
    id: "msg-3",
    sender: "student",
    content: "Thank you! Can you clarify what you mean by 'normalized tables'? Is that related to the normal forms we discussed in class?",
    timestamp: "10:28 AM",
    read: true,
  },
  {
    id: "msg-4",
    sender: "teacher",
    content: "Yes, exactly. You should apply the normalization principles (1NF, 2NF, and 3NF) that we covered. Remember to eliminate redundancy and ensure appropriate dependencies.",
    timestamp: "10:30 AM",
  },
  {
    id: "msg-5",
    sender: "ai",
    content: "The AI assistant has suggested additional resources for database normalization: 1. Chapter 4 in your textbook has excellent examples of normalization. 2. There's a helpful video tutorial on the course website under 'Week 5 Resources'.",
    timestamp: "10:31 AM",
  },
  {
    id: "msg-6",
    sender: "student",
    content: "That's very helpful! I'll check out those resources. One more question - for the relationships, should we use crow's foot notation or another specific format?",
    timestamp: "10:33 AM",
    read: true,
  },
];

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [activeChat, setActiveChat] = useState("Anonymous Student 1");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chats = [
    { id: "chat-1", name: "Anonymous Student 1", unread: 2, active: true, time: "10:33 AM" },
    { id: "chat-2", name: "Anonymous Student 2", unread: 0, active: false, time: "Yesterday" },
    { id: "chat-3", name: "Anonymous Student 3", unread: 1, active: false, time: "Sep 12" },
    { id: "chat-4", name: "Anonymous Student 4", unread: 0, active: false, time: "Sep 10" },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const message: Message = {
      id: `msg-${messages.length + 1}`,
      sender: "teacher",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Simulate a student reply after a short delay
    setTimeout(() => {
      const reply: Message = {
        id: `msg-${messages.length + 2}`,
        sender: "student",
        content: "Thank you for the explanation! That makes more sense now.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: true,
      };
      setMessages((prevMessages) => [...prevMessages, reply]);
    }, 3000);
  };

  return (
    <div className="flex h-[calc(100vh-14rem)] overflow-hidden rounded-xl border">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 shrink-0">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Recent Conversations</h3>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Badge className="text-xs" variant="secondary">
                4 Active Chats
              </Badge>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden border-t">
          <ScrollArea className="h-full">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 border-b p-3 transition-colors hover:bg-muted/50",
                  chat.name === activeChat && "bg-accent"
                )}
                onClick={() => setActiveChat(chat.name)}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="truncate font-medium">{chat.name}</p>
                    <span className="text-xs text-muted-foreground">{chat.time}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    Assignment 3 discussion...
                  </p>
                </div>
                {chat.unread > 0 && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {chat.unread}
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b p-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">{activeChat}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-success"></div>
                <span>Online now</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Clock className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === "teacher" && "justify-end",
                    message.sender === "ai" && "justify-center"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.sender === "teacher" &&
                        "rounded-br-none bg-primary text-primary-foreground",
                      message.sender === "student" && "rounded-bl-none bg-secondary",
                      message.sender === "ai" &&
                        "max-w-[90%] bg-muted/80 text-xs text-muted-foreground"
                    )}
                  >
                    {message.sender === "ai" && (
                      <div className="mb-1 flex items-center gap-1">
                        <BrainCircuit className="h-3 w-3" />
                        <span className="font-medium">AI Assistant</span>
                      </div>
                    )}
                    <p>{message.content}</p>
                    <div
                      className={cn(
                        "mt-1 text-right text-xs",
                        message.sender === "teacher" && "text-primary-foreground/80",
                        message.sender !== "teacher" && "text-muted-foreground"
                      )}
                    >
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Message Input */}
        <div className="border-t p-3 shrink-0">
          <div className="relative">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[80px] resize-none pr-24"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="absolute bottom-2 right-2 flex space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                className="h-8 w-8"
                size="icon"
                onClick={handleSendMessage}
                disabled={newMessage.trim() === ""}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
