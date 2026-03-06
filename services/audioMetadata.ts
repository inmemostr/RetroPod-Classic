// eslint-disable-next-line @typescript-eslint/no-explicit-any
import jsmediatags from 'jsmediatags';

export interface AudioMetadata {
  title: string | null;
  artist: string | null;
  album: string | null;
  coverBlob: Blob | null;
}

/**
 * Parse ID3/metadata tags from an audio file.
 * Supports ID3v1, ID3v2 (MP3), MP4/M4A, FLAC, Ogg.
 */
export function parseAudioMetadata(file: File): Promise<AudioMetadata> {
  return new Promise((resolve) => {
    (jsmediatags as any).read(file, {
      onSuccess(tag) {
        const tags = tag.tags;
        let coverBlob: Blob | null = null;

        // Extract embedded cover art (picture)
        const picture = tags.picture;
        if (picture && picture.data && picture.format) {
          // picture.data is an array of byte values
          const byteArray = new Uint8Array(picture.data);
          const mimeType = picture.format; // e.g. "image/jpeg", "image/png"
          coverBlob = new Blob([byteArray], { type: mimeType });
        }

        resolve({
          title: tags.title || null,
          artist: tags.artist || null,
          album: tags.album || null,
          coverBlob,
        });
      },
      onError() {
        // If parsing fails (unsupported format, corrupted file, etc.),
        // return null values and let the caller use defaults.
        resolve({
          title: null,
          artist: null,
          album: null,
          coverBlob: null,
        });
      },
    });
  });
}
