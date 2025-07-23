
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export const ClerkSupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, userId } = useAuth();

  useEffect(() => {
    const setupAuth = async () => {
      if (userId) {
        try {
          const token = await getToken({ template: 'supabase' });
          if (token) {
            await supabase.auth.setSession({
              access_token: token,
              refresh_token: token,
            });
          }
        } catch (error) {
          console.error('Error setting up Supabase auth:', error);
        }
      }
    };

    setupAuth();
  }, [userId, getToken]);

  return <>{children}</>;
};
