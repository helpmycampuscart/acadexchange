
import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export const useClerkSync = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
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
        const token = await getToken({ template: 'supabase' });
        
        if (token) {
          // Set custom auth header for Supabase
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: token,
          });
        }

        // Check if user exists first
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingUser) {
          console.log('Creating new user record');
          // Create new user record
          const { error } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.emailAddresses[0]?.emailAddress || '',
              name: user.fullName || user.firstName || 'Anonymous',
              role: 'user'
            });

          if (error) {
            console.error('Error creating user:', error);
          } else {
            console.log('User created successfully');
          }
        } else {
          console.log('User already exists');
        }
        
        setIsReady(true);
      } catch (error) {
        console.error('Error syncing user:', error);
        setIsReady(true);
      }
    };

    syncUser();
  }, [user, isLoaded, getToken]);

  return { user, isLoaded, isReady };
};
