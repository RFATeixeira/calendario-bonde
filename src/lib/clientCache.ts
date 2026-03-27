type CacheEnvelope<T> = {
  ts: number;
  data: T;
};

const CACHE_PREFIX = 'cb-cache:';

export function getCachedData<T>(key: string, maxAgeMs: number): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed?.ts || parsed?.data === undefined) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    const isExpired = Date.now() - parsed.ts > maxAgeMs;
    if (isExpired) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return parsed.data;
  } catch {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    return null;
  }
}

export function setCachedData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;

  const payload: CacheEnvelope<T> = {
    ts: Date.now(),
    data,
  };

  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
  } catch {
    // Ignore quota and serialization errors; cache is a non-critical optimization.
  }
}
