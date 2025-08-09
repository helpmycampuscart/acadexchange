
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Users, Package, Shield, MoreVertical, UserCheck, UserX, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProductsFromSupabase, deleteProductFromSupabase, getUsersFromSupabase } from "@/utils/supabaseStorage";
import { Product, User } from "@/types";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'users'>('products');

  const isAdmin = user?.emailAddresses[0]?.emailAddress === 'abhinavpadige06@gmail.com' ||
                   user?.emailAddresses[0]?.emailAddress === 'admin@mycampuscart.com';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, usersData] = await Promise.all([
        getProductsFromSupabase(),
        getUsersFromSupabase()
      ]);
      
      setProducts(productsData);
      setUsers(usersData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
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
          description: "The product has been removed from the platform"
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

  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      
      const { error } = await supabase.rpc('update_user_role', {
        target_user_id: userId,
        new_role: newRole
      });

      if (error) {
        throw error;
      }

      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole as 'user' | 'admin' } : u
      ));

      toast({
        title: "User role updated",
        description: `User role changed to ${newRole}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
      
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setUsers(users.map(u => 
        u.id === userId ? { ...u, status: newStatus as 'active' | 'blocked' } : u
      ));

      toast({
        title: `User ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`,
        description: `User has been ${newStatus === 'blocked' ? 'blocked' : 'unblocked'}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  if (!isAdmin) {
    return null;
  }

  const stats = {
    totalProducts: products.length,
    totalUsers: users.length,
    soldProducts: products.filter(p => p.isSold).length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    blockedUsers: users.filter(u => u.status === 'blocked').length
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Admin Panel
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage users and monitor platform activity
            </p>
          </div>

          {/* Enhanced Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.soldProducts}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.adminUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
                <Ban className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.blockedUsers}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant={activeTab === 'products' ? 'default' : 'outline'}
              onClick={() => setActiveTab('products')}
            >
              <Package className="h-4 w-4 mr-2" />
              Products
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg">Loading...</div>
            </div>
          ) : (
            <>
              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>All Products</CardTitle>
                      <CardDescription>
                        Manage all products on the platform
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {products.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No products found
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {products.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              showActions={true}
                              onDelete={handleDeleteProduct}
                              onRefresh={fetchData}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Enhanced Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>All Users</CardTitle>
                      <CardDescription>
                        Manage user accounts, permissions, and status
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {users.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No users found
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Joined</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                    {user.role}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={user.status === 'blocked' ? 'destructive' : 'default'}>
                                    {user.status || 'active'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem
                                        onClick={() => handleToggleUserRole(user.id, user.role)}
                                      >
                                        {user.role === 'admin' ? (
                                          <>
                                            <UserX className="h-4 w-4 mr-2" />
                                            Remove Admin
                                          </>
                                        ) : (
                                          <>
                                            <UserCheck className="h-4 w-4 mr-2" />
                                            Make Admin
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleToggleUserStatus(user.id, user.status || 'active')}
                                      >
                                        {user.status === 'blocked' ? (
                                          <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Unblock User
                                          </>
                                        ) : (
                                          <>
                                            <Ban className="h-4 w-4 mr-2" />
                                            Block User
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPanel;
