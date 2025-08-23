import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { XpProvider } from "@/context/XpContext";
import Index from "./pages/Index";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import './lib/firebase'; // Initialize Firebase

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <XpProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </XpProvider>
  </QueryClientProvider>
);

export default App;
