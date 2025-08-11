
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getProducts } from '@/utils/storage';

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
        
        // Get total products count
        const { count: totalProducts, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (productsError) {
          console.error('Error fetching products count:', productsError);
        }

        // Get active users count
        const { count: activeUsers, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (usersError) {
          console.error('Error fetching users count:', usersError);
        }

        // Get sold products count
        const { count: productsSold, error: soldError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_sold', true);

        if (soldError) {
          console.error('Error fetching sold products count:', soldError);
        }

        // Set stats with fallback to 0 if any query failed
        const finalStats = {
          totalProducts: totalProducts || 0,
          activeUsers: activeUsers || 0,
          productsSold: productsSold || 0
        };

        setStats(finalStats);
        console.log('Successfully fetched stats:', finalStats);

        // Clear any previous errors if we got data
        if (!productsError && !usersError && !soldError) {
          setError(null);
        }

      } catch (error) {
        console.error('Error fetching stats from Supabase:', error);
        setError('Unable to fetch latest stats');
        
        // Fallback to localStorage for product count only
        try {
          const localProducts = getProducts();
          const soldProducts = localProducts.filter(p => p.isSold);
          
          setStats({
            totalProducts: localProducts.length,
            activeUsers: 0, // Can't get this from localStorage
            productsSold: soldProducts.length
          });
          
          console.log('Using fallback stats from localStorage');
        } catch (localError) {
          console.error('Error getting fallback stats:', localError);
          // Keep default values
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up real-time subscription for stats updates
    const channel = supabase
      .channel('stats-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        () => {
          console.log('Products table changed, refetching stats...');
          fetchStats();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' }, 
        () => {
          console.log('Users table changed, refetching stats...');
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
