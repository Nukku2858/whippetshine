import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import PressureWashing from "./pages/PressureWashing";
import PaymentSuccess from "./pages/PaymentSuccess";
import IntakeForm from "./pages/IntakeForm";
import CustomRequest from "./pages/CustomRequest";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import ResetPassword from "./pages/ResetPassword";
import Fleet from "./pages/Fleet";
import Admin from "./pages/Admin";
import AdminChat from "./pages/AdminChat";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { ScrollToTop } from "./components/ScrollToTop";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import CartDrawer from "./components/CartDrawer";
import ChatBot from "./components/ChatBot";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: true });
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: "#00000000" });
    }
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <CartDrawer />
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/home" element={<Index />} />
              <Route path="/pressure-washing" element={<PressureWashing />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/intake" element={<IntakeForm />} />
              <Route path="/custom-request" element={<CustomRequest />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/fleet" element={<Fleet />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/chat" element={<AdminChat />} />
              <Route path="/admin/chat/:conversationId" element={<AdminChat />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatBot />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
