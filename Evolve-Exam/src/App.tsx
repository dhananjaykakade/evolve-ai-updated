
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TestProvider } from "./contexts/TestContext";
import Index from "./pages/Index";
import MCQTest from "./pages/MCQTest";
import CodingTest from "./pages/CodingTest";
import SubmittedTest from "./pages/SubmittedTest";
import NotFound from "./pages/NotFound";

// Create a new QueryClient instance
const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/test/mcq" element={<MCQTest />} />
    <Route path="/test/coding" element={<CodingTest />} />
    <Route path="/submitted" element={<SubmittedTest />} />
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
