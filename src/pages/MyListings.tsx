import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Plus, Package, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Product } from "@/types";
import { getProducts, deleteProduct } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const MyListings = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProducts();
    }
  }, [user]);

  const loadUserProducts = () => {
    setLoading(true);
    try {
      const allProducts = getProducts();
      const userEmail = user?.emailAddresses[0]?.emailAddress;
      const filtered = allProducts.filter(product => product.userEmail === userEmail);
      
      // Sort by creation date (newest first)
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setUserProducts(filtered);
    } catch (error) {
      console.error('Error loading user products:', error);
      toast({
        title: "Error",
        description: "Failed to load your listings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (productId: string) => {
    try {
      deleteProduct(productId);
      toast({
        title: "Product Deleted",
        description: "Your listing has been removed successfully",
      });
      loadUserProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the product",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product: Product) => {
    // For now, navigate to sell page with product data
    // In a real app, you'd have an edit form
    navigate('/sell', { state: { editProduct: product } });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to view your listings</h1>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const soldProducts = userProducts.filter(p => p.isSold);
  const activeProducts = userProducts.filter(p => !p.isSold);
  const totalRevenue = soldProducts.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              My Listings
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your products and track sales
            </p>
          </div>
          <Button onClick={() => navigate('/sell')} size="lg" className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Add New Listing
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProducts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeProducts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{soldProducts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">₹{totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Listings */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-card rounded-lg p-6 animate-pulse">
                <div className="aspect-video bg-muted rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : userProducts.length > 0 ? (
          <div className="space-y-8">
            {/* Active Listings */}
            {activeProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-2xl font-semibold">Active Listings</h2>
                  <Badge variant="secondary">{activeProducts.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {activeProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showActions={true}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onRefresh={loadUserProducts}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sold Listings */}
            {soldProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-2xl font-semibold">Sold Items</h2>
                  <Badge variant="secondary">{soldProducts.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {soldProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showActions={true}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onRefresh={loadUserProducts}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-semibold mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-6">
              Start selling by creating your first listing
            </p>
            <Button onClick={() => navigate('/sell')} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Listing
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyListings;