import { describe, expect, it } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hashPassword, verifyPassword } from './password.js';
import { endSession, readSession, startSession } from './session.js';

describe('password hashing', () => {
  it('never stores plain text and verifies correctly', async () => {
    const stored = await hashPassword('correct horse battery');
    expect(stored).not.toContain('correct horse');
    expect(await verifyPassword('correct horse battery', stored)).toBe(true);
    expect(await verifyPassword('wrong password', stored)).toBe(false);
  });

  it('uses a different salt each time', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'));
  });
});

describe('session cookie', () => {
  it('round-trips a signed session and rejects tampering', async () => {
    process.env.AUTH_SECRET = 'x'.repeat(40);
    let cookie = '';
    const res = { setHeader: (_name: string, value: string) => (cookie = value) } as unknown as VercelResponse;
    await startSession(res, { userId: 'user-1', email: 'a@b.co' });
    expect(cookie).toContain('HttpOnly');

    const token = cookie.split(';')[0];
    const request = (value: string) => ({ headers: { cookie: value } }) as unknown as VercelRequest;
    expect(await readSession(request(token))).toEqual({ userId: 'user-1', email: 'a@b.co' });
    expect(await readSession(request(token.slice(0, -3) + 'abc'))).toBeNull();
    endSession(res);
    expect(cookie).toContain('Max-Age=0');
  });
});
