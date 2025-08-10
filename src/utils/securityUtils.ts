
import { supabase } from '@/integrations/supabase/client';

// Enhanced XSS protection
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Enhanced input validation
export const validateProductInput = (product: any): { valid: boolean; error?: string } => {
  // Name validation
  if (!product.name || typeof product.name !== 'string' || product.name.trim().length < 2) {
    return { valid: false, error: 'Product name must be at least 2 characters long' };
  }
  
  if (product.name.length > 100) {
    return { valid: false, error: 'Product name must be less than 100 characters' };
  }
  
  // Price validation
  if (!product.price || typeof product.price !== 'number' || product.price <= 0 || product.price > 10000000) {
    return { valid: false, error: 'Price must be between ₹1 and ₹1,00,00,000' };
  }
  
  // Category validation
  if (!product.category || typeof product.category !== 'string' || product.category.trim().length === 0) {
    return { valid: false, error: 'Category is required' };
  }
  
  // Location validation
  if (!product.location || typeof product.location !== 'string' || product.location.trim().length === 0) {
    return { valid: false, error: 'Location is required' };
  }
  
  // WhatsApp number validation (enhanced)
  const whatsappRegex = /^[+]?[1-9]\d{7,14}$/;
  if (!product.whatsappNumber || !whatsappRegex.test(product.whatsappNumber.replace(/[\s-]/g, ''))) {
    return { valid: false, error: 'Please enter a valid WhatsApp number (8-15 digits)' };
  }
  
  // Description validation (optional but if provided, validate)
  if (product.description && product.description.length > 1000) {
    return { valid: false, error: 'Description must be less than 1000 characters' };
  }
  
  return { valid: true };
};

// Log security events
export const logSecurityEvent = async (eventType: string, details: any = {}) => {
  try {
    console.log(`Security Event: ${eventType}`, details);
    // In production, you might want to send this to a security monitoring service
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// Rate limiting helper (client-side basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
};
