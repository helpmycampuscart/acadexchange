import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Users, Package, TrendingUp, Activity, MoreVertical, Shield, AlertTriangle, UserCheck, UserX, Crown, Mail, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Product, User as UserType } from "@/types";
import { getProductsFromSupabase, deleteProductFromSupabase, getUsersFromSupabase } from "@/utils/supabaseStorage";
import { useToast } from "@/hooks/use-toast";

const AdminPanel = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  // Check if user is admin
  const isAdmin = user?.emailAddresses[0]?.emailAddress === 'abhinavpadige06@gmail.com' ||
                   user?.emailAddresses[0]?.emailAddress === 'admin@mycampuscart.com';

  // Redirect if not admin
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

  const handleSuspendUser = (userId: string) => {
    // In a real app, this would call an API to suspend the user
    toast({
      title: "User Suspended",
      description: "User has been suspended from the platform",
    });
  };

  const handleDeleteUser = (userId: string) => {
    // In a real app, this would call an API to delete the user
    toast({
      title: "User Deleted",
      description: "User account has been permanently deleted",
      variant: "destructive"
    });
  };

  const handleMakeAdmin = (userId: string) => {
    // In a real app, this would call an API to update user role
    toast({
      title: "Admin Role Granted",
      description: "User has been granted admin privileges",
    });
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

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
  const adminUsers = users.filter(u => u.role === 'admin');
  const regularUsers = users.filter(u => u.role === 'user');

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
          <Card className="glass-card">
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

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                {adminUsers.length} admins, {regularUsers.length} users
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
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

          <Card className="glass-card">
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
          <TabsList className="glass-card">
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="users">User Management ({users.length})</TabsTrigger>
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
            {/* User Management Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="text-muted-foreground">Manage all registered users</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <Card key={index} className="glass-card animate-pulse">
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
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-4">
                {filteredUsers.map(user => (
                  <Card key={user.id} className="glass-card hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-lg font-semibold text-primary">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {user.role === 'admin' && (
                              <Crown className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-lg">{user.name}</h3>
                              <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                {user.role}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{user.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="text-xs text-muted-foreground">
                                Products listed: {products.filter(p => p.userEmail === user.email).length}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                  <span>{selectedUser?.name}</span>
                                  {selectedUser?.role === 'admin' && (
                                    <Crown className="h-5 w-5 text-yellow-500" />
                                  )}
                                </DialogTitle>
                                <DialogDescription>
                                  User account details and activity
                                </DialogDescription>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Email</label>
                                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Role</label>
                                      <p className="text-sm text-muted-foreground capitalize">{selectedUser.role}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Join Date</label>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Products Listed</label>
                                      <p className="text-sm text-muted-foreground">
                                        {products.filter(p => p.userEmail === selectedUser.email).length}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">Recent Products</label>
                                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                                      {products
                                        .filter(p => p.userEmail === selectedUser.email)
                                        .slice(0, 5)
                                        .map(product => (
                                          <div key={product.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                            <span className="text-sm">{product.name}</span>
                                            <Badge variant={product.isSold ? "secondary" : "default"}>
                                              {product.isSold ? "Sold" : "Active"}
                                            </Badge>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {user.role !== 'admin' && (
                                <DropdownMenuItem onClick={() => handleMakeAdmin(user.id)}>
                                  <Crown className="mr-2 h-4 w-4" />
                                  Make Admin
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                                <UserX className="mr-2 h-4 w-4" />
                                Suspend User
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem 
                                    className="text-red-600 focus:text-red-600"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Delete User
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the user
                                      account and all associated data.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-2xl font-semibold mb-2">
                  {userSearch ? 'No users found' : 'No users registered'}
                </h3>
                <p className="text-muted-foreground">
                  {userSearch ? 'Try adjusting your search terms' : 'No users have registered yet'}
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