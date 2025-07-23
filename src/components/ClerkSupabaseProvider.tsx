
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

export const ClerkSupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const { userId } = useAuth();

  useEffect(() => {
    if (userId) {
      console.log('User authenticated with Clerk:', userId);
      // User is authenticated, the useClerkSync hook will handle data syncing
    }
  }, [userId]);

  return <>{children}</>;
};
