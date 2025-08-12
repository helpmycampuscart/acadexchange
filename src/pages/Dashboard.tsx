
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Users, TrendingUp, Plus, Package, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { DebugInfo } from "@/components/DebugInfo";
import { useToast } from "@/hooks/use-toast";
import { useStats } from "@/hooks/useStats";
import { getProductsFromSupabase } from "@/utils/supabaseStorage";
import { useClerkSync } from "@/hooks/useClerkSync";
import { Product } from "@/types";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isReady } = useClerkSync();
  const { toast } = useToast();
  const { stats, loading: statsLoading } = useStats();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products for dashboard...');
        const allProducts = await getProductsFromSupabase();
        
        // Get recent products (last 6)
        const recentProducts = allProducts
          .filter(p => !p.isSold)
          .slice(0, 6);
        
        setProducts(recentProducts);
        console.log('Fetched data:', { products: allProducts.length, users: stats.activeUsers });
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to fetch recent products",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (isReady) {
      fetchProducts();
    }
  }, [isReady, toast, stats.activeUsers]);

  const handleProductRefresh = async () => {
    const allProducts = await getProductsFromSupabase();
    const recentProducts = allProducts
      .filter(p => !p.isSold)
      .slice(0, 6);
    setProducts(recentProducts);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          
          {/* Welcome Section - Mobile Optimized */}
          <div className="text-center space-y-3 md:space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">
              Welcome to <span className="text-primary">CampusCart</span>
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Your campus marketplace for buying and selling items with fellow students
            </p>
            
            {/* Quick Action Buttons - Mobile First */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
              <Button 
                onClick={() => navigate('/sell')} 
                className="w-full sm:w-auto flex items-center gap-2 text-sm md:text-base"
              >
                <Plus className="h-4 w-4" />
                Sell Item
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/marketplace')}
                className="w-full sm:w-auto flex items-center gap-2 text-sm md:text-base"
              >
                <ShoppingBag className="h-4 w-4" />
                Browse Items
              </Button>
            </div>
          </div>

          {/* Stats Cards - Mobile Responsive Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            <Card className="p-3 md:p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Total Products</CardTitle>
                <Package className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg md:text-2xl font-bold">
                  {statsLoading ? '...' : stats.totalProducts}
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-3 md:p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Active Users</CardTitle>
                <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg md:text-2xl font-bold text-green-600">
                  {statsLoading ? '...' : stats.activeUsers}
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-3 md:p-6 col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Items Sold</CardTitle>
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg md:text-2xl font-bold text-blue-600">
                  {statsLoading ? '...' : stats.productsSold}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Actions - Mobile Friendly */}
          {user && (
            <Card className="p-4 md:p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
                <CardDescription className="text-sm">
                  Manage your marketplace activity
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/my-listings')}
                    className="w-full flex items-center gap-2 justify-start text-sm"
                  >
                    <Package className="h-4 w-4" />
                    My Listings
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/marketplace')}
                    className="w-full flex items-center gap-2 justify-start text-sm"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Browse All Items
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Products - Mobile Optimized */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3">
              <h2 className="text-xl md:text-2xl font-bold">Recent Products</h2>
              <Button 
                variant="outline" 
                onClick={() => navigate('/marketplace')}
                className="w-full sm:w-auto text-sm"
              >
                View All
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-8 md:py-12">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-primary mx-auto mb-3 md:mb-4"></div>
                <div className="text-sm md:text-base">Loading products...</div>
              </div>
            ) : products.length === 0 ? (
              <Card className="p-6 md:p-12">
                <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                  <Package className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg md:text-xl mb-2">No products available</CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      Be the first to list an item on the marketplace!
                    </CardDescription>
                  </div>
                  <Button onClick={() => navigate('/sell')} className="text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    List Your First Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onRefresh={handleProductRefresh}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mobile App Promotion */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between p-4 md:p-6 gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <Smartphone className="h-6 w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm md:text-base">Mobile Optimized</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Works great on your phone too!
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                📱 Mobile Ready
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
      <DebugInfo />
    </div>
  );
};

export default Dashboard;
