
import { useState } from "react";
import { ArrowRight, Package, Users, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStats } from "@/hooks/useStats";
import { motion } from "framer-motion";
import SparklesPreview from "@/components/sparkles-demo";
import WorldMapDemo from "@/components/world-map-demo";

const HomePage = () => {
  const { stats } = useStats();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section with Sparkles */}
      <header className="relative">
        <SparklesPreview />
      </header>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-3xl font-bold text-primary mb-2">
                {stats.totalProducts}+
              </div>
              <div className="text-muted-foreground">Products</div>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-3xl font-bold text-primary mb-2">
                {stats.totalUsers}+
              </div>
              <div className="text-muted-foreground">Sign ups</div>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-3xl font-bold text-primary mb-2">
                100+
              </div>
              <div className="text-muted-foreground">Cities</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* World Map Section */}
      <WorldMapDemo />

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose acadexchange?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple, secure, and designed for students across India
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <Package className="h-12 w-12 text-primary mx-auto mb-4" aria-hidden="true" />
                  <h3 className="text-xl font-semibold mb-2">Easy Selling</h3>
                  <p className="text-muted-foreground">
                    List your textbooks, electronics, and furniture in seconds with our simple form
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" aria-hidden="true" />
                  <h3 className="text-xl font-semibold mb-2">Campus Community</h3>
                  <p className="text-muted-foreground">
                    Connect with verified students from your city and college
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-4" aria-hidden="true" />
                  <h3 className="text-xl font-semibold mb-2">Great Deals</h3>
                  <p className="text-muted-foreground">
                    Find quality books, electronics, and furniture at student-friendly prices
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-3xl font-bold mb-4">Available Across India</h3>
            <p className="text-muted-foreground">
              Serving students in 100+ cities across major states including Delhi, Mumbai, Bangalore, and more
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {[
              'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune',
              'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur',
              'Indore', 'Bhopal', 'Visakhapatnam', 'Vadodara', 'Coimbatore', 'Agra',
              'Varanasi', 'Madurai', 'Meerut', 'Rajkot', 'Kota', 'Gwalior'
            ].map((city, index) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Badge variant="secondary" className="text-sm px-3 py-1 w-full justify-center">
                  {city}
                </Badge>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <p className="text-muted-foreground text-sm">
              ...and many more cities across India
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
