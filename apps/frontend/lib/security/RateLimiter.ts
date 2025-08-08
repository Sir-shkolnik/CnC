/**
 * Frontend Rate Limiting System
 * CISSP Compliant - Brute force protection and API call throttling
 */

export class RateLimiter {
  private static attempts = new Map<string, { count: number; resetTime: number }>();
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly API_RATE_LIMIT = 100; // 100 requests per minute
  private static readonly API_WINDOW_MS = 60 * 1000; // 1 minute
  private static apiRequests = new Map<string, { count: number; resetTime: number }>();
  
  /**
   * Check rate limit for a specific action
   */
  static async checkRateLimit(action: string, identifier: string): Promise<boolean> {
    const key = `${action}:${identifier}`;
    const now = Date.now();
    
    const attempt = this.attempts.get(key);
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.WINDOW_MS });
      return true;
    }
    
    if (attempt.count >= this.MAX_ATTEMPTS) {
      return false;
    }
    
    attempt.count++;
    return true;
  }
  
  /**
   * Execute function with rate limiting
   */
  static async executeWithRateLimit<T>(
    action: string,
    identifier: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const allowed = await this.checkRateLimit(action, identifier);
    
    if (!allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    return fn();
  }
  
  /**
   * Get remaining attempts for an action
   */
  static getRemainingAttempts(action: string, identifier: string): number {
    const key = `${action}:${identifier}`;
    const attempt = this.attempts.get(key);
    
    if (!attempt || Date.now() > attempt.resetTime) {
      return this.MAX_ATTEMPTS;
    }
    
    return Math.max(0, this.MAX_ATTEMPTS - attempt.count);
  }
  
  /**
   * Check API rate limit
   */
  static checkAPIRateLimit(endpoint: string): boolean {
    const key = `api:${endpoint}`;
    const now = Date.now();
    
    const request = this.apiRequests.get(key);
    
    if (!request || now > request.resetTime) {
      this.apiRequests.set(key, { count: 1, resetTime: now + this.API_WINDOW_MS });
      return true;
    }
    
    if (request.count >= this.API_RATE_LIMIT) {
      return false;
    }
    
    request.count++;
    return true;
  }
  
  /**
   * Execute API call with rate limiting
   */
  static async executeAPICall<T>(
    endpoint: string,
    fn: () => Promise<T>
  ): Promise<T> {
    if (!this.checkAPIRateLimit(endpoint)) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    
    return fn();
  }
  
  /**
   * Clear rate limit for a specific action
   */
  static clearRateLimit(action: string, identifier: string): void {
    const key = `${action}:${identifier}`;
    this.attempts.delete(key);
  }
  
  /**
   * Clear all rate limits
   */
  static clearAllRateLimits(): void {
    this.attempts.clear();
    this.apiRequests.clear();
  }
  
  /**
   * Get rate limit status
   */
  static getRateLimitStatus(action: string, identifier: string): {
    remaining: number;
    resetTime: number;
    isBlocked: boolean;
  } {
    const key = `${action}:${identifier}`;
    const attempt = this.attempts.get(key);
    const now = Date.now();
    
    if (!attempt || now > attempt.resetTime) {
      return {
        remaining: this.MAX_ATTEMPTS,
        resetTime: now + this.WINDOW_MS,
        isBlocked: false
      };
    }
    
    return {
      remaining: Math.max(0, this.MAX_ATTEMPTS - attempt.count),
      resetTime: attempt.resetTime,
      isBlocked: attempt.count >= this.MAX_ATTEMPTS
    };
  }
  
  /**
   * Get API rate limit status
   */
  static getAPIRateLimitStatus(endpoint: string): {
    remaining: number;
    resetTime: number;
    isBlocked: boolean;
  } {
    const key = `api:${endpoint}`;
    const request = this.apiRequests.get(key);
    const now = Date.now();
    
    if (!request || now > request.resetTime) {
      return {
        remaining: this.API_RATE_LIMIT,
        resetTime: now + this.API_WINDOW_MS,
        isBlocked: false
      };
    }
    
    return {
      remaining: Math.max(0, this.API_RATE_LIMIT - request.count),
      resetTime: request.resetTime,
      isBlocked: request.count >= this.API_RATE_LIMIT
    };
  }
  
  /**
   * Get formatted time until reset
   */
  static getTimeUntilReset(resetTime: number): string {
    const now = Date.now();
    const timeLeft = Math.max(0, resetTime - now);
    
    const minutes = Math.floor(timeLeft / (60 * 1000));
    const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
}

export default RateLimiter;
