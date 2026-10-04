import { route } from '../_lib/http.js';
import { readSession } from '../_lib/session.js';

export default route(['GET'], async (req, res) => {
  const session = await readSession(req);
  res.status(200).json({ user: session ? { id: session.userId, email: session.email } : null });
});
