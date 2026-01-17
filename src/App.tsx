import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import LoanIngest from "@/pages/LoanIngest";
import LoansList from "@/pages/LoansList";
import LoanDetail from "@/pages/LoanDetail";
import LoanSearch from "@/pages/LoanSearch";
import LoanCompare from "@/pages/LoanCompare";
import APIExport from "@/pages/APIExport";
import TestExtraction from "@/pages/TestExtraction";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LoanIngest />} />
            <Route path="/loans" element={<LoansList />} />
            <Route path="/loans/:id" element={<LoanDetail />} />
            <Route path="/loans/search" element={<LoanSearch />} />
            <Route path="/loans/compare" element={<LoanCompare />} />
            <Route path="/api" element={<APIExport />} />
            <Route path="/test" element={<TestExtraction />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
