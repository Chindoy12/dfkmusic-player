import { getSql } from '../_lib/db.js';
import { normalizeEmail, route, sendError } from '../_lib/http.js';
import { verifyPassword } from '../_lib/password.js';
import { startSession } from '../_lib/session.js';

export default route(['POST'], async (req, res) => {
  const { email: rawEmail, password } = req.body ?? {};
  const email = normalizeEmail(rawEmail);
  if (!email || typeof password !== 'string') return sendError(res, 401, 'INVALID_CREDENTIALS');

  const sql = getSql();
  const rows = await sql`SELECT id, email, password_hash FROM users WHERE email = ${email}`;
  const user = rows[0] as { id: string; email: string; password_hash: string } | undefined;

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return sendError(res, 401, 'INVALID_CREDENTIALS');
  }

  await startSession(res, { userId: user.id, email: user.email });
  res.status(200).json({ user: { id: user.id, email: user.email } });
});
