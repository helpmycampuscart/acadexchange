
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

const ADMIN_EMAILS = [
  'abhinavpadige06@gmail.com',
  'help.mycampuscart@gmail.com'
];

export const useAdminCheck = () => {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = () => {
      if (!isLoaded || !user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const userEmail = user.emailAddresses[0]?.emailAddress;
        const adminStatus = ADMIN_EMAILS.includes(userEmail || '');
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, isLoaded]);

  return { isAdmin, isLoading };
};
