
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { syncUserWithSupabase } from '@/integrations/supabase/client';

export const useClerkSync = () => {
  const { user, isLoaded } = useUser();
  const [isReady, setIsReady] = useState(false);
  const [syncAttempted, setSyncAttempted] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded) {
        setIsReady(false);
        return;
      }

      if (!user) {
        setIsReady(true);
        return;
      }

      // Only attempt sync once per user session
      if (syncAttempted) {
        setIsReady(true);
        return;
      }

      setSyncAttempted(true);

      try {
        console.log('Starting user sync for:', user.id);
        
        // Get the primary email address
        const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
        const email = primaryEmail?.emailAddress || user.emailAddresses[0]?.emailAddress || '';
        const name = user.fullName || user.firstName || user.username || 'Anonymous User';
        
        if (!email) {
          console.error('No email found for user');
          setIsReady(true);
          return;
        }
        
        // Sync user data with Supabase
        const result = await syncUserWithSupabase(user.id, email, name);
        
        if (result.success) {
          console.log('User sync completed successfully');
        } else {
          console.error('User sync failed:', result.error);
        }
        
        setIsReady(true);
      } catch (error) {
        console.error('Error during user sync:', error);
        setIsReady(true);
      }
    };

    syncUser();
  }, [user, isLoaded, syncAttempted]);

  return { user, isLoaded, isReady };
};
