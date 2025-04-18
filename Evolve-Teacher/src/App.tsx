import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import Index from "./pages/Index";
import Assignments from "./pages/Assignments";
import Students from "./pages/Students";
import Chat from "./pages/Chat";
import AITools from "./pages/AITools";
import Resources from "./pages/Resources";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import LoginPage from "./components/login/loginform";
import { useAuth } from "./context/AuthContext";
import Tests from "./pages/Tests";
import TestDetail from "./pages/TestDetail";
import TestMonitoring from "./pages/testMonitoring";
import StudentResults from "./pages/studentResult";
import TeacherResultPage from "./pages/TeacherResultPage";

const queryClient = new QueryClient();

const App = () => (
  
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
              <Route path="/tests" element={<Tests />} />
              <Route path="/tests/:testId" element={<TestDetail />} />
            {/* 🔹 Protected Routes (Only for Logged-in Users) */}
              <Route path="/test-monitoring" element={<TestMonitoring />} />
              <Route path="/student-results" element={<StudentResults />} />
              <Route path="/results/:testId/:studentId/:testType" element={<TeacherResultPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/students" element={<Students />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/ai-tools" element={<AITools />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
