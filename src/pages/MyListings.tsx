import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit, Trash2, Package, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";

const MyListings = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingProduct, setUpdatingProduct] = useState<string | null>(null);
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserProducts();
    }
  }, [user]);

  const fetchUserProducts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Fetching user products for:', user.id);
      
      // First try to get from the private products table
      const { data: privateProducts, error: privateError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (privateError) {
        console.error('Error fetching private products:', privateError);
      }

      // If no private products found, try to find products by matching user email/name from public table
      let userProducts: any[] = privateProducts || [];
      
      if (!userProducts.length) {
        console.log('No private products found, checking public products by user info...');
        const { data: publicProducts, error: publicError } = await supabase
          .from('products_public')
          .select('*')
          .eq('user_name', user.fullName || `${user.firstName} ${user.lastName}`.trim())
          .order('created_at', { ascending: false });

        if (publicError) {
          console.error('Error fetching public products:', publicError);
        } else if (publicProducts?.length) {
          console.log('Found products in public table:', publicProducts.length);
          // Convert public products to our format
          userProducts = publicProducts.map(item => ({
            id: item.id,
            unique_id: item.unique_id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            category: item.category,
            location: item.location,
            whatsapp_number: '', // Not available in public view
            image_url: item.image_url || '',
            user_id: user.id, // Set current user as owner
            user_email: user.emailAddresses[0]?.emailAddress || '',
            user_name: item.user_name,
            created_at: item.created_at,
            is_sold: item.is_sold
          }));
        }
      }

      // Map the data to our Product interface
      const mappedProducts: Product[] = userProducts.map(item => ({
        id: item.id,
        uniqueId: item.unique_id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        category: item.category,
        location: item.location,
        whatsappNumber: item.whatsapp_number || '',
        imageUrl: item.image_url || '',
        userId: item.user_id,
        userEmail: item.user_email,
        userName: item.user_name,
        createdAt: item.created_at,
        isSold: item.is_sold
      }));

      console.log(`Found ${mappedProducts.length} products for user`);
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching user products:', error);
      toast({
        title: "Error",
        description: "Failed to load your listings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSoldStatus = async (productId: string, currentStatus: boolean) => {
    try {
      setUpdatingProduct(productId);
      const { error } = await supabase
        .from('products')
        .update({ is_sold: !currentStatus })
        .eq('id', productId);
      
      if (error) {
        throw new Error(error.message);
      }

      setProducts(products.map(p => 
        p.id === productId ? { ...p, isSold: !currentStatus } : p
      ));
      
      toast({
        title: "Success",
        description: `Product marked as ${!currentStatus ? 'sold' : 'available'}`,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive"
      });
    } finally {
      setUpdatingProduct(null);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) {
        throw new Error(error.message);
      }

      setProducts(products.filter(p => p.id !== productId));
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
            <p className="text-muted-foreground">You need to be signed in to view your listings</p>
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
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            My Listings
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your product listings
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No listings yet</h2>
            <p className="text-muted-foreground mb-6">
              Start selling by creating your first product listing
            </p>
            <Button onClick={() => window.location.href = '/sell'}>
              Create Listing
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                {product.imageUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-1">
                      {product.name}
                    </CardTitle>
                    <Badge variant={product.isSold ? "secondary" : "default"}>
                      {product.isSold ? "Sold" : "Available"}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        ₹{product.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ID: {product.uniqueId}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>Category: {product.category}</p>
                      <p>Location: {product.location}</p>
                      <p>Listed: {new Date(product.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={product.isSold ? "outline" : "secondary"}
                        onClick={() => toggleSoldStatus(product.id, product.isSold)}
                        disabled={updatingProduct === product.id}
                        className="flex-1"
                      >
                        {updatingProduct === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : product.isSold ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        <span className="ml-2">
                          {product.isSold ? "Mark Available" : "Mark Sold"}
                        </span>
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyListings;
