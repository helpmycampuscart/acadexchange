import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initializeDemoData } from "@/utils/storage";
import Footer from "@/components/Footer";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    initializeDemoData();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Logo/Title */}
          <div className="space-y-4">
            <div className="mx-auto w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              MyCampusCart
            </h1>
            <p className="text-xl text-muted-foreground">
              Your campus marketplace for buying and selling student items
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </SignInButton>
            </SignedOut>
            
            <SignedIn>
              <Button 
                size="lg" 
                onClick={() => navigate('/dashboard')}
                className="group"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </SignedIn>

            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/marketplace')}
            >
              Browse Marketplace
            </Button>
          </div>

          {/* Simple Info */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Available in Hyderabad, Pune & Bangalore</p>
            <p>Free to use • Safe & Secure</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;