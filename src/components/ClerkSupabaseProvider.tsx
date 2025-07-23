
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
          console.log('Supabase JWT template not configured in Clerk, skipping token setup');
        }
      }
    };

    setupAuth();
  }, [userId, getToken]);

  return <>{children}</>;
};
