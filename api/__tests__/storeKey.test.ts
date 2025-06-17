import handler from '../storeKey';
import { describe, it, expect } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const mockRes = (): Partial<VercelResponse> & { statusCode?: number; body?: unknown } => {
  const res: Partial<VercelResponse> & { statusCode?: number; body?: unknown } = {};
  res.status = (code: number) => { res.statusCode = code; return res as VercelResponse; };
  res.json = (body: unknown) => { res.body = body; return res as VercelResponse; };
  return res;
};

describe('storeKey API', () => {
  it('returns 405 on get', async () => {
    const res = mockRes();
    await handler({ method: 'GET' } as unknown as VercelRequest, res as VercelResponse);
    expect(res.statusCode).toBe(405);
  });
});
