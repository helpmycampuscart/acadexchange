
import { useState, useEffect } from "react";
import { Package, ShoppingBag, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useClerkSync } from "@/hooks/useClerkSync";
import { useStats } from "@/hooks/useStats";
import { DebugInfo } from "@/components/DebugInfo";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user, isLoaded, isReady } = useClerkSync();
  const { stats, loading } = useStats();

  if (!isLoaded || !isReady) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
            <p className="text-muted-foreground">You need to be signed in to access the dashboard</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.firstName || 'Student'}!
          </h1>
          <p className="text-muted-foreground">
            Your campus marketplace dashboard
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card simple-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Products
                </CardTitle>
                <div className="text-2xl font-bold text-primary">
                  {loading ? "..." : stats.totalProducts}
                </div>
              </CardHeader>
              <CardContent>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card simple-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Items Sold
                </CardTitle>
                <div className="text-2xl font-bold text-primary">
                  {loading ? "..." : stats.productsSold}
                </div>
              </CardHeader>
              <CardContent>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                What would you like to do today?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex-col simple-hover"
                  onClick={() => window.location.href = '/sell'}
                >
                  <Plus className="h-6 w-6 mb-2" />
                  Sell Item
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex-col simple-hover"
                  onClick={() => window.location.href = '/marketplace'}
                >
                  <ShoppingBag className="h-6 w-6 mb-2" />
                  Browse
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex-col simple-hover"
                  onClick={() => window.location.href = '/my-listings'}
                >
                  <Package className="h-6 w-6 mb-2" />
                  My Listings
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex-col simple-hover"
                  onClick={() => window.location.href = '/marketplace'}
                >
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Trending
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
      <DebugInfo />
    </div>
  );
};

export default Dashboard;
