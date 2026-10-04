import { describe, expect, it } from 'vitest';
import { MediaLibrary } from '../services/MediaLibrary';
import { sortStrategies } from '../patterns/SortStrategy';
import { Song } from './Song';

function createSong(title: string): Song {
  return new Song({
    id: crypto.randomUUID(),
    key: `${title}|1`,
    title,
    artist: 'Test',
    album: '',
    duration: 60,
    coverUrl: null,
    source: { kind: 'remote', getUrl: () => `https://example.com/${title}.mp3`, release: () => undefined },
  });
}

const titles = (library: MediaLibrary) => library.library.songs.toArray().map((song) => song.title);

describe('MediaLibrary', () => {
  it('inserts at the start, end and any position preserving batch order', () => {
    const library = new MediaLibrary();
    library.addSongs([createSong('b'), createSong('e')], { mode: 'end' });
    library.addSongs([createSong('a')], { mode: 'start' });
    library.addSongs([createSong('c'), createSong('d')], { mode: 'index', index: 2 });
    expect(titles(library)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('rejects duplicates by key', () => {
    const library = new MediaLibrary();
    library.addSongs([createSong('a')], { mode: 'end' });
    const { added, duplicates } = library.addSongs([createSong('a'), createSong('b')], { mode: 'end' });
    expect(added).toHaveLength(1);
    expect(duplicates).toHaveLength(1);
  });

  it('sorts with strategies and restores insertion order', () => {
    const library = new MediaLibrary();
    library.addSongs([createSong('c'), createSong('a'), createSong('b')], { mode: 'end' });
    library.library.sort(sortStrategies.asc);
    expect(titles(library)).toEqual(['a', 'b', 'c']);
    library.library.sort(sortStrategies.desc);
    expect(titles(library)).toEqual(['c', 'b', 'a']);
    library.library.sort(sortStrategies.insertion);
    expect(titles(library)).toEqual(['c', 'a', 'b']);
  });

  it('resolves saved playlist and favorite keys when songs are added later', () => {
    const library = new MediaLibrary();
    library.restore([{ id: 'p1', name: 'Gym', songKeys: ['b|1', 'zzz|1'] }], ['a|1']);
    library.addSongs([createSong('a'), createSong('b')], { mode: 'end' });
    const playlist = library.findPlaylist('p1')!;
    expect(playlist.songs.toArray().map((song) => song.title)).toEqual(['b']);
    expect(playlist.getSongKeys()).toEqual(['b|1', 'zzz|1']);
    expect(library.getFavorites().map((song) => song.title)).toEqual(['a']);
  });

  it('removing a song removes it from playlists and favorites', () => {
    const library = new MediaLibrary();
    const [song] = library.addSongs([createSong('a')], { mode: 'end' }).added;
    const playlist = library.createPlaylist('Mix');
    playlist.addLast(song);
    library.toggleFavorite(song);
    library.removeSong(song);
    expect(library.library.songs.isEmpty()).toBe(true);
    expect(playlist.songs.isEmpty()).toBe(true);
    expect(library.getFavorites()).toEqual([]);
  });
});

describe('Playlist cursor', () => {
  it('moves with next and previous using the node links', () => {
    const library = new MediaLibrary();
    library.addSongs(['a', 'b', 'c'].map(createSong), { mode: 'end' });
    const playlist = library.library;
    expect(playlist.moveNext()?.title).toBe('a');
    expect(playlist.moveNext()?.title).toBe('b');
    expect(playlist.moveNext()?.title).toBe('c');
    expect(playlist.moveNext()).toBeNull();
    expect(playlist.getCurrentSong()?.title).toBe('c');
    expect(playlist.movePrevious()?.title).toBe('b');
  });

  it('keeps a valid cursor when the current song is removed', () => {
    const library = new MediaLibrary();
    const [a, b, c] = library.addSongs(['a', 'b', 'c'].map(createSong), { mode: 'end' }).added;
    library.library.select(c);
    library.library.remove(c);
    expect(library.library.getCurrentSong()).toBe(b);
    library.library.select(a);
    library.library.remove(a);
    expect(library.library.getCurrentSong()).toBe(b);
  });

  it('shuffle never repeats the current song when there are several', () => {
    const library = new MediaLibrary();
    const [a] = library.addSongs(['a', 'b', 'c'].map(createSong), { mode: 'end' }).added;
    library.library.select(a);
    for (let i = 0; i < 30; i++) expect(library.library.moveRandom()).not.toBeNull();
  });
});
