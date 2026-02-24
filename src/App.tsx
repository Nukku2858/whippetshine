import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PressureWashing from "./pages/PressureWashing";
import PaymentSuccess from "./pages/PaymentSuccess";
import IntakeForm from "./pages/IntakeForm";
import CustomRequest from "./pages/CustomRequest";
import NotFound from "./pages/NotFound";
import { ScrollToTop } from "./components/ScrollToTop";
import { CartProvider } from "./contexts/CartContext";
import CartDrawer from "./components/CartDrawer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <CartDrawer />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pressure-washing" element={<PressureWashing />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/intake" element={<IntakeForm />} />
            <Route path="/custom-request" element={<CustomRequest />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
