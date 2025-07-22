import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Package, TrendingUp, Activity, MoreVertical, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Product, User } from "@/types";
import { getProductsFromSupabase, deleteProductFromSupabase, getUsersFromSupabase } from "@/utils/supabaseStorage";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Check admin access
  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, usersData] = await Promise.all([
        getProductsFromSupabase(),
        getUsersFromSupabase()
      ]);
      
      // Sort products by creation date (newest first)
      const sortedProducts = productsData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setProducts(sortedProducts);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
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
        toast({
          title: "Product Deleted",
          description: "Product has been removed from the marketplace",
        });
        loadData(); // Refresh the products list
      } else {
        throw new Error(result.error || 'Failed to delete product');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the product",
        variant: "destructive"
      });
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold mb-2 text-red-600">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the admin panel
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate statistics
  const totalRevenue = products.filter(p => p.isSold).reduce((sum, p) => sum + p.price, 0);
  const averagePrice = products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length) : 0;
  const activeProducts = products.filter(p => !p.isSold);
  const soldProducts = products.filter(p => p.isSold);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-red-600" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage users and marketplace listings
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeProducts.length} active, {soldProducts.length} sold
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From sold items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{averagePrice.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all listings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
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
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showActions={true}
                    onDelete={handleDeleteProduct}
                    onRefresh={loadData}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  No products have been listed yet
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-muted rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-3 bg-muted rounded w-1/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-4">
                {users.map(user => (
                  <Card key={user.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-2xl font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  No users have registered yet
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPanel;