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
        
        // Get total products
        const { count: totalProducts, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Get active users  
        const { count: activeUsers, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // Get sold products
        const { count: productsSold, error: soldError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_sold', true);

        if (productsError || usersError || soldError) {
          throw new Error('Failed to fetch some stats from database');
        }

        setStats({
          totalProducts: totalProducts || 0,
          activeUsers: activeUsers || 0,
          productsSold: productsSold || 0
        });

        console.log('Successfully fetched stats:', { totalProducts, activeUsers, productsSold });
      } catch (error) {
        console.error('Error fetching stats from Supabase:', error);
        setError('Unable to fetch latest stats');
        
        // Fallback to localStorage for product count
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
  }, []);

  return { stats, loading, error };
};
