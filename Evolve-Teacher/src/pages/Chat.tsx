
import React from "react";
import { DashboardLayout } from "@/components/layout/Dashboard";
import { ChatInterface } from "@/components/chat/ChatInterface";

const Chat = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4 py-4">
        <div>
          <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">
            Anonymous Chat Support
          </h1>
          <p className="text-muted-foreground">
            Chat with students anonymously to answer questions and provide guidance
          </p>
        </div>
        
        <div>
          <ChatInterface />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
