
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { syncUserWithSupabase } from "@/integrations/supabase/client";
import { fixExistingUserData } from "@/utils/fixExistingData";

const ClerkSupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && user) {
        const email = user.emailAddresses[0]?.emailAddress;
        const name = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
        
        if (email && name) {
          console.log('Starting user sync for:', user.id);
          
          // Sync user with Supabase
          const syncResult = await syncUserWithSupabase(user.id, email, name);
          
          if (syncResult.success) {
            console.log('User sync completed successfully');
            
            // Fix existing data for this user
            const fixResult = await fixExistingUserData(user.id, email, name);
            if (fixResult.success) {
              console.log('Existing data fix completed');
            } else {
              console.error('Failed to fix existing data:', fixResult.error);
            }
          } else {
            console.error('User sync failed:', syncResult.error);
          }
        }
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return <>{children}</>;
};

export default ClerkSupabaseProvider;
