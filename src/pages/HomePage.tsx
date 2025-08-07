
import { useNavigate } from "react-router-dom";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { ArrowRight, ShoppingBag, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { SparklesCore } from "@/components/ui/sparkles";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section with Sparkles */}
      <section className="relative overflow-hidden bg-background min-h-screen flex items-center justify-center">
        {/* Sparkles Background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="tsparticles"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#22c55e"
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-secondary/30 to-transparent h-[5px] w-1/4 blur-sm" />

        {/* Content */}
        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                  MyCampusCart
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Your Ultimate Campus Marketplace - Buy and sell student items with ease across Hyderabad, Pune & Bangalore
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.6,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="lg" className="premium-button text-lg px-8 py-4">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignInButton>
              </SignedOut>
              
              <SignedIn>
                <Button 
                  size="lg" 
                  className="premium-button text-lg px-8 py-4"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignedIn>

              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/marketplace')}
                className="hover-lift border-primary/30 text-lg px-8 py-4"
              >
                Browse Products
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.9,
                duration: 0.8,
              }}
              className="flex items-center justify-center space-x-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>1000+ Students</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Safe & Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-4 w-4" />
                <span>500+ Items Sold</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-background [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </section>

      {/* Features Section with Enhanced Cards */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose MyCampusCart?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We make buying and selling on campus simple, safe, and convenient
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingBag,
                title: "Easy to Use",
                description: "List items in minutes with our simple interface"
              },
              {
                icon: Users,
                title: "Campus Community",
                description: "Connect with students in your area for easy meetups"
              },
              {
                icon: Shield,
                title: "Safe & Secure",
                description: "University email verification and secure transactions"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <BackgroundGradient className="rounded-[22px] p-1">
                  <Card className="glass-card hover-lift border-0 bg-card/90 backdrop-blur-md h-full">
                    <CardHeader className="text-center">
                      <feature.icon className="h-12 w-12 text-primary mb-4 mx-auto" />
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </BackgroundGradient>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: "1000+", label: "Active Users" },
              { value: "500+", label: "Items Sold" },
              { value: "3", label: "Cities" },
              { value: "24/7", label: "Support" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
