
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalProducts: number;
  activeUsers: number;
  productsSold: number;
}

export const useStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeUsers: 0,
    productsSold: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching stats from Supabase...');
        
        // Get total products count from products_public
        const { count: totalProducts, error: productsError } = await supabase
          .from('products_public')
          .select('*', { count: 'exact', head: true });

        if (productsError) {
          console.error('Error fetching products count:', productsError);
        }

        // Get active users count (users who have created at least one product)
        const { data: activeUsersData, error: usersError } = await supabase
          .from('products')
          .select('user_id', { count: 'exact' })
          .not('user_id', 'is', null);

        let activeUsersCount = 0;
        if (!usersError && activeUsersData) {
          // Get unique user IDs
          const uniqueUserIds = new Set(activeUsersData.map(p => p.user_id));
          activeUsersCount = uniqueUserIds.size;
        }

        if (usersError) {
          console.error('Error fetching active users:', usersError);
        }

        // Get sold products count
        const { count: productsSold, error: soldError } = await supabase
          .from('products_public')
          .select('*', { count: 'exact', head: true })
          .eq('is_sold', true);

        if (soldError) {
          console.error('Error fetching sold products count:', soldError);
        }

        const finalStats = {
          totalProducts: totalProducts || 0,
          activeUsers: activeUsersCount || 0,
          productsSold: productsSold || 0
        };

        setStats(finalStats);
        console.log('Successfully fetched stats:', finalStats);
        setError(null);

      } catch (error) {
        console.error('Error fetching stats from Supabase:', error);
        setError('Unable to fetch latest stats');
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
