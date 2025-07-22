import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { ShoppingCart, Users, Shield, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { initializeDemoData } from "@/utils/storage";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-image.jpg";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    initializeDemoData();
  }, []);

  const features = [
    {
      icon: ShoppingCart,
      title: "Easy Buying & Selling",
      description: "List your items in seconds and discover great deals from fellow students"
    },
    {
      icon: Users,
      title: "Campus Community",
      description: "Trade safely within your trusted campus network"
    },
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "WhatsApp integration for direct, secure communication"
    },
    {
      icon: Star,
      title: "Best Prices",
      description: "Student-friendly prices on quality used items"
    }
  ];

  const stats = [
    { number: "1000+", label: "Active Users" },
    { number: "5000+", label: "Items Sold" },
    { number: "3", label: "Cities" },
    { number: "98%", label: "Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[80vh] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
                MyCampusCart
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
                Your Campus Marketplace - Buy and sell used items with fellow students across 
                <span className="text-green-400 font-semibold"> Hyderabad, Pune & Bangalore</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="hero" size="xl" className="group">
                    Start Shopping
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </SignInButton>
              </SignedOut>
              
              <SignedIn>
                <Button 
                  variant="hero" 
                  size="xl" 
                  onClick={() => navigate('/dashboard')}
                  className="group"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </SignedIn>

              <Button 
                variant="secondary" 
                size="xl"
                onClick={() => navigate('/marketplace')}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                Browse Items
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose MyCampusCart?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The trusted marketplace designed specifically for students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300">
                <CardContent className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Start Trading?
            </h2>
            <p className="text-xl text-white/90">
              Join thousands of students who are already buying and selling on MyCampusCart
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="secondary" size="xl">
                    Join Now - It's Free!
                  </Button>
                </SignInButton>
              </SignedOut>
              
              <SignedIn>
                <Button 
                  variant="secondary" 
                  size="xl"
                  onClick={() => navigate('/sell')}
                >
                  List Your First Item
                </Button>
              </SignedIn>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;