// Typed client for the Trex API. Same contract as js/api.js in the
// preview build; components keep working when the backend moves.
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function apiKey() {
  return 'k-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function req<T>(method: string, path: string, body?: unknown, key?: string): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Idempotency-Key': key } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Trex API ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(p: string) => req<T>('GET', p),
  post: <T>(p: string, b?: unknown, k?: string) => req<T>('POST', p, b, k),
};

export type Offer = {
  id: string; provide: string; want: string; rate: string;
  minMinor: number; maxMinor: number; methods: string[];
  tier: string; capacityMinor: number; live: boolean;
};

export type Trade = {
  id: string; sellCcy: string; recvCcy: string; sendMinor: number;
  recvMinor: number; feeMinor: number; state: string;
};
