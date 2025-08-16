
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Package, Trash2 } from "lucide-react";
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
      console.log('Fetching products for user:', user.id);
      
      // Get all products and filter by user ID
      const allProducts = await getProductsFromSupabase();
      console.log('All products fetched:', allProducts.length);
      
      // Debug: Check if any products have this user ID
      const userProducts = allProducts.filter(product => {
        console.log('Checking product:', {
          productId: product.id,
          productUserId: product.userId,
          currentUserId: user.id,
          matches: product.userId === user.id
        });
        return product.userId === user.id;
      });
      
      console.log('User products found:', userProducts.length);
      setProducts(userProducts);
      
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
      const result = await deleteProductFromSupabase(productId);
      
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
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold mb-4">Please sign in to view your listings</h1>
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
      
      <div className="flex-1 container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                My Listings
              </h1>
              <p className="text-sm md:text-lg text-muted-foreground">
                Manage your posted items and track your sales
              </p>
            </div>
            <Button 
              onClick={() => navigate('/sell')} 
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm"
            >
              <PlusCircle className="h-4 w-4" />
              List New Item
            </Button>
          </div>

          {/* Statistics Cards - Mobile Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
            <Card className="p-3 md:p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Total Listings</CardTitle>
                <Package className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg md:text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>
            
            <Card className="p-3 md:p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Active Listings</CardTitle>
                <Package className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg md:text-2xl font-bold text-green-600">{activeProducts.length}</div>
              </CardContent>
            </Card>
            
            <Card className="p-3 md:p-6 col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Sold Items</CardTitle>
                <Package className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-lg md:text-2xl font-bold text-blue-600">{soldProducts.length}</div>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="text-center py-8 md:py-12">
              <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-primary mx-auto mb-3 md:mb-4"></div>
              <div className="text-sm md:text-lg">Loading your listings...</div>
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
                <Package className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mb-4" />
                <CardTitle className="text-lg md:text-xl mb-2">No listings yet</CardTitle>
                <CardDescription className="text-center mb-6 max-w-md">
                  Start selling by listing your first item
                </CardDescription>
                <Button onClick={() => navigate('/sell')} className="flex items-center gap-2 text-sm">
                  <PlusCircle className="h-4 w-4" />
                  List Your First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 md:space-y-8">
              
              {/* Active Listings */}
              {activeProducts.length > 0 && (
                <div>
                  <h2 className="text-lg md:text-2xl font-bold mb-4">Active Listings ({activeProducts.length})</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {activeProducts.map((product) => (
                      <div key={product.id} className="relative group">
                        <ProductCard
                          product={product}
                          showActions={true}
                          onEdit={handleEditProduct}
                          onDelete={() => {}}
                          onRefresh={fetchMyProducts}
                        />
                        
                        {/* Mobile-friendly Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 h-8 w-8 p-0 opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                              disabled={deletingProduct === product.id}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-sm md:text-base">Delete Product</AlertDialogTitle>
                              <AlertDialogDescription className="text-xs md:text-sm">
                                Are you sure you want to delete "{product.name}"? 
                                <br />
                                <strong>This action cannot be undone.</strong>
                                <br />
                                <small className="text-muted-foreground">
                                  Product ID: {product.uniqueId}
                                </small>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                              <AlertDialogCancel className="w-full sm:w-auto text-sm">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-sm"
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
                  <h2 className="text-lg md:text-2xl font-bold mb-4">Sold Items ({soldProducts.length})</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {soldProducts.map((product) => (
                      <div key={product.id} className="relative group">
                        <ProductCard
                          product={product}
                          showActions={true}
                          onEdit={handleEditProduct}
                          onDelete={() => {}}
                          onRefresh={fetchMyProducts}
                        />
                        
                        {/* Mobile-friendly Delete Button for Sold Items */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 h-8 w-8 p-0 opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                              disabled={deletingProduct === product.id}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-sm md:text-base">Delete Sold Product</AlertDialogTitle>
                              <AlertDialogDescription className="text-xs md:text-sm">
                                Are you sure you want to delete the sold item "{product.name}"? 
                                <br />
                                <strong>This will permanently remove it from your sales history.</strong>
                                <br />
                                <small className="text-muted-foreground">
                                  Product ID: {product.uniqueId}
                                </small>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                              <AlertDialogCancel className="w-full sm:w-auto text-sm">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-sm"
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
