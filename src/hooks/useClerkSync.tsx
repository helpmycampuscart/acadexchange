
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
        
        // Check if user exists in our database
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error checking existing user:', fetchError);
          setIsReady(true);
          return;
        }

        if (!existingUser) {
          console.log('Creating new user record');
          // Insert new user
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
          console.log('Updating existing user');
          // Update existing user's info
          const { error } = await supabase
            .from('users')
            .update({
              email: user.emailAddresses[0]?.emailAddress || '',
              name: user.fullName || user.firstName || 'Anonymous'
            })
            .eq('id', user.id);

          if (error) {
            console.error('Error updating user:', error);
          }
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
