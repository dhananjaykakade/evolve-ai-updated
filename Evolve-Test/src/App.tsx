
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter,createBrowserRouter,RouterProvider , Routes, Route } from "react-router-dom";
import { TestProvider } from "./contexts/TestContext";
import Index from "./pages/Index";
import MCQTest from "./pages/MCQTest";
import CodingTest from "./pages/CodingTest";
import TestSubmitted from "./pages/TestSubmitted";
import NotFound from "./pages/NotFound";
import {EvaluationPortal } from "./components/ApiTester";
import { EvaluationLayout } from './components/EvaluationLayout';
import { WebSandboxPage } from './components/WebSandbox';
import { NodeSandboxPage } from './components/NodeSandboxPage';
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <EvaluationLayout />,
    children: [
      {
        path: 'web',
        element: <WebSandboxPage />,
      },
      {
        path: 'node',
        element: <NodeSandboxPage />,
      },
      {
        index: true,
        element: <WebSandboxPage />, // Default to web sandbox
      },
    ],
  },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TestProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mcq-test" element={<MCQTest />} />
            <Route path="/coding-test" element={<CodingTest />} />
            <Route path="/api-test" element={<EvaluationPortal/>} />
            <Route path="/test-submitted" element={<TestSubmitted />} />
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </TooltipProvider>
      </TestProvider>
    </BrowserRouter>
    <RouterProvider router={router} />
  </QueryClientProvider>
);

export default App;
