
import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';

export const ClerkSupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const { userId, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    if (authLoaded && userLoaded) {
      if (userId && user) {
        console.log('User authenticated with Clerk:', {
          userId,
          email: user.emailAddresses[0]?.emailAddress,
          name: user.fullName || user.firstName
        });
        // The useClerkSync hook will handle the actual syncing
      } else {
        console.log('User not authenticated');
      }
    }
  }, [userId, user, authLoaded, userLoaded]);

  return <>{children}</>;
};
