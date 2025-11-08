class ErrorTracker {
  private static errors: Map<string, { count: number; lastSeen: number }> = new Map();
  
  static track(error: string, context?: string) {
    const key = context ? `${context}: ${error}` : error;
    const existing = this.errors.get(key) || { count: 0, lastSeen: 0 };
    
    this.errors.set(key, {
      count: existing.count + 1,
      lastSeen: Date.now()
    });
    
    if (existing.count > 5 && Date.now() - existing.lastSeen < 5 * 60 * 1000) {
      console.warn(`Frequent error detected (${existing.count + 1}x):`, key);
    }
    
    this.cleanup();
  }
  
  private static cleanup() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [key, value] of this.errors.entries()) {
      if (value.lastSeen < oneHourAgo) {
        this.errors.delete(key);
      }
    }
  }
  
  static getReport() {
    return Array.from(this.errors.entries())
      .map(([error, stats]) => ({ error, ...stats }))
      .sort((a, b) => b.count - a.count);
  }
}

export const safeFetch = async (url: string, options: RequestInit = {}, context?: string) => {
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(30000),
    });
    
    if (!response.ok) {
      const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      ErrorTracker.track(errorMsg, context);
      
      if (response.status !== 401 && response.status !== 403) {
        console.error(`API Error in ${context || 'unknown'}:`, errorMsg);
      }
      
      throw new Error(errorMsg);
    }
    
    return response;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    ErrorTracker.track(errorMsg, context);
    
    if (!errorMsg.includes('Failed to fetch') && !errorMsg.includes('NetworkError')) {
      console.error(`Network Error in ${context || 'unknown'}:`, errorMsg);
    }
    
    throw error;
  }
};

export { ErrorTracker };