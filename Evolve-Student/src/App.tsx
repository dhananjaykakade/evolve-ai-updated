
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Assignments from "./pages/Assignments";
import Tests from "./pages/Tests";
import Feedback from "./pages/Feedback";
import ChatRoom from "./pages/ChatRoom";
import AIChat from "./pages/AIChat";
import StudentGroups from "./pages/StudentGroups";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import TestTaking from "./pages/TestTaking";
import DeadlinesPage from "./pages/DeadlinesPage";
import FeedbackDetailsPage from "./pages/FeedbackDetailsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/tests/:id" element={<TestTaking />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/feedback/:id" element={<FeedbackDetailsPage />} />
            <Route path="/deadlines" element={<DeadlinesPage />} />
            <Route path="/chat-room" element={<ChatRoom />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/student-groups" element={<StudentGroups />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
