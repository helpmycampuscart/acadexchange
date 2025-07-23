
import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { supabase, setSupabaseAuth } from '@/integrations/supabase/client';

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
        
        // Try to get Clerk session token for Supabase (if configured)
        let token = null;
        try {
          token = await getToken({ template: 'supabase' });
        } catch (error) {
          console.log('Supabase JWT template not configured in Clerk, proceeding without token');
        }
        
        if (token) {
          // Set custom auth for Supabase using safer method
          await setSupabaseAuth(token);
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
