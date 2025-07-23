
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Edit, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { getProductsFromSupabase, deleteProductFromSupabase } from "@/utils/supabaseStorage";
import { useClerkSync } from "@/hooks/useClerkSync";

const MyListings = () => {
  const navigate = useNavigate();
  const { user } = useClerkSync();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/dashboard');
      return;
    }
    
    fetchMyProducts();
  }, [user, navigate]);

  const fetchMyProducts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const allProducts = await getProductsFromSupabase();
      const myProducts = allProducts.filter(product => product.userId === user.id);
      setProducts(myProducts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const result = await deleteProductFromSupabase(productId);
      if (result.success) {
        setProducts(products.filter(p => p.id !== productId));
        toast({
          title: "Product deleted successfully",
          description: "Your item has been removed from the marketplace"
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    // For now, just show a message that editing will be implemented
    toast({
      title: "Edit Feature",
      description: "Product editing feature will be available soon",
    });
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

  const soldProducts = products.filter(p => p.isSold);
  const activeProducts = products.filter(p => !p.isSold);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                My Listings
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your posted items and track your sales
              </p>
            </div>
            <Button onClick={() => navigate('/sell')} className="flex items-center space-x-2">
              <PlusCircle className="h-4 w-4" />
              <span>List New Item</span>
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeProducts.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sold Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{soldProducts.length}</div>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg">Loading your listings...</div>
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <CardTitle className="text-xl mb-2">No listings yet</CardTitle>
                <CardDescription className="text-center mb-6">
                  Start selling by listing your first item
                </CardDescription>
                <Button onClick={() => navigate('/sell')} className="flex items-center space-x-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>List Your First Item</span>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Active Listings */}
              {activeProducts.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Active Listings ({activeProducts.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        showActions={true}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                        onRefresh={fetchMyProducts}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sold Items */}
              {soldProducts.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Sold Items ({soldProducts.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {soldProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        showActions={true}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                        onRefresh={fetchMyProducts}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyListings;
