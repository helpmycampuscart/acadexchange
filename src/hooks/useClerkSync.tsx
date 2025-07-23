
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { syncUserWithSupabase } from '@/integrations/supabase/client';

export const useClerkSync = () => {
  const { user, isLoaded } = useUser();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) {
        setIsReady(isLoaded);
        return;
      }

      try {
        console.log('Syncing user:', user.id);
        
        // Sync user data with Supabase without JWT tokens
        await syncUserWithSupabase(
          user.id,
          user.emailAddresses[0]?.emailAddress || '',
          user.fullName || user.firstName || 'Anonymous'
        );
        
        setIsReady(true);
      } catch (error) {
        console.error('Error syncing user:', error);
        setIsReady(true);
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return { user, isLoaded, isReady };
};
