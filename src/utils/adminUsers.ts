
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const getUsersFromClerk = async (): Promise<User[]> => {
  console.log('Fetching users from Supabase (admin view)...');

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log('No users found in database');
    return [];
  }

  const users: User[] = data.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    role: item.role as 'user' | 'admin',
    createdAt: item.created_at,
  }));

  console.log(`Fetched ${users.length} users from Supabase`);
  return users;
};
