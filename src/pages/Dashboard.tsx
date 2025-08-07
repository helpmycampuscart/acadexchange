
import { useNavigate } from "react-router-dom";
import { ShoppingBag, PlusCircle, List, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useClerkSync } from "@/hooks/useClerkSync";
import { useStats } from "@/hooks/useStats";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useClerkSync();
  const { stats, loading } = useStats();
  
  const isAdmin = user?.emailAddresses[0]?.emailAddress === 'abhinavpadige06@gmail.com' ||
                   user?.emailAddresses[0]?.emailAddress === 'admin@mycampuscart.com';

  const actions = [
    {
      title: "Browse Marketplace",
      description: "Discover amazing deals from fellow students",
      icon: ShoppingBag,
      action: () => navigate('/marketplace'),
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      title: "Sell an Item",
      description: "List your items and start earning",
      icon: PlusCircle,
      action: () => navigate('/sell'),
      gradient: "from-emerald-500 to-cyan-500"
    },
    {
      title: "My Listings",
      description: "Manage your posted items",
      icon: List,
      action: () => navigate('/my-listings'),
      gradient: "from-purple-500 to-cyan-500"
    }
  ];

  if (isAdmin) {
    actions.push({
      title: "Admin Panel",
      description: "Manage users and all listings",
      icon: Settings,
      action: () => navigate('/admin'),
      gradient: "from-red-500 to-cyan-500"
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section with Lamp Glow */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background"></div>
        <div className="container mx-auto px-6 py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
              Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Student'}! 
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your campus marketplace dashboard - What would you like to do today?
            </p>
          </motion.div>

          {/* Action Cards with Enhanced Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <BackgroundGradient className="rounded-[22px] p-1">
                  <Card 
                    className="glass-card hover-lift border-0 bg-card/95 backdrop-blur-md cursor-pointer group h-full"
                    onClick={action.action}
                  >
                    <CardHeader className="text-center pb-6">
                      <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 lamp-glow bg-gradient-to-r ${action.gradient} group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="h-10 w-10 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-foreground group-hover:text-glow transition-all duration-300">
                        {action.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-base">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button 
                        className="w-full premium-button text-primary-foreground font-semibold py-3"
                        size="lg"
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                </BackgroundGradient>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <BackgroundGradient className="rounded-[22px] p-1">
              <Card className="glass-card border-0 bg-card/95 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold gradient-text text-center">
                    Platform Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center group">
                      <div className="text-5xl font-bold gradient-text mb-2 group-hover:text-glow transition-all duration-300">
                        {loading ? '...' : stats.totalProducts}
                      </div>
                      <div className="text-muted-foreground font-medium">Total Products</div>
                    </div>
                    <div className="text-center group">
                      <div className="text-5xl font-bold gradient-text mb-2 group-hover:text-glow transition-all duration-300">
                        {loading ? '...' : stats.activeUsers}
                      </div>
                      <div className="text-muted-foreground font-medium">Active Users</div>
                    </div>
                    <div className="text-center group">
                      <div className="text-5xl font-bold gradient-text mb-2 group-hover:text-glow transition-all duration-300">
                        {loading ? '...' : stats.productsSold}
                      </div>
                      <div className="text-muted-foreground font-medium">Items Sold</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </BackgroundGradient>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
