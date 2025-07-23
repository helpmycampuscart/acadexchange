
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export const useClerkSync = () => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) return;

      try {
        // Sync user to Supabase
        const { error } = await supabase.rpc('sync_clerk_user', {
          clerk_user_id: user.id,
          user_email: user.emailAddresses[0]?.emailAddress || '',
          user_name: user.fullName || user.firstName || 'Anonymous'
        });

        if (error) {
          console.error('Error syncing user:', error);
        }
      } catch (error) {
        console.error('Error syncing user:', error);
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return { user, isLoaded };
};
