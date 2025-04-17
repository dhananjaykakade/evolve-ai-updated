
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TestProvider } from "./contexts/TestContext";
import TestInstructions from "./pages/TestInstructions";
import MCQTest from "./pages/MCQTest";
import CodingTest from "./pages/CodingTest";
import SubmittedTest from "./pages/SubmittedTest";
import TestTerminated from "./pages/TestTerminated";
import TestError from "./pages/TestError";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route 
      path="/" 
      element={<Navigate to="/error" replace />} 
    />
    <Route path="/test/:testId/:testType/:token/:userId" element={<TestInstructions />} />
    <Route path="/test/mcq/:testId" element={<MCQTest />} />
    <Route path="/test/coding/:testId" element={<CodingTest />} />
    <Route path="/submitted" element={<SubmittedTest />} />
    <Route path="/terminated" element={<TestTerminated />} />
    <Route path="/error" element={<TestError />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" closeButton richColors />
          <BrowserRouter>
            <TestProvider>
              <AppRoutes />
            </TestProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
