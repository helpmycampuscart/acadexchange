
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total products
        const { count: totalProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Get active users
        const { count: activeUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // Get sold products
        const { count: productsSold } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_sold', true);

        setStats({
          totalProducts: totalProducts || 0,
          activeUsers: activeUsers || 0,
          productsSold: productsSold || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
