import React from 'react';

interface RateLimitState {
  lastCall: number;
  callCount: number;
  resetTime: number;
  isBlocked: boolean;
  retryAfter?: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  key: string;
}

class RateLimitManager {
  private state: RateLimitState = {
    lastCall: 0,
    callCount: 0,
    resetTime: Date.now() + 3600000, // 1 hora
    isBlocked: false
  };

  private cache = new Map<string, CacheEntry>();
  private readonly MIN_INTERVAL = 15000; // 15 segundos entre chamadas
  private readonly MAX_CALLS_PER_HOUR = 200; // Limite conservador
  private readonly CACHE_DURATION = 300000; // 5 minutos

  // Verifica se podemos fazer uma nova chamada
  canMakeCall(): boolean {
    const now = Date.now();
    
    // Reset contador se passou 1 hora
    if (now > this.state.resetTime) {
      this.state.callCount = 0;
      this.state.resetTime = now + 3600000;
      this.state.isBlocked = false;
    }

    // Verifica se está bloqueado
    if (this.state.isBlocked && this.state.retryAfter && now < this.state.retryAfter) {
      return false;
    }

    // Verifica intervalo mínimo
    if (now - this.state.lastCall < this.MIN_INTERVAL) {
      return false;
    }

    // Verifica limite de chamadas por hora
    if (this.state.callCount >= this.MAX_CALLS_PER_HOUR) {
      return false;
    }

    return true;
  }

  // Registra uma chamada feita
  recordCall(): void {
    this.state.lastCall = Date.now();
    this.state.callCount++;
  }

  // Registra um erro de rate limit
  recordRateLimit(retryAfter: number = 30000): void {
    this.state.isBlocked = true;
    this.state.retryAfter = Date.now() + retryAfter;
  }

  // Calcula tempo até próxima chamada permitida
  getNextCallTime(): number {
    const now = Date.now();
    
    if (this.state.isBlocked && this.state.retryAfter) {
      return Math.max(0, this.state.retryAfter - now);
    }

    return Math.max(0, (this.state.lastCall + this.MIN_INTERVAL) - now);
  }

  // Cache methods
  getCached(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Estatísticas para o painel de monitoramento
  getStats() {
    return {
      callCount: this.state.callCount,
      maxCalls: this.MAX_CALLS_PER_HOUR,
      isBlocked: this.state.isBlocked,
      nextCallTime: this.getNextCallTime(),
      cacheSize: this.cache.size,
      resetTime: this.state.resetTime
    };
  }
}

export const rateLimitManager = new RateLimitManager();

// Hook para debounce
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  return React.useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

// Wrapper para chamadas da API com rate limiting
export async function makeMetaApiCall<T>(
  apiCall: () => Promise<T>,
  cacheKey?: string
): Promise<T> {
  // Verifica cache primeiro
  if (cacheKey) {
    const cached = rateLimitManager.getCached(cacheKey);
    if (cached) {
      console.log('Dados obtidos do cache:', cacheKey);
      return cached;
    }
  }

  // Verifica se pode fazer a chamada
  if (!rateLimitManager.canMakeCall()) {
    const nextCall = rateLimitManager.getNextCallTime();
    throw new Error(`Rate limit ativo. Próxima chamada em ${Math.ceil(nextCall / 1000)}s`);
  }

  try {
    // Registra a chamada
    rateLimitManager.recordCall();
    
    // Faz a chamada
    const result = await apiCall();
    
    // Salva no cache se fornecido
    if (cacheKey) {
      rateLimitManager.setCache(cacheKey, result);
    }
    
    return result;
  } catch (error: any) {
    // Verifica se é erro de rate limit
    if (error.message?.includes('80004') || error.message?.includes('too many calls')) {
      console.error('Rate limit detectado:', error);
      rateLimitManager.recordRateLimit(30000); // 30 segundos
      throw new Error('Muitas chamadas à API. Aguarde 30 segundos antes de tentar novamente.');
    }
    
    throw error;
  }
}
