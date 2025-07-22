import { Product, User } from '@/types';

// Generate a unique product ID
export const generateProductId = (): string => {
  return `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Product storage functions
export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.id === product.id);
  
  if (existingIndex >= 0) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }
  
  localStorage.setItem('campuscart_products', JSON.stringify(products));
};

export const getProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem('campuscart_products');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
};

export const deleteProduct = (productId: string): void => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== productId);
  localStorage.setItem('campuscart_products', JSON.stringify(filtered));
};

export const updateProduct = (productId: string, updates: Partial<Product>): void => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === productId);
  
  if (index >= 0) {
    products[index] = { ...products[index], ...updates };
    localStorage.setItem('campuscart_products', JSON.stringify(products));
  }
};

// User storage functions
export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem('campuscart_users', JSON.stringify(users));
};

export const getUsers = (): User[] => {
  try {
    const stored = localStorage.getItem('campuscart_users');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

export const getUser = (userId: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.id === userId);
};

export const deleteUser = (userId: string): void => {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== userId);
  localStorage.setItem('campuscart_users', JSON.stringify(filtered));
};
