
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ClerkSupabaseProvider } from "@/components/ClerkSupabaseProvider";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

// Updated Clerk publishable key
const CLERK_PUBLISHABLE_KEY = "pk_test_c3dlZXQtbWFsYW11dGUtNjUuY2xlcmsuYWNjb3VudHMuZGV2JA";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ClerkSupabaseProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </ClerkSupabaseProvider>
    </ClerkProvider>
  </StrictMode>
);
