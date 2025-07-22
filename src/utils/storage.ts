import { Product, User } from '@/types';
import { supabase } from '@/lib/supabase';

// Admin email addresses that should have admin role
const ADMIN_EMAILS = [
  'admin@mycampuscart.com',
  'abhinavpadige06@gmail.com',
  'your-admin-email@example.com' // Add your admin email here
];

// Check if user email is admin
export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// Local storage keys
const PRODUCTS_KEY = 'mycampuscart_products';
const USERS_KEY = 'mycampuscart_users';

// Generate unique product ID
export const generateProductId = (): string => {
  const prefix = 'MCC';
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

// Product storage functions
export const saveProduct = (product: Product): void => {
  const products = getProducts();
  products.push(product);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const getProducts = (): Product[] => {
  const products = localStorage.getItem(PRODUCTS_KEY);
  return products ? JSON.parse(products) : [];
};

export const updateProduct = (productId: string, updates: Partial<Product>): void => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === productId);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }
};

export const deleteProduct = (productId: string): void => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== productId);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
};

// User storage functions (enhanced with Supabase sync)
export const saveUser = async (user: User): Promise<void> => {
  try {
    // Check if user should be admin
    const userWithRole = {
      ...user,
      role: isAdminEmail(user.email) ? 'admin' as const : 'user' as const
    };

    // Save to localStorage for immediate access
    const users = getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex !== -1) {
      users[existingIndex] = userWithRole;
    } else {
      users.push(userWithRole);
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Sync with Supabase
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: userWithRole.id,
          email: userWithRole.email,
          name: userWithRole.name,
          role: userWithRole.role,
          created_at: userWithRole.createdAt
        });

      if (error && error.code !== 'PGRST116') { // Ignore table doesn't exist error
        console.warn('Supabase sync warning:', error.message);
      }
    } catch (supabaseError) {
      console.warn('Supabase not configured or table missing:', supabaseError);
    }
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(u => u.email === email) || null;
};

// Initialize demo data
export const initializeDemoData = (): void => {
  // Check if data already exists
  if (getProducts().length > 0) return;

  const demoProducts: Product[] = [
    {
      id: '1',
      uniqueId: generateProductId(),
      name: 'MacBook Pro 13"',
      description: 'Gently used MacBook Pro 13" with M1 chip. Excellent condition, comes with charger.',
      price: 85000,
      category: 'Electronics',
      location: 'Gachibowli',
      whatsappNumber: '9876543210',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      userId: 'demo_user_1',
      userEmail: 'student1@university.edu',
      userName: 'Alex Johnson',
      createdAt: new Date().toISOString(),
      isSold: false
    },
    {
      id: '2',
      uniqueId: generateProductId(),
      name: 'Data Structures & Algorithms Book',
      description: 'Complete set of DSA books by Cormen. Perfect for CS students.',
      price: 1200,
      category: 'Books',
      location: 'Ameerpet',
      whatsappNumber: '9876543211',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
      userId: 'demo_user_2',
      userEmail: 'student2@university.edu',
      userName: 'Priya Sharma',
      createdAt: new Date().toISOString(),
      isSold: false
    },
    {
      id: '3',
      uniqueId: generateProductId(),
      name: 'Study Desk with Chair',
      description: 'Wooden study desk with comfortable chair. Great for hostel rooms.',
      price: 3500,
      category: 'Furniture',
      location: 'Kukatpally',
      whatsappNumber: '9876543212',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
      userId: 'demo_user_3',
      userEmail: 'student3@university.edu',
      userName: 'Rahul Verma',
      createdAt: new Date().toISOString(),
      isSold: false
    }
  ];

  // Save demo products
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(demoProducts));
};