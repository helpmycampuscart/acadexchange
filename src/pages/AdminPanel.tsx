import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
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
import { Product, User as UserType } from "@/types";
import { getProducts, deleteProduct, getUsers } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

const AdminPanel = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.emailAddresses[0]?.emailAddress === 'admin@campuscart.com';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [isAdmin, navigate]);

  const loadData = () => {
    setLoading(true);
    try {
      const allProducts = getProducts();
      const allUsers = getUsers();
      
      // Sort products by creation date (newest first)
      allProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setProducts(allProducts);
      setUsers(allUsers);
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

  const handleDeleteProduct = (productId: string) => {
    try {
      deleteProduct(productId);
      toast({
        title: "Product Deleted",
        description: "Product has been removed successfully",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the product",
        variant: "destructive"
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access the admin panel.
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

  const activeProducts = products.filter(p => !p.isSold);
  const soldProducts = products.filter(p => p.isSold);
  const totalRevenue = soldProducts.reduce((sum, p) => sum + p.price, 0);
  const averagePrice = products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Admin Panel
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage platform users and listings
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
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
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From sold items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{Math.round(averagePrice).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all listings</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">All Products</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Product Management</h2>
                <p className="text-muted-foreground">View and manage all listings</p>
              </div>
              <Badge variant="secondary">{products.length} total</Badge>
            </div>

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
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  No products have been listed yet.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">User Management</h2>
                <p className="text-muted-foreground">View and manage platform users</p>
              </div>
              <Badge variant="secondary">{users.length} users</Badge>
            </div>

            {users.length > 0 ? (
              <div className="grid gap-4">
                {users.map(user => (
                  <Card key={user.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>View Listings</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Block User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  No users have registered yet.
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