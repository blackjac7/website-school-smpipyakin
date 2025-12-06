import { useState, useEffect } from "react";
import { RateLimiter, sanitizeInput, getClientIP } from "@/utils/security";

interface CaptchaData {
  num1: number;
  num2: number;
  answer: number;
}

interface UseAntiBotReturn {
  // Math Captcha
  captcha: CaptchaData;
  userCaptchaAnswer: string;
  setUserCaptchaAnswer: (answer: string) => void;
  generateCaptcha: () => void;

  // Honeypot
  honeypot: string;
  setHoneypot: (value: string) => void;
  honeypotFieldName: string;
  isClient: boolean;

  // Rate Limiting
  isRateLimited: () => boolean;
  getRemainingAttempts: () => number;

  // Validation
  validateAntiBot: () => { isValid: boolean; error?: string };

  // Utilities
  sanitizeFormData: <T extends Record<string, unknown>>(data: T) => T;
}

interface UseAntiBotOptions {
  maxAttempts?: number;
  windowMs?: number;
  enableCaptcha?: boolean;
  enableHoneypot?: boolean;
  enableRateLimit?: boolean;
}

// Global rate limiters for different use cases
const rateLimiters = {
  login: new RateLimiter(5, 900000), // 5 attempts per 15 minutes for login
  ppdb: new RateLimiter(3, 3600000), // 3 attempts per hour for PPDB
  contact: new RateLimiter(3, 86400000), // 3 attempts per day for contact
};

export function useAntiBot(
  type: "login" | "ppdb" | "contact" = "ppdb",
  options: UseAntiBotOptions = {}
): UseAntiBotReturn {
  const {
    enableCaptcha = true,
    enableHoneypot = true,
    enableRateLimit = true,
  } = options;

  // Math Captcha State
  const [captcha, setCaptcha] = useState<CaptchaData>({
    num1: 0,
    num2: 0,
    answer: 0,
  });
  const [userCaptchaAnswer, setUserCaptchaAnswer] = useState("");

  // Honeypot State
  const [honeypot, setHoneypot] = useState("");
  const [honeypotFieldName, setHoneypotFieldName] = useState("website_field");
  const [isClient, setIsClient] = useState(false);

  // Get the appropriate rate limiter
  const rateLimiter = rateLimiters[type];

  // Generate new math captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 + num2;
    setCaptcha({ num1, num2, answer });
    setUserCaptchaAnswer("");
  };

  // Initialize captcha on mount
  useEffect(() => {
    if (enableCaptcha) {
      generateCaptcha();
    }
  }, [enableCaptcha]);

  // Initialize honeypot field name on client side only
  useEffect(() => {
    setIsClient(true);
    if (enableHoneypot) {
      setHoneypotFieldName(
        `website_${Math.random().toString(36).substring(7)}`
      );
    }
  }, [enableHoneypot]);

  // Check if user is rate limited
  const isRateLimited = (): boolean => {
    if (!enableRateLimit) return false;
    const clientIP = getClientIP();
    return !rateLimiter.isAllowed(clientIP);
  };

  // Get remaining attempts
  const getRemainingAttempts = (): number => {
    const clientIP = getClientIP();
    return rateLimiter.getRemainingAttempts(clientIP);
  };

  // Validate all anti-bot measures
  const validateAntiBot = (): { isValid: boolean; error?: string } => {
    // Honeypot check
    if (enableHoneypot && honeypot) {
      return {
        isValid: false,
        error: "Spam terdeteksi. Silakan coba lagi.",
      };
    }

    // Rate limiting check
    if (enableRateLimit) {
      const clientIP = getClientIP();
      if (!rateLimiter.isAllowed(clientIP)) {
        const remaining = rateLimiter.getRemainingAttempts(clientIP);
        const timeUntilReset = rateLimiter.getTimeUntilReset(clientIP);
        const minutes = Math.ceil(timeUntilReset / 60000);

        return {
          isValid: false,
          error: `Terlalu banyak percobaan. Silakan coba lagi dalam ${minutes} menit. Sisa percobaan: ${remaining}`,
        };
      }
    }

    // Captcha validation
    if (enableCaptcha) {
      if (parseInt(userCaptchaAnswer) !== captcha.answer) {
        generateCaptcha(); // Generate new captcha on failure
        return {
          isValid: false,
          error: "Jawaban captcha tidak benar. Silakan coba lagi.",
        };
      }
    }

    return { isValid: true };
  };

  // Sanitize form data
  const sanitizeFormData = <T extends Record<string, unknown>>(data: T): T => {
    const sanitized = {} as T;

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        (sanitized as Record<string, unknown>)[key] = sanitizeInput(value);
      } else {
        (sanitized as Record<string, unknown>)[key] = value;
      }
    }

    return sanitized;
  };

  return {
    // Math Captcha
    captcha,
    userCaptchaAnswer,
    setUserCaptchaAnswer,
    generateCaptcha,

    // Honeypot
    honeypot,
    setHoneypot,
    honeypotFieldName,
    isClient,

    // Rate Limiting
    isRateLimited,
    getRemainingAttempts,

    // Validation
    validateAntiBot,

    // Utilities
    sanitizeFormData,
  };
}
