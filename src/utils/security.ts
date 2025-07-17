// Rate limiting utility
export class RateLimiter {
  private submissions: Map<string, number[]> = new Map();
  private maxSubmissions: number;
  private windowMs: number;

  constructor(maxSubmissions = 5, windowMs = 3600000) { // 1 hour window
    this.maxSubmissions = maxSubmissions;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userSubmissions = this.submissions.get(identifier) || [];
    
    // Remove old submissions outside the window
    const validSubmissions = userSubmissions.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    // Check if user has exceeded the limit
    if (validSubmissions.length >= this.maxSubmissions) {
      return false;
    }
    
    // Add current submission
    validSubmissions.push(now);
    this.submissions.set(identifier, validSubmissions);
    
    return true;
  }

  getRemainingAttempts(identifier: string): number {
    const now = Date.now();
    const userSubmissions = this.submissions.get(identifier) || [];
    const validSubmissions = userSubmissions.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    return Math.max(0, this.maxSubmissions - validSubmissions.length);
  }
}

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Phone validation (Indonesian format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
  return phone === '' || phoneRegex.test(phone.replace(/\s/g, ''));
};

// Honeypot validation
export const createHoneypot = () => {
  return Math.random().toString(36).substring(7);
};

// Get client IP (for rate limiting)
export const getClientIP = (): string => {
  // In production, this would get real IP from headers
  // For development, we'll use a fingerprint based on browser/session
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('client_fingerprint');
    if (stored) return stored;
    
    const fingerprint = btoa(
      navigator.userAgent + 
      navigator.language + 
      screen.width + 
      screen.height +
      Date.now().toString().substring(0, 10) // Hour-based component
    ).substring(0, 16);
    
    sessionStorage.setItem('client_fingerprint', fingerprint);
    return fingerprint;
  }
  return 'unknown';
};
