import { getSql } from '../_lib/db.js';
import { normalizeEmail, route, sendError } from '../_lib/http.js';
import { hashPassword } from '../_lib/password.js';
import { startSession } from '../_lib/session.js';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 200;

export default route(['POST'], async (req, res) => {
  const { email: rawEmail, password, confirmPassword } = req.body ?? {};
  const email = normalizeEmail(rawEmail);

  if (!email) return sendError(res, 400, 'EMAIL_INVALID');
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return sendError(res, 400, 'PASSWORD_TOO_SHORT');
  }
  if (password.length > MAX_PASSWORD_LENGTH) return sendError(res, 400, 'PASSWORD_TOO_LONG');
  if (password !== confirmPassword) return sendError(res, 400, 'PASSWORDS_DO_NOT_MATCH');

  const sql = getSql();
  const passwordHash = await hashPassword(password);
  const rows = await sql`
    INSERT INTO users (email, password_hash)
    VALUES (${email}, ${passwordHash})
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email`;

  if (rows.length === 0) return sendError(res, 409, 'EMAIL_TAKEN');

  const user = rows[0] as { id: string; email: string };
  await startSession(res, { userId: user.id, email: user.email });
  res.status(201).json({ user });
});
