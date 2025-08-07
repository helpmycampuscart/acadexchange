
import { useNavigate } from "react-router-dom";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { ArrowRight, ShoppingBag, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LampDemo from "@/components/lamp-demo";
import { motion } from "framer-motion";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section with Lamp */}
      <LampDemo />

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

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Trading?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join thousands of students already using MyCampusCart to buy and sell items safely
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
