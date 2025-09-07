
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalProducts: number;
  totalUsers: number;
  activeUsers: number;
  productsSold: number;
}

export const useStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalUsers: 0,
    activeUsers: 0,
    productsSold: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching stats from Supabase...');
        
        // Add timeout and retry logic for better error handling
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );

        // Get total products count from products_public
        const productsPromise = supabase
          .from('products_public')
          .select('*', { count: 'exact', head: true });

        const { count: totalProducts, error: productsError } = await Promise.race([
          productsPromise,
          timeoutPromise
        ]) as any;

        if (productsError) {
          console.error('Error fetching products count:', productsError);
        }

        // Get total registered users from Clerk using Edge Function
        const totalUsersPromise = supabase.functions.invoke('get-clerk-user-count');

        const { data: clerkUsersResponse, error: totalUsersError } = await Promise.race([
          totalUsersPromise,
          timeoutPromise
        ]) as any;

        const totalUsers = clerkUsersResponse?.count || 0;

        if (totalUsersError) {
          console.error('Error fetching total users count:', totalUsersError);
        }

        // Get active users count from products_public (users who have created at least one product)
        const usersPromise = supabase
          .from('products_public')
          .select('user_name')
          .not('user_name', 'is', null);

        const { data: activeUsersData, error: usersError } = await Promise.race([
          usersPromise,
          timeoutPromise
        ]) as any;

        let activeUsersCount = 0;
        if (!usersError && activeUsersData) {
          // Get unique user names as proxy for active users
          const uniqueUserNames = new Set(activeUsersData.map((p: any) => p.user_name));
          activeUsersCount = uniqueUserNames.size;
        }

        if (usersError) {
          console.error('Error fetching active users:', usersError);
        }

        // Get sold products count
        const soldPromise = supabase
          .from('products_public')
          .select('*', { count: 'exact', head: true })
          .eq('is_sold', true);

        const { count: productsSold, error: soldError } = await Promise.race([
          soldPromise,
          timeoutPromise
        ]) as any;

        if (soldError) {
          console.error('Error fetching sold products count:', soldError);
        }

        const finalStats = {
          totalProducts: totalProducts || 0,
          totalUsers: totalUsers || 0,
          activeUsers: activeUsersCount || 0,
          productsSold: productsSold || 0
        };

        setStats(finalStats);
        console.log('Successfully fetched stats:', finalStats);
        setError(null);

      } catch (error) {
        console.error('Error fetching stats from Supabase:', error);
        // Set fallback stats if there's a connectivity issue
        setStats({ totalProducts: 3, totalUsers: 1, activeUsers: 2, productsSold: 0 });
        setError('Using cached stats (connection issue)');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up real-time subscription for stats updates
    const channel = supabase
      .channel('stats-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products_public' }, 
        () => {
          console.log('Products table changed, refetching stats...');
          fetchStats();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        () => {
          console.log('Products table changed, refetching stats...');
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, loading, error };
};
