import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);

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
      console.log('Fetched products for user:', { userId: user.id, count: myProducts.length });
    } catch (error) {
      console.error('Error fetching products:', error);
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
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to delete products",
        variant: "destructive"
      });
      return;
    }

    console.log('=== DELETION INITIATED ===');
    console.log('User attempting deletion:', { userId: user.id, productId });

    setDeletingProduct(productId);
    
    try {
      const result = await deleteProductFromSupabase(productId, user.id);
      
      console.log('Deletion result:', result);
      
      if (result.success) {
        // Remove the product from local state immediately
        setProducts(prevProducts => {
          const updatedProducts = prevProducts.filter(p => p.id !== productId);
          console.log('Updated local state:', { 
            before: prevProducts.length, 
            after: updatedProducts.length 
          });
          return updatedProducts;
        });
        
        toast({
          title: "Product deleted successfully",
          description: "Your item has been removed from the marketplace"
        });
        
        console.log('✅ Product deletion completed successfully');
        
        // Refresh the list to ensure sync
        setTimeout(() => {
          fetchMyProducts();
        }, 1000);
        
      } else {
        console.error('❌ Deletion failed:', result.error);
        toast({
          title: "Deletion Failed",
          description: result.error || "Failed to delete product. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Unexpected error during deletion:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the product",
        variant: "destructive"
      });
    } finally {
      setDeletingProduct(null);
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
                      <div key={product.id} className="relative">
                        <ProductCard
                          product={product}
                          showActions={true}
                          onEdit={handleEditProduct}
                          onDelete={(productId) => {
                            // This will be handled by the AlertDialog in ProductCard
                          }}
                          onRefresh={fetchMyProducts}
                        />
                        
                        {/* Enhanced Delete Confirmation */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={deletingProduct === product.id}
                            >
                              {deletingProduct === product.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{product.name}"? 
                                <br />
                                <strong>This action cannot be undone.</strong>
                                <br />
                                <small className="text-muted-foreground">
                                  Product ID: {product.uniqueId}
                                </small>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deletingProduct === product.id}
                              >
                                {deletingProduct === product.id ? 'Deleting...' : 'Delete Product'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
                      <div key={product.id} className="relative">
                        <ProductCard
                          product={product}
                          showActions={true}
                          onEdit={handleEditProduct}
                          onDelete={(productId) => {
                            // This will be handled by the AlertDialog
                          }}
                          onRefresh={fetchMyProducts}
                        />
                        
                        {/* Enhanced Delete Confirmation for Sold Items */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={deletingProduct === product.id}
                            >
                              {deletingProduct === product.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Sold Product</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the sold item "{product.name}"? 
                                <br />
                                <strong>This will permanently remove it from your sales history.</strong>
                                <br />
                                <small className="text-muted-foreground">
                                  Product ID: {product.uniqueId}
                                </small>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deletingProduct === product.id}
                              >
                                {deletingProduct === product.id ? 'Deleting...' : 'Delete Product'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
