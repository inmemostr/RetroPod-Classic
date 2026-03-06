const DB_NAME = 'retropod-media';
const DB_VERSION = 1;
const AUDIO_STORE = 'audio-blobs';
const IMAGE_STORE = 'image-blobs';

let dbInstance: IDBDatabase | null = null;

export function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function storeBlob(
  storeName: typeof AUDIO_STORE | typeof IMAGE_STORE,
  id: string,
  blob: Blob
): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put({ id, blob, mimeType: blob.type });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getBlob(
  storeName: typeof AUDIO_STORE | typeof IMAGE_STORE,
  id: string
): Promise<Blob | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(id);
    req.onsuccess = () => {
      resolve(req.result ? req.result.blob : null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteBlob(
  storeName: typeof AUDIO_STORE | typeof IMAGE_STORE,
  id: string
): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// localStorage helpers for metadata
const SONGS_KEY = 'retropod-songs';
const PHOTOS_KEY = 'retropod-photos';

export function saveSongMetadata(songs: Array<{ id: string; title: string; artist: string; album: string; duration: number; coverUrl: string; url: string; sourceType: 'local' | 'remote' }>): void {
  // For local songs, don't persist blob URLs (they won't be valid next session)
  const serializable = songs.map(s => ({
    ...s,
    url: s.sourceType === 'local' ? '' : s.url,
    // Cover URLs from local cover blobs are also blob URLs; clear them
    coverUrl: s.coverUrl.startsWith('blob:') ? '' : s.coverUrl,
  }));
  localStorage.setItem(SONGS_KEY, JSON.stringify(serializable));
}

/** Key used to store cover art blob in IMAGE_STORE: `cover-{songId}` */
export function coverBlobId(songId: string): string {
  return `cover-${songId}`;
}

export function loadSongMetadata(): Array<{ id: string; title: string; artist: string; album: string; duration: number; coverUrl: string; url: string; sourceType: 'local' | 'remote' }> {
  const raw = localStorage.getItem(SONGS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePhotoMetadata(photos: Array<{ id: string; title: string; url: string; sourceType: 'local' | 'remote' }>): void {
  const serializable = photos.map(p => ({
    ...p,
    url: p.sourceType === 'local' ? '' : p.url,
  }));
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(serializable));
}

export function loadPhotoMetadata(): Array<{ id: string; title: string; url: string; sourceType: 'local' | 'remote' }> {
  const raw = localStorage.getItem(PHOTOS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export { AUDIO_STORE, IMAGE_STORE };
