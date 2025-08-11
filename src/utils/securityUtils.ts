
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

// Enhanced security event logging with structured data
export const logSecurityEvent = async (eventType: string, details: any = {}) => {
  try {
    const securityLog = {
      timestamp: new Date().toISOString(),
      event: eventType,
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...details
    };
    
    console.log(`Security Event: ${eventType}`, securityLog);
    
    // In production, you might want to send this to a security monitoring service
    // await fetch('/api/security-log', { method: 'POST', body: JSON.stringify(securityLog) });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// Enhanced rate limiting with user-specific tracking
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    logSecurityEvent('rate_limit_exceeded', { 
      key, 
      attempts: record.count, 
      maxRequests,
      windowMs 
    });
    return false;
  }
  
  record.count++;
  return true;
};

// Security headers validation (for production deployment)
export const validateSecurityHeaders = (): boolean => {
  // This would be used to check if proper security headers are set
  // In a real production environment, you'd validate CSP, HSTS, etc.
  return true;
};

// Secure session validation
export const validateUserSession = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    // Basic session validation - in production you might check token expiry, etc.
    return true;
  } catch (error) {
    await logSecurityEvent('session_validation_failed', { userId, error: String(error) });
    return false;
  }
};

// Contact access audit logging
export const auditContactAccess = async (productId: string, buyerId: string, sellerId: string) => {
  try {
    await logSecurityEvent('contact_information_accessed', {
      productId,
      buyerId,
      sellerId,
      accessTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to audit contact access:', error);
  }
};
