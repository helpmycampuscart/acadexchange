import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ShoppingBag, PlusCircle, List, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const isAdmin = user?.emailAddresses[0]?.emailAddress === 'admin@campuscart.com';

  const actions = [
    {
      title: "Browse Marketplace",
      description: "Discover amazing deals from fellow students",
      icon: ShoppingBag,
      action: () => navigate('/marketplace'),
      color: "bg-blue-500"
    },
    {
      title: "Sell an Item",
      description: "List your items and start earning",
      icon: PlusCircle,
      action: () => navigate('/sell'),
      color: "bg-green-500"
    },
    {
      title: "My Listings",
      description: "Manage your posted items",
      icon: List,
      action: () => navigate('/my-listings'),
      color: "bg-purple-500"
    }
  ];

  if (isAdmin) {
    actions.push({
      title: "Admin Panel",
      description: "Manage users and all listings",
      icon: Settings,
      action: () => navigate('/admin'),
      color: "bg-red-500"
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome back, {user?.firstName || 'Student'}! 👋
            </h1>
            <p className="text-xl text-muted-foreground">
              What would you like to do today?
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actions.map((action, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={action.action}
              >
                <CardHeader className="text-center">
                  <div className={`mx-auto w-16 h-16 ${action.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{action.title}</CardTitle>
                  <CardDescription className="text-center">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 p-6 bg-card rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">Quick Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">1000+</div>
                <div className="text-muted-foreground">Total Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-500">500+</div>
                <div className="text-muted-foreground">Active Sellers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-500">3</div>
                <div className="text-muted-foreground">Cities Covered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;