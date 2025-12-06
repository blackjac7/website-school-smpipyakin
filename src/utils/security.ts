/**
 * Utility for rate limiting user actions.
 */
export class RateLimiter {
  private submissions: Map<string, number[]> = new Map();
  private maxSubmissions: number;
  private windowMs: number;

  /**
   * Creates an instance of RateLimiter.
   * @param {number} [maxSubmissions=5] - The maximum number of submissions allowed within the window.
   * @param {number} [windowMs=3600000] - The time window in milliseconds (default is 1 hour).
   */
  constructor(maxSubmissions = 5, windowMs = 3600000) { // 1 hour window
    this.maxSubmissions = maxSubmissions;
    this.windowMs = windowMs;
  }

  /**
   * Checks if a submission is allowed for a given identifier.
   * @param {string} identifier - The unique identifier for the user (e.g., IP address or user ID).
   * @returns {boolean} - True if the submission is allowed, false otherwise.
   */
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

  /**
   * Gets the number of remaining attempts for a given identifier.
   * @param {string} identifier - The unique identifier for the user.
   * @returns {number} - The number of remaining attempts.
   */
  getRemainingAttempts(identifier: string): number {
    const now = Date.now();
    const userSubmissions = this.submissions.get(identifier) || [];
    const validSubmissions = userSubmissions.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    return Math.max(0, this.maxSubmissions - validSubmissions.length);
  }
}

/**
 * Sanitizes input string by removing potential XSS threats.
 * @param {string} input - The input string to sanitize.
 * @returns {string} - The sanitized string.
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

/**
 * Validates an email address.
 * @param {string} email - The email address to validate.
 * @returns {boolean} - True if the email is valid, false otherwise.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validates an Indonesian phone number.
 * @param {string} phone - The phone number to validate.
 * @returns {boolean} - True if the phone number is valid, false otherwise.
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
  return phone === '' || phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Creates a random string to be used as a honeypot value.
 * @returns {string} - A random string.
 */
export const createHoneypot = () => {
  return Math.random().toString(36).substring(7);
};

/**
 * Retrieves the client's IP address or a fingerprint.
 * @returns {string} - The client's IP or fingerprint.
 */
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
