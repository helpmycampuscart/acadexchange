
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

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
        
        // Get Clerk session token for Supabase
        const token = await user.getToken({ template: 'supabase' });
        
        if (token) {
          // Set custom auth header for Supabase
          supabase.auth.setSession({
            access_token: token,
            refresh_token: token,
          });
        }

        // Use the sync function from our database
        const { error } = await supabase.rpc('sync_clerk_user', {
          clerk_user_id: user.id,
          user_email: user.emailAddresses[0]?.emailAddress || '',
          user_name: user.fullName || user.firstName || 'Anonymous'
        });

        if (error) {
          console.error('Error syncing user:', error);
        } else {
          console.log('User synced successfully');
        }
        
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
