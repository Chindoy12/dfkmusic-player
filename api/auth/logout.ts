import { route } from '../_lib/http.js';
import { endSession } from '../_lib/session.js';

export default route(['POST'], async (_req, res) => {
  endSession(res);
  res.status(200).json({ ok: true });
});
