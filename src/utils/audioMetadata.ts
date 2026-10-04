import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';

export interface AudioTags {
  title?: string;
  artist?: string;
  album?: string;
  coverUrl?: string;
}

export function readDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = new Audio();
    probe.preload = 'metadata';
    probe.onloadedmetadata = () => resolve(probe.duration);
    probe.onerror = () => reject(new Error('AUDIO_UNREADABLE'));
    probe.src = url;
  });
}

export function readTags(file: File): Promise<AudioTags> {
  return new Promise((resolve) => {
    jsmediatags.read(file, {
      onSuccess: ({ tags }) => {
        const picture = tags.picture;
        const coverUrl = picture
          ? URL.createObjectURL(new Blob([new Uint8Array(picture.data)], { type: picture.format }))
          : undefined;
        resolve({ title: tags.title, artist: tags.artist, album: tags.album, coverUrl });
      },
      onError: () => resolve({}),
    });
  });
}
