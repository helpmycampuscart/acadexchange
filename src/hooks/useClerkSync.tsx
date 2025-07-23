
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export const useClerkSync = () => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) return;

      try {
        // Check if user exists in our database
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingUser) {
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
            console.error('Error syncing user:', error);
          }
        } else {
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
      } catch (error) {
        console.error('Error syncing user:', error);
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return { user, isLoaded };
};
