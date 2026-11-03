import { cache } from 'react';

const API_BASE =
  (typeof window === 'undefined'
    ? process.env.INTERNAL_API_URL || 'http://127.0.0.1:5000/api/v1'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1');

interface CacheEntry {
  data: any;
  expiresAt: number;
}

// In-memory cache to serve identical GET requests in 0ms without hitting the network repeatedly
const memoryCache = new Map<string, CacheEntry>();

function getCacheTtlMs(endpoint: string): number {
  if (endpoint.startsWith('/locations') || endpoint.includes('/countries')) return 600_000; // 10 mins
  if (endpoint.startsWith('/categories')) return 600_000; // 10 mins
  if (endpoint.includes('/featured')) return 300_000; // 5 mins
  if (endpoint.startsWith('/businesses')) return 120_000; // 2 mins
  return 60_000; // 1 min default for public GETs
}

export function clearApiCache(): void {
  memoryCache.clear();
}

async function fetchApiRaw<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; status?: number; [key: string]: any }> {
  const method = (options.method || 'GET').toUpperCase();
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let authHeader: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('biz_auth_token');
      if (token) {
        authHeader = { Authorization: `Bearer ${token}` };
      }
    } catch {}
  }

  const isPublicGet = method === 'GET' && !authHeader.Authorization;
  const now = Date.now();

  // Check fast in-memory cache for public GET requests
  if (isPublicGet && !options.cache && !(options as any).noCache) {
    const cached = memoryCache.get(url);
    if (cached && now < cached.expiresAt) {
      return cached.data;
    }
  }

  try {
    const ttlMs = getCacheTtlMs(endpoint);
    const nextOptions =
      typeof window === 'undefined' && isPublicGet
        ? { revalidate: Math.floor(ttlMs / 1000), ...options.next }
        : options.next;

    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers,
      },
      credentials: typeof window === 'undefined' ? undefined : 'include',
      ...(nextOptions ? { next: nextOptions } : {}),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${res.status}`,
        status: res.status,
        ...data,
      };
    }

    // Cache successful public GET responses
    if (isPublicGet && data.success !== false) {
      memoryCache.set(url, {
        data,
        expiresAt: now + ttlMs,
      });

      // Bound cache size to prevent memory leak
      if (memoryCache.size > 200) {
        const oldestKey = memoryCache.keys().next().value;
        if (oldestKey) memoryCache.delete(oldestKey);
      }
    }

    return data;
  } catch (err: any) {
    console.error(`Fetch API Error for ${url}:`, err.message);
    return {
      success: false,
      message: 'Unable to connect to BizListPlace.com directory service.',
    };
  }
}

export const fetchApi = cache(fetchApiRaw);
