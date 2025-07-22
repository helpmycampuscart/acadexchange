import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import SellPage from "./pages/SellPage";
import MyListings from "./pages/MyListings";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import { saveUser } from "@/utils/storage";
import { User as UserType } from "@/types";

const queryClient = new QueryClient();

const UserManager = () => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      // Save/update user in local storage
      const userData: UserType = {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        name: user.fullName || user.firstName || 'Anonymous',
        role: user.emailAddresses[0]?.emailAddress === 'admin@campuscart.com' ? 'admin' : 'user',
        createdAt: user.createdAt?.toISOString() || new Date().toISOString()
      };
      
      saveUser(userData);
    }
  }, [user, isLoaded]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <UserManager />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/sell" element={<SellPage />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/admin" element={<AdminPanel />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
