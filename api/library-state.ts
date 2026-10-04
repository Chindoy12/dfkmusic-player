import { getSql } from './_lib/db.js';
import { route, sendError } from './_lib/http.js';
import { readSession } from './_lib/session.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_PLAYLISTS = 100;
const MAX_SONGS_PER_PLAYLIST = 5000;
const REPEAT_MODES = ['off', 'all', 'one'];

const DEFAULT_PREFERENCES = { volume: 0.8, muted: false, repeat: 'off', shuffle: false, favoriteKeys: [] };

interface PlaylistInput {
  id: string;
  name: string;
  songKeys: string[];
}

function isStringArray(value: unknown, max: number): value is string[] {
  return Array.isArray(value) && value.length <= max && value.every((item) => typeof item === 'string' && item.length < 500);
}

function parsePlaylists(value: unknown): PlaylistInput[] | null {
  if (!Array.isArray(value) || value.length > MAX_PLAYLISTS) return null;
  const playlists: PlaylistInput[] = [];
  for (const item of value) {
    const valid =
      item &&
      typeof item.id === 'string' &&
      UUID_PATTERN.test(item.id) &&
      typeof item.name === 'string' &&
      item.name.trim().length > 0 &&
      item.name.length <= 100 &&
      isStringArray(item.songKeys, MAX_SONGS_PER_PLAYLIST);
    if (!valid) return null;
    playlists.push({ id: item.id, name: item.name.trim(), songKeys: item.songKeys });
  }
  return playlists;
}

function parsePreferences(value: unknown) {
  const preferences = value as Record<string, unknown> | null;
  const valid =
    preferences &&
    typeof preferences.volume === 'number' &&
    preferences.volume >= 0 &&
    preferences.volume <= 1 &&
    typeof preferences.muted === 'boolean' &&
    typeof preferences.shuffle === 'boolean' &&
    REPEAT_MODES.includes(preferences.repeat as string) &&
    isStringArray(preferences.favoriteKeys, MAX_SONGS_PER_PLAYLIST);
  if (!valid) return null;
  const { volume, muted, repeat, shuffle, favoriteKeys } = preferences;
  return { volume, muted, repeat, shuffle, favoriteKeys };
}

export default route(['GET', 'PUT'], async (req, res) => {
  const session = await readSession(req);
  if (!session) return sendError(res, 401, 'UNAUTHENTICATED');
  const sql = getSql();

  if (req.method === 'GET') {
    const [preferenceRows, playlistRows] = await Promise.all([
      sql`SELECT data FROM user_preferences WHERE user_id = ${session.userId}`,
      sql`SELECT id, name, song_keys FROM playlists WHERE user_id = ${session.userId} ORDER BY position`,
    ]);
    res.status(200).json({
      preferences: { ...DEFAULT_PREFERENCES, ...(preferenceRows[0]?.data ?? {}) },
      playlists: playlistRows.map((row) => ({ id: row.id, name: row.name, songKeys: row.song_keys })),
    });
    return;
  }

  const preferences = parsePreferences(req.body?.preferences);
  const playlists = parsePlaylists(req.body?.playlists);
  if (!preferences || !playlists) return sendError(res, 400, 'INVALID_STATE');

  await sql.transaction([
    sql`INSERT INTO user_preferences (user_id, data) VALUES (${session.userId}, ${JSON.stringify(preferences)}::jsonb)
        ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data`,
    sql`DELETE FROM playlists WHERE user_id = ${session.userId}`,
    ...playlists.map(
      (playlist, position) =>
        sql`INSERT INTO playlists (id, user_id, name, song_keys, position)
            VALUES (${playlist.id}, ${session.userId}, ${playlist.name}, ${JSON.stringify(playlist.songKeys)}::jsonb, ${position})`,
    ),
  ]);
  res.status(200).json({ ok: true });
});
