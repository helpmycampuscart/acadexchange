
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const DebugInfo = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [userCount, setUserCount] = useState<number>(0);
  const [productCount, setProductCount] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);

  const fetchCounts = async () => {
    try {
      const { count: users } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      const { count: products } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      setUserCount(users || 0);
      setProductCount(products || 0);
    } catch (error) {
      console.error('Error fetching debug counts:', error);
    }
  };

  const forceSync = async () => {
    if (!user) return;
    
    try {
      const { syncUserWithSupabase } = await import('@/integrations/supabase/client');
      const email = user.emailAddresses[0]?.emailAddress || '';
      const name = user.fullName || user.firstName || 'Anonymous';
      
      const result = await syncUserWithSupabase(user.id, email, name);
      
      toast({
        title: result.success ? "Sync successful" : "Sync failed",
        description: result.error || "User data synced successfully",
        variant: result.success ? "default" : "destructive"
      });
      
      if (result.success) {
        fetchCounts();
      }
    } catch (error) {
      console.error('Force sync error:', error);
      toast({
        title: "Sync error",
        description: "Failed to sync user data",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  if (!isVisible) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        Debug
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">Debug Info</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsVisible(false)}
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>Users in DB: {userCount}</div>
        <div>Products in DB: {productCount}</div>
        <div>Current User: {user?.emailAddresses[0]?.emailAddress || 'Not logged in'}</div>
        <div>User ID: {user?.id || 'None'}</div>
        <Button 
          size="sm" 
          onClick={fetchCounts}
          className="w-full"
        >
          Refresh
        </Button>
        {user && (
          <Button 
            size="sm" 
            onClick={forceSync}
            variant="outline"
            className="w-full"
          >
            Force Sync User
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
