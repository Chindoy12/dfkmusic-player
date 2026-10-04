import type { VercelRequest, VercelResponse } from '@vercel/node';

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

export function sendError(res: VercelResponse, status: number, code: string): void {
  res.status(status).json({ error: code });
}

export function route(allowedMethods: string[], handler: Handler): Handler {
  return async (req, res) => {
    if (!req.method || !allowedMethods.includes(req.method)) {
      res.setHeader('Allow', allowedMethods.join(', '));
      return sendError(res, 405, 'METHOD_NOT_ALLOWED');
    }
    try {
      await handler(req, res);
    } catch (error) {
      console.error(error);
      sendError(res, 500, 'SERVER_ERROR');
    }
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return EMAIL_PATTERN.test(email) && email.length <= 254 ? email : null;
}
